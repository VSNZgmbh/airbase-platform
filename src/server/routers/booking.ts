import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/lib/trpc/server";
import { bookings, customers, airbaseHubs } from "@/lib/db/schema";
import { createBookingSchema } from "@/lib/validations";
import { calculatePrice, type PickupOption } from "@/lib/pricing";

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

      // Calculate pricing
      const routeDistanceKm = 10; // TODO: Calculate from Google Maps API
      const price = calculatePrice({
        routeDistanceKm,
        payloadWeightKg: input.payloadWeightKg,
        pickupOption: input.pickupOption as PickupOption,
        pickupDistanceFromHubKm: 0,
      });

      // Generate booking identifier
      const year = new Date().getFullYear();
      const count = await ctx.db.$count(bookings);
      const identifier = `AIR-${year}-${String(count + 1).padStart(4, "0")}`;

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
          subtotalCHF: String(price.subtotal),
          vatPercent: String(price.vatPercent),
          vatAmountCHF: String(price.vatAmount),
          totalCHF: String(price.total),
          customerNotes: input.customerNotes,
        })
        .returning();

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
});
