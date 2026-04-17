import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, operatorProcedure } from "@/lib/trpc/server";
import { bookings, customers } from "@/lib/db/schema";
import Stripe from "stripe";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Stripe not configured (STRIPE_SECRET_KEY missing)",
    });
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export const operatorRouter = createTRPCRouter({
  // List all bookings (operator view)
  listBookings: operatorProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z
          .enum(["draft", "pending", "quoted", "confirmed", "in_progress", "completed", "cancelled"])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.query.bookings.findMany({
        where: input.status ? eq(bookings.status, input.status) : undefined,
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(bookings.createdAt)],
        with: {
          customer: true,
        },
      });
      return results;
    }),

  // Get a single booking with full details
  getBooking: operatorProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const booking = await ctx.db.query.bookings.findFirst({
        where: eq(bookings.id, input.id),
        with: {
          customer: true,
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
      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
      return booking;
    }),

  // Update operator notes on a booking
  updateNotes: operatorProcedure
    .input(
      z.object({
        bookingId: z.string().uuid(),
        operatorNotes: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(bookings)
        .set({ operatorNotes: input.operatorNotes, updatedAt: new Date() })
        .where(eq(bookings.id, input.bookingId))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
      return updated;
    }),

  // Approve booking: set status to quoted, create Stripe checkout, store URL in metadata
  approveBooking: operatorProcedure
    .input(
      z.object({
        bookingId: z.string().uuid(),
        operatorNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.query.bookings.findFirst({
        where: eq(bookings.id, input.bookingId),
        with: { customer: true },
      });

      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
      if (booking.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Booking is in status '${booking.status}', expected 'pending'`,
        });
      }

      const totalCHF = parseFloat(booking.totalCHF ?? "0");

      // M1: Do not silently swallow Stripe errors. If session creation fails the
      // booking stays 'pending' and the operator sees an actionable error message.
      const stripe = getStripe();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      let stripeSessionUrl: string | null = null;
      let stripeSessionId: string | null = null;

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "chf",
                product_data: {
                  name: `Drohnenflug ${booking.identifier}`,
                  description: `${booking.serviceType} – ${booking.payloadWeightKg} kg`,
                },
                unit_amount: Math.round(totalCHF * 100),
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${appUrl}/dashboard?payment=success&booking=${booking.id}`,
          cancel_url: `${appUrl}/dashboard?payment=cancelled&booking=${booking.id}`,
          metadata: { bookingId: booking.id },
          payment_intent_data: {
            metadata: { bookingId: booking.id },
          },
        });
        stripeSessionUrl = session.url;
        stripeSessionId = session.id;
        // TODO: Email stripeSessionUrl to customer (email provider not yet configured)
        console.log(`[Operator] Stripe checkout created for ${booking.identifier}: ${stripeSessionUrl}`);
      } catch (err) {
        console.error("[Operator] Stripe checkout creation failed:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Stripe-Zahlungslink konnte nicht erstellt werden. Bitte prüfen Sie die Stripe-Konfiguration und versuchen Sie es erneut.",
        });
      }

      const currentMeta = (booking.metadata as Record<string, unknown>) ?? {};

      // M4: Atomic check-and-update: WHERE clause includes status = 'pending' so a
      // concurrent approval request that already moved the row to 'quoted' will return
      // 0 rows, preventing double-Stripe-session creation from persisting and surfacing
      // a clear conflict error to the second operator.
      const [updated] = await ctx.db
        .update(bookings)
        .set({
          status: "quoted",
          operatorNotes: input.operatorNotes ?? booking.operatorNotes,
          metadata: {
            ...currentMeta,
            stripeSessionId,
            stripePaymentUrl: stripeSessionUrl,
          },
          updatedAt: new Date(),
        })
        .where(and(eq(bookings.id, input.bookingId), eq(bookings.status, "pending")))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Diese Buchung wurde bereits bearbeitet. Bitte laden Sie die Seite neu.",
        });
      }

      return { booking: updated, paymentUrl: stripeSessionUrl };
    }),

  // Reject booking: set status to cancelled
  rejectBooking: operatorProcedure
    .input(
      z.object({
        bookingId: z.string().uuid(),
        reason: z.string().min(1, "Bitte geben Sie einen Grund an"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.query.bookings.findFirst({
        where: eq(bookings.id, input.bookingId),
      });

      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
      if (!["pending", "quoted"].includes(booking.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot reject booking in status '${booking.status}'`,
        });
      }

      const currentMeta = (booking.metadata as Record<string, unknown>) ?? {};
      const [updated] = await ctx.db
        .update(bookings)
        .set({
          status: "cancelled",
          operatorNotes: input.reason,
          metadata: { ...currentMeta, rejectionReason: input.reason },
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, input.bookingId))
        .returning();

      // TODO: Email rejection reason to customer (email provider not yet configured)
      console.log(`[Operator] Booking ${booking.identifier} rejected: ${input.reason}`);

      return updated;
    }),
});
