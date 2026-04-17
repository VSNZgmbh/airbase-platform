import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, pilotProcedure } from "@/lib/trpc/server";
import { flights, pilots, bookings, invoices } from "@/lib/db/schema";

export const pilotRouter = createTRPCRouter({
  // Get flights assigned to the logged-in pilot
  myFlights: pilotProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const pilot = await ctx.db.query.pilots.findFirst({
        where: eq(pilots.clerkUserId, ctx.userId),
      });
      if (!pilot) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kein Piloten-Datensatz gefunden. Bitte wenden Sie sich an den Administrator.",
        });
      }

      const myFlights = await ctx.db.query.flights.findMany({
        where: eq(flights.pilotId, pilot.id),
        limit: input.limit,
        offset: input.offset,
        orderBy: [asc(flights.scheduledDeparture)],
        with: {
          booking: {
            with: { customer: true },
          },
          drone: true,
          permits: true,
        },
      });

      return { flights: myFlights, pilotId: pilot.id };
    }),

  // Submit post-flight log
  submitPostFlight: pilotProcedure
    .input(
      z.object({
        flightId: z.string().uuid(),
        actualWeightKg: z.number().min(0).max(100),
        flightDurationMinutes: z.number().min(1).max(480),
        notes: z.string().optional(),
        incidentReport: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify pilot owns this flight
      const pilot = await ctx.db.query.pilots.findFirst({
        where: eq(pilots.clerkUserId, ctx.userId),
      });
      if (!pilot) throw new TRPCError({ code: "NOT_FOUND" });

      const flight = await ctx.db.query.flights.findFirst({
        where: eq(flights.id, input.flightId),
        with: { booking: true },
      });

      if (!flight) throw new TRPCError({ code: "NOT_FOUND" });
      if (flight.pilotId !== pilot.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Dieser Flug ist Ihnen nicht zugewiesen." });
      }
      if (flight.status === "completed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Flug bereits abgeschlossen." });
      }

      const now = new Date();

      // Update flight record
      const [updatedFlight] = await ctx.db
        .update(flights)
        .set({
          status: "completed",
          actualArrival: now,
          notes: JSON.stringify({
            actualWeightKg: input.actualWeightKg,
            flightDurationMinutes: input.flightDurationMinutes,
            notes: input.notes ?? "",
            submittedAt: now.toISOString(),
          }),
          incidentReport: input.incidentReport ?? null,
          updatedAt: now,
        })
        .where(eq(flights.id, input.flightId))
        .returning();

      // Update booking status to completed
      const [updatedBooking] = await ctx.db
        .update(bookings)
        .set({ status: "completed", updatedAt: now })
        .where(eq(bookings.id, flight.bookingId))
        .returning();

      // Generate invoice
      const year = now.getFullYear();
      const invoiceCount = await ctx.db.$count(invoices);
      const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;

      const booking = updatedBooking;
      const subtotalCHF = booking.subtotalCHF ?? "0";
      const vatAmountCHF = booking.vatAmountCHF ?? "0";
      const totalCHF = booking.totalCHF ?? "0";

      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 30);

      const [invoice] = await ctx.db
        .insert(invoices)
        .values({
          bookingId: booking.id,
          customerId: booking.customerId,
          status: "sent",
          invoiceNumber,
          amountCHF: subtotalCHF,
          vatAmountCHF: vatAmountCHF,
          totalCHF: totalCHF,
          dueDate,
        })
        .returning();

      // TODO: Send invoice PDF to customer email (email provider not yet configured)
      console.log(`[Pilot] Post-flight submitted for flight ${input.flightId}. Invoice ${invoiceNumber} generated.`);

      return { flight: updatedFlight, booking, invoice };
    }),
});
