import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/lib/trpc/server";
import { bookings, customers, airbaseHubs } from "@/lib/db/schema";
import { createBookingSchema } from "@/lib/validations";
import { calculatePrice, type PickupOption } from "@/lib/pricing";
import { assessSora, soraAirspaceSurchargeCHF, isRushBooking } from "@/lib/sora";
import { sendEmail } from "@/lib/email";
import { OperatorNewBooking } from "@/emails/OperatorNewBooking";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const bookingRouter = createTRPCRouter({
  // Get all hubs (for pickup option B)
  getHubs: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(airbaseHubs).where(eq(airbaseHubs.isActive, true));
  }),

  // Create a new booking (requires auth)
  create: protectedProcedure
    .input(createBookingSchema)
    .mutation(async ({ ctx, input }) => {
      // Get or create customer record
      let customer = await ctx.db.query.customers.findFirst({
        where: eq(customers.clerkUserId, ctx.userId),
      });

      if (!customer) {
        const [newCustomer] = await ctx.db
          .insert(customers)
          .values({
            clerkUserId: ctx.userId,
            email: "", // Will be populated from Clerk webhook
          })
          .returning();
        customer = newCustomer;
      }

      // Calculate pricing with SORA + rush surcharges
      const routeDistanceKm = input.routeDistanceKm ?? 10;

      // SORA assessment (if coordinates available)
      let soraSurcharge = 0;
      if (input.pickupLat && input.pickupLng && input.deliveryLat && input.deliveryLng) {
        const soraResult = assessSora({
          pickupLng: input.pickupLng,
          pickupLat: input.pickupLat,
          deliveryLng: input.deliveryLng,
          deliveryLat: input.deliveryLat,
        });
        soraSurcharge = soraAirspaceSurchargeCHF(soraResult.sail);
      }

      const rush = isRushBooking(input.requestedDate, input.requestedTimeFrom);

      const price = calculatePrice({
        routeDistanceKm,
        payloadWeightKg: input.payloadWeightKg,
        pickupOption: input.pickupOption as PickupOption,
        pickupDistanceFromHubKm: 0,
        soraAirspaceSurchargeCHF: soraSurcharge,
        isRushBooking: rush,
      });

      // Generate booking identifier (UUID-based to avoid race condition on concurrent bookings)
      const year = new Date().getFullYear();
      const shortId = crypto.randomUUID().slice(0, 8).toUpperCase();
      const identifier = `AIR-${year}-${shortId}`;

      const [booking] = await ctx.db
        .insert(bookings)
        .values({
          identifier,
          customerId: customer.id,
          serviceType: input.serviceType,
          serviceSubtype: input.serviceSubtype,
          status: "pending",
          requestedDate: new Date(input.requestedDate),
          requestedTimeFrom: input.requestedTimeFrom,
          requestedTimeTo: input.requestedTimeTo,
          payloadWeightKg: String(input.payloadWeightKg),
          payloadDescription: input.payloadDescription,
          isDangerousGoods: input.isDangerousGoods,
          deliveryLat: String(input.deliveryLat),
          deliveryLng: String(input.deliveryLng),
          deliveryAddress: input.deliveryAddress,
          pickupOption: input.pickupOption,
          pickupLat: input.pickupLat ? String(input.pickupLat) : null,
          pickupLng: input.pickupLng ? String(input.pickupLng) : null,
          pickupAddress: input.pickupAddress,
          hubId: input.hubId,
          routeDistanceKm: String(routeDistanceKm),
          basePriceCHF: String(price.basePrice),
          weightSurchargeCHF: String(price.weightSurcharge),
          pickupSurchargeCHF: String(price.pickupSurcharge),
          soraSurchargeCHF: String(price.soraSurchargeCHF),
          rushSurchargeCHF: String(price.rushSurchargeCHF),
          subtotalCHF: String(price.subtotal),
          vatPercent: String(price.vatPercent),
          vatAmountCHF: String(price.vatAmount),
          totalCHF: String(price.total),
          customerNotes: input.customerNotes,
        })
        .returning();

      // Notify operator(s) about the new booking (fire-and-forget)
      const operatorEmail = process.env.OPERATOR_NOTIFICATION_EMAIL;
      if (operatorEmail) {
        const customerName = customer.firstName && customer.lastName
          ? `${customer.firstName} ${customer.lastName}`
          : customer.email || "Unbekannt";

        sendEmail({
          to: operatorEmail,
          subject: `Neue Buchungsanfrage ${identifier} — AIRBASE`,
          template: OperatorNewBooking,
          props: {
            bookingIdentifier: identifier,
            customerName,
            serviceType: input.serviceType,
            requestedDate: format(new Date(input.requestedDate), "d. MMMM yyyy", { locale: de }),
            payloadWeightKg: String(input.payloadWeightKg),
            deliveryAddress: input.deliveryAddress ?? "Siehe Buchungsdetails",
            totalCHF: String(price.total),
          },
        }).catch((err) => {
          console.error("[Booking] Failed to send OperatorNewBooking email:", err);
        });
      }

      return booking;
    }),

  // Get customer's own bookings
  myBookings: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.query.customers.findFirst({
        where: eq(customers.clerkUserId, ctx.userId),
      });

      if (!customer) return { bookings: [], total: 0 };

      const results = await ctx.db.query.bookings.findMany({
        where: eq(bookings.customerId, customer.id),
        limit: input.limit,
        offset: input.offset,
        orderBy: (b, { desc }) => [desc(b.createdAt)],
      });

      return { bookings: results, total: results.length };
    }),

  // Get single booking by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.query.customers.findFirst({
        where: eq(customers.clerkUserId, ctx.userId),
      });

      if (!customer) throw new TRPCError({ code: "NOT_FOUND" });

      const booking = await ctx.db.query.bookings.findFirst({
        where: eq(bookings.id, input.id),
        with: {
          flights: {
            with: {
              pilot: true,
              drone: true,
              permits: true,
            },
          },
          invoices: true,
        },
      });

      if (!booking || booking.customerId !== customer.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return booking;
    }),

  // Confirm delivery receipt — customer confirms they received the goods
  confirmDelivery: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().uuid(),
        signature: z.string().min(1).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.db.query.customers.findFirst({
        where: eq(customers.clerkUserId, ctx.userId),
      });
      if (!customer) throw new TRPCError({ code: "NOT_FOUND" });

      const booking = await ctx.db.query.bookings.findFirst({
        where: eq(bookings.id, input.bookingId),
      });

      if (!booking || booking.customerId !== customer.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (booking.status !== "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Lieferbestätigung nur im Status 'completed' möglich (aktuell: '${booking.status}').`,
        });
      }

      const now = new Date();

      // Atomic transition: completed → delivery_confirmed
      const [updated] = await ctx.db
        .update(bookings)
        .set({
          status: "delivery_confirmed",
          metadata: {
            ...(booking.metadata as Record<string, unknown> ?? {}),
            deliveryConfirmation: {
              confirmedAt: now.toISOString(),
              customerId: customer.id,
              signature: input.signature ?? null,
              notes: input.notes ?? null,
            },
          },
          updatedAt: now,
        })
        .where(and(eq(bookings.id, input.bookingId), eq(bookings.status, "completed")))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lieferbestätigung konnte nicht verarbeitet werden — Status wurde gleichzeitig geändert.",
        });
      }

      console.log(
        `[Booking] Delivery confirmed for booking ${booking.identifier} by customer ${customer.id}.`
      );

      return { booking: updated };
    }),
});
