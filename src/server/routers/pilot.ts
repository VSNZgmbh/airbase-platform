import { z } from "zod";
import { eq, asc, and, ne, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, pilotProcedure } from "@/lib/trpc/server";
import { flights, pilots, bookings, invoices, customers } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { PostFlightInvoice } from "@/emails/PostFlightInvoice";
import { format } from "date-fns";

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
      const year = now.getFullYear();

      // C2 + atomicity: wrap all mutations in a transaction.
      // Advisory lock serialises invoice number generation across concurrent requests,
      // preventing duplicate invoice numbers under the UNIQUE constraint.
      // Atomic WHERE on flights.status guards against a double-submit race.
      const result = await ctx.db.transaction(async (tx) => {
        // Acquire transaction-level advisory lock — released automatically at tx end.
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('voltair_invoice_seq'))`);

        // m1: store structured post-flight data in flightPlanJson (queryable jsonb),
        // keep notes column for human-readable free text only.
        const [updatedFlight] = await tx
          .update(flights)
          .set({
            status: "completed",
            actualArrival: now,
            flightPlanJson: {
              postFlight: {
                actualWeightKg: input.actualWeightKg,
                flightDurationMinutes: input.flightDurationMinutes,
                submittedAt: now.toISOString(),
              },
            },
            notes: input.notes ?? null,
            incidentReport: input.incidentReport ?? null,
            updatedAt: now,
          })
          // C2: atomic guard — only succeeds if the flight is not already completed.
          .where(and(eq(flights.id, input.flightId), ne(flights.status, "completed")))
          .returning();

        if (!updatedFlight) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Flug konnte nicht abgeschlossen werden — möglicherweise bereits abgeschlossen.",
          });
        }

        const [updatedBooking] = await tx
          .update(bookings)
          .set({ status: "completed", updatedAt: now })
          .where(eq(bookings.id, flight.bookingId))
          .returning();

        // C2: Generate invoice number atomically inside the locked transaction.
        // Using MAX over the year prefix avoids a separate sequence table or migration.
        const seqRows = await tx.execute(
          sql`SELECT COALESCE(MAX(CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)), 0) AS max_seq
              FROM invoices
              WHERE invoice_number LIKE ${`INV-${year}-%`}`
        ) as Array<{ max_seq: number }>;
        const nextSeq = (seqRows[0]?.max_seq ?? 0) + 1;
        const invoiceNumber = `INV-${year}-${String(nextSeq).padStart(4, "0")}`;

        const booking = updatedBooking;
        const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const [invoice] = await tx
          .insert(invoices)
          .values({
            bookingId: booking.id,
            customerId: booking.customerId,
            status: "sent",
            invoiceNumber,
            amountCHF: booking.subtotalCHF ?? "0",
            vatAmountCHF: booking.vatAmountCHF ?? "0",
            totalCHF: booking.totalCHF ?? "0",
            dueDate,
          })
          .returning();

        return { flight: updatedFlight, booking, invoice };
      });

      console.log(
        `[Pilot] Post-flight submitted for flight ${input.flightId}. Invoice ${result.invoice.invoiceNumber} generated.`
      );

      // Send invoice email to customer (fire-and-forget)
      const customer = await ctx.db.query.customers.findFirst({
        where: eq(customers.id, result.booking.customerId),
      });
      if (customer?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://voltair.one";
        const reportUrl = `${appUrl}/api/reports/flight/${input.flightId}`;
        sendEmail({
          to: customer.email,
          subject: `Rechnung ${result.invoice.invoiceNumber} — Ihr Flug ist abgeschlossen`,
          template: PostFlightInvoice,
          props: {
            customerName: `${customer.firstName} ${customer.lastName}`,
            bookingIdentifier: result.booking.identifier,
            invoiceNumber: result.invoice.invoiceNumber,
            serviceType: result.booking.serviceType,
            flightDate: format(now, "d. MMMM yyyy"),
            subtotalCHF: result.invoice.amountCHF,
            vatCHF: result.invoice.vatAmountCHF,
            totalCHF: result.invoice.totalCHF,
            dueDate: result.invoice.dueDate
              ? format(result.invoice.dueDate, "d. MMMM yyyy")
              : "—",
            reportUrl,
          },
        }).catch((err) => console.error("[Email] Failed to send invoice email:", err));
      }

      return result;
    }),
});
