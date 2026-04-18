import { z } from "zod";
import { eq, desc, SQL } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, operatorProcedure } from "@/lib/trpc/server";
import { permits, flights, bookings, drones, pilots } from "@/lib/db/schema";
import { assessSora } from "@/lib/sora";

/**
 * Permit Router — Phase 5 Automation Engine
 *
 * Manages permit applications for BAZL/FOCA, Bern-Belp CTR,
 * and municipal authorities for DJI FlyCart 30 drone operations.
 */
export const permitRouter = createTRPCRouter({
  /**
   * List all permits, optionally filtered by flight or status.
   * Operator-only.
   */
  list: operatorProcedure
    .input(
      z.object({
        flightId: z.string().uuid().optional(),
        status: z
          .enum(["not_required", "pending", "submitted", "approved", "rejected"])
          .optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions: SQL[] = [];
      if (input.flightId) conditions.push(eq(permits.flightId, input.flightId));
      if (input.status) conditions.push(eq(permits.status, input.status));

      const results = await ctx.db.query.permits.findMany({
        where: conditions.length > 0
          ? (p, { and }) => and(...conditions)
          : undefined,
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(permits.createdAt)],
        with: {
          flight: {
            with: {
              booking: {
                with: { customer: true },
              },
              drone: true,
              pilot: true,
            },
          },
        },
      });

      return results;
    }),

  /**
   * Auto-generate permit applications for a flight based on SORA assessment.
   * Called when a booking is confirmed and a flight is assigned.
   */
  generateForFlight: operatorProcedure
    .input(
      z.object({
        flightId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const flight = await ctx.db.query.flights.findFirst({
        where: eq(flights.id, input.flightId),
        with: {
          booking: true,
          drone: true,
          pilot: true,
        },
      });

      if (!flight) throw new TRPCError({ code: "NOT_FOUND" });

      const booking = flight.booking;
      if (!booking) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kein Booking zu diesem Flug gefunden.",
        });
      }

      // Run SORA assessment
      const pickupLng = parseFloat(booking.pickupLng ?? booking.deliveryLng);
      const pickupLat = parseFloat(booking.pickupLat ?? booking.deliveryLat);
      const deliveryLng = parseFloat(booking.deliveryLng);
      const deliveryLat = parseFloat(booking.deliveryLat);

      const sora = assessSora({
        pickupLng,
        pickupLat,
        deliveryLng,
        deliveryLat,
      });

      // Update flight with SORA scores
      const sailToScore: Record<string, number> = {
        I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6,
      };
      const grcToInt = sora.grc;
      const arcToInt: Record<string, number> = { a: 1, b: 2, c: 3, d: 4 };

      await ctx.db
        .update(flights)
        .set({
          grcScore: grcToInt,
          arcScore: arcToInt[sora.arc],
          soraCategory: sora.category,
          updatedAt: new Date(),
        })
        .where(eq(flights.id, input.flightId));

      // Generate permit records based on SORA recommendations
      const createdPermits = [];

      for (const req of sora.recommendedPermits) {
        // Check if permit already exists for this flight + authority
        const existing = await ctx.db.query.permits.findFirst({
          where: (p, { and }) =>
            and(eq(p.flightId, input.flightId), eq(p.authority, req.authority)),
        });

        if (existing) {
          createdPermits.push(existing);
          continue;
        }

        const permitNotes = generatePermitApplicationText({
          bookingIdentifier: booking.identifier,
          serviceType: booking.serviceType,
          requestedDate: booking.requestedDate?.toISOString() ?? "",
          requestedTimeFrom: booking.requestedTimeFrom ?? "08:00",
          requestedTimeTo: booking.requestedTimeTo ?? "17:00",
          deliveryAddress: booking.deliveryAddress ?? "",
          pickupAddress: booking.pickupAddress ?? "",
          routeDistanceKm: booking.routeDistanceKm ?? "0",
          payloadWeightKg: booking.payloadWeightKg,
          droneModel: flight.drone?.model ?? "DJI FlyCart 30",
          droneSerial: flight.drone?.serialNumber ?? "—",
          pilotName: flight.pilot
            ? `${flight.pilot.firstName} ${flight.pilot.lastName}`
            : "—",
          authority: req.authority,
          permitType: req.type,
          grcScore: sora.grc,
          arcScore: arcToInt[sora.arc],
          soraCategory: sora.category,
        });

        const [permit] = await ctx.db
          .insert(permits)
          .values({
            flightId: input.flightId,
            authority: req.authority,
            status: "pending",
            notes: permitNotes,
          })
          .returning();

        createdPermits.push(permit);
      }

      console.log(
        `[Permit] Generated ${createdPermits.length} permit(s) for flight ${input.flightId}. ` +
        `SORA: GRC=${sora.grc}, ARC=${sora.arc}, SAIL=${sora.sail}`
      );

      return {
        permits: createdPermits,
        soraAssessment: sora,
      };
    }),

  /**
   * Update permit status (operator marks as submitted, approved, rejected).
   */
  updateStatus: operatorProcedure
    .input(
      z.object({
        permitId: z.string().uuid(),
        status: z.enum(["pending", "submitted", "approved", "rejected"]),
        referenceNumber: z.string().optional(),
        notes: z.string().optional(),
        approvedAt: z.string().datetime().optional(),
        expiresAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const permit = await ctx.db.query.permits.findFirst({
        where: eq(permits.id, input.permitId),
      });
      if (!permit) throw new TRPCError({ code: "NOT_FOUND" });

      const [updated] = await ctx.db
        .update(permits)
        .set({
          status: input.status,
          referenceNumber: input.referenceNumber ?? permit.referenceNumber,
          notes: input.notes ?? permit.notes,
          submittedAt: input.status === "submitted" ? new Date() : permit.submittedAt,
          approvedAt: input.approvedAt ? new Date(input.approvedAt) : permit.approvedAt,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : permit.expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(permits.id, input.permitId))
        .returning();

      return updated;
    }),

  /**
   * Get permit application text for a permit (ready to copy/send).
   */
  getApplicationText: operatorProcedure
    .input(z.object({ permitId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const permit = await ctx.db.query.permits.findFirst({
        where: eq(permits.id, input.permitId),
        with: {
          flight: {
            with: {
              booking: {
                with: { customer: true },
              },
              drone: true,
              pilot: true,
            },
          },
        },
      });

      if (!permit) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        permitId: permit.id,
        authority: permit.authority,
        status: permit.status,
        applicationText: permit.notes ?? "",
      };
    }),
});

// ─── Permit Application Template ──────────────────────────────────────────────

interface PermitApplicationParams {
  bookingIdentifier: string;
  serviceType: string;
  requestedDate: string;
  requestedTimeFrom: string;
  requestedTimeTo: string;
  deliveryAddress: string;
  pickupAddress: string;
  routeDistanceKm: string;
  payloadWeightKg: string;
  droneModel: string;
  droneSerial: string;
  pilotName: string;
  authority: string;
  permitType: string;
  grcScore: number;
  arcScore: number;
  soraCategory: string;
}

/**
 * Generate a BAZL/municipal permit application text in German (official language).
 */
function generatePermitApplicationText(p: PermitApplicationParams): string {
  const date = new Date(p.requestedDate);
  const dateStr = isNaN(date.getTime())
    ? p.requestedDate
    : date.toLocaleDateString("de-CH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  if (p.permitType === "SPECIFIC_AUTHORISATION") {
    return `BEWILLIGUNGSGESUCH — DROHNENOPERATION (SPECIFIC-KATEGORIE)
An: ${p.authority}
Datum: ${new Date().toLocaleDateString("de-CH")}
Referenz: ${p.bookingIdentifier}

Gesuchsteller:
  Airbase Aviation GmbH
  Drohnenlogistik Schweiz
  airbase.one

BETRIEBSDETAILS:
  Einsatztyp:         ${p.serviceType}
  Datum:              ${dateStr}
  Zeitfenster:        ${p.requestedTimeFrom} – ${p.requestedTimeTo} Uhr
  Abflugort:          ${p.pickupAddress || "AIRBASE Hub"}
  Zielort:            ${p.deliveryAddress}
  Routendistanz:      ${p.routeDistanceKm} km
  Nutzlast:           ${p.payloadWeightKg} kg

LUFTFAHRZEUG:
  Modell:             ${p.droneModel}
  Seriennummer:       ${p.droneSerial}
  MTOW:               95 kg
  Betriebskategorie:  SPECIFIC (gemäss EU-UAS-Verordnung 2019/945)

PILOT:
  Name:               ${p.pilotName}

SORA-BEWERTUNG:
  GRC (Ground Risk):  ${p.grcScore}
  ARC (Air Risk):     ${p.arcScore}
  Kategorie:          ${p.soraCategory}

Das Unternehmen Airbase Aviation GmbH verfügt über eine gültige Betriebsgenehmigung und alle notwendigen Versicherungen gemäss schweizerischem Recht.

Wir bitten um Genehmigung des oben beschriebenen Betriebs und stehen für Rückfragen zur Verfügung.

Mit freundlichen Grüssen
Airbase Aviation GmbH — Operations Team
ops@airbase.one | +41 XX XXX XX XX`;
  }

  if (p.permitType === "CTR_CLEARANCE") {
    return `LUFTRAUM-FREIGABEGESUCH — CTR BERN-BELP (LSZB)
An: ${p.authority}
Datum: ${new Date().toLocaleDateString("de-CH")}
Referenz: ${p.bookingIdentifier}

GESUCHSTELLER: Airbase Aviation GmbH — airbase.one

GEPLANTE OPERATION:
  Datum:         ${dateStr}
  Zeitfenster:   ${p.requestedTimeFrom} – ${p.requestedTimeTo} UTC
  Von:           ${p.pickupAddress || "AIRBASE Hub"}
  Nach:          ${p.deliveryAddress}
  Distanz:       ${p.routeDistanceKm} km
  Max. Höhe:     120 m AGL

LUFTFAHRZEUG:
  Typ:           UAS (Unbemannte Luftfahrtanlage) — ${p.droneModel}
  MTOW:          95 kg
  Serien-Nr.:    ${p.droneSerial}

PILOT:
  Fernpilot:     ${p.pilotName}

Wir ersuchen hiermit um eine vorübergehende Freigabe für die Durchquerung des CTR Bern-Belp (LSZB) im Rahmen der oben beschriebenen Drohnenoperation.

Die Operation erfolgt in Übereinstimmung mit den BAZL-Richtlinien und der SORA-Bewertung (GRC ${p.grcScore} / ARC ${p.arcScore}).

Airbase Aviation GmbH — Operations
ops@airbase.one`;
  }

  // Municipal / cantonal permit
  return `BEWILLIGUNGSGESUCH — DROHNENFLUG ÜBER SIEDLUNGSGEBIET
An: ${p.authority}
Datum: ${new Date().toLocaleDateString("de-CH")}
Referenz: ${p.bookingIdentifier}

GESUCHSTELLER: Airbase Aviation GmbH — airbase.one

GEPLANTE OPERATION:
  Einsatz:       ${p.serviceType}
  Datum:         ${dateStr}
  Zeitfenster:   ${p.requestedTimeFrom} – ${p.requestedTimeTo} Uhr
  Route:         ${p.pickupAddress || "AIRBASE Hub"} → ${p.deliveryAddress}
  Nutzlast:      ${p.payloadWeightKg} kg
  Drohne:        ${p.droneModel} (${p.droneSerial})

Die Operation erfolgt gemäss SORA-Bewertung (GRC ${p.grcScore}) mit allen notwendigen Sicherheitsmassnahmen.

Airbase Aviation GmbH — Operations
ops@airbase.one`;
}
