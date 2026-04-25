/**
 * Flight Assignment Router — automated drone + pilot assignment for flights.
 *
 * Algorithm:
 *  1. Find all active drones in the booking's tenant whose payload capacity
 *     meets the booking weight — prefer drones already linked to a drone_model
 *     so we can validate against catalog specs.
 *  2. Exclude drones that are currently in-air (have a flight with status
 *     'scheduled', 'pre_flight_check', or 'in_air' overlapping the time window).
 *  3. Find all active pilots in the tenant with valid licenses.
 *  4. Exclude pilots already assigned to overlapping flights.
 *  5. Score candidates and assign the best match.
 *
 * Operator-only — requires the operatorProcedure guard.
 */

import { z } from "zod";
import { and, eq, ne, inArray, gte, lte, or, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, operatorProcedure } from "@/lib/trpc/server";
import {
  flights,
  drones,
  pilots,
  bookings,
  droneModels,
} from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { PilotFlightAssignment } from "@/emails/PilotFlightAssignment";

const BUSY_FLIGHT_STATUSES = ["scheduled", "pre_flight_check", "in_air"] as const;
const ASSIGNABLE_STATUSES = ["pending_assignment", "scheduled"] as const;

export const flightAssignmentRouter = createTRPCRouter({
  /**
   * Auto-assign drone and pilot to a flight.
   * If drone/pilot IDs are provided, use those (manual override).
   * Otherwise, run the assignment algorithm.
   */
  assign: operatorProcedure
    .input(
      z.object({
        flightId: z.string().uuid(),
        droneId: z.string().uuid().optional(),
        pilotId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Load flight + booking
      const flight = await ctx.db.query.flights.findFirst({
        where: eq(flights.id, input.flightId),
        with: { booking: true },
      });
      if (!flight) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Flight not found" });
      }
      if (!ASSIGNABLE_STATUSES.includes(flight.status as typeof ASSIGNABLE_STATUSES[number])) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot assign resources to flight in status '${flight.status}'`,
        });
      }

      const booking = flight.booking;
      const requiredPayloadKg = parseFloat(booking.payloadWeightKg);
      const tenantId = booking.franchiseTenantId;

      // Tenant isolation — if the flight belongs to a tenant, caller must match
      if (tenantId !== null && tenantId !== ctx.tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to flights in this tenant.",
        });
      }

      let assignedDroneId = input.droneId ?? null;
      let assignedPilotId = input.pilotId ?? null;

      // Validate manual drone override belongs to the flight's tenant
      if (input.droneId) {
        const drone = await ctx.db.query.drones.findFirst({
          where: eq(drones.id, input.droneId),
        });
        if (!drone) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Drone not found" });
        }
        if (tenantId !== null && drone.franchiseTenantId !== tenantId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Drone does not belong to the flight's tenant.",
          });
        }
      }

      // Validate manual pilot override belongs to the flight's tenant
      if (input.pilotId) {
        const pilot = await ctx.db.query.pilots.findFirst({
          where: eq(pilots.id, input.pilotId),
        });
        if (!pilot) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Pilot not found" });
        }
        if (tenantId !== null && pilot.franchiseTenantId !== tenantId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Pilot does not belong to the flight's tenant.",
          });
        }
      }

      // 2. Auto-select drone if not manually specified
      if (!assignedDroneId) {
        assignedDroneId = await findBestDrone(ctx.db, {
          tenantId,
          requiredPayloadKg,
          scheduledDeparture: flight.scheduledDeparture,
          scheduledArrival: flight.scheduledArrival,
          excludeFlightId: flight.id,
        });
      }

      // 3. Auto-select pilot if not manually specified
      if (!assignedPilotId) {
        assignedPilotId = await findBestPilot(ctx.db, {
          tenantId,
          scheduledDeparture: flight.scheduledDeparture,
          scheduledArrival: flight.scheduledArrival,
          excludeFlightId: flight.id,
        });
      }

      if (!assignedDroneId && !assignedPilotId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No available drones or pilots found for this time window and payload requirements.",
        });
      }

      // 4. Update flight with assignments — transition to 'scheduled'
      const [updated] = await ctx.db
        .update(flights)
        .set({
          droneId: assignedDroneId,
          pilotId: assignedPilotId,
          status: "scheduled",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(flights.id, input.flightId),
            inArray(flights.status, [...ASSIGNABLE_STATUSES]),
          ),
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Flight was modified concurrently. Please reload.",
        });
      }

      // 5. Send assignment email to pilot (fire-and-forget — don't block the response)
      if (assignedPilotId) {
        const pilot = await ctx.db.query.pilots.findFirst({
          where: eq(pilots.id, assignedPilotId),
        });
        const drone = assignedDroneId
          ? await ctx.db.query.drones.findFirst({
              where: eq(drones.id, assignedDroneId),
            })
          : null;

        if (pilot?.email) {
          sendEmail({
            to: pilot.email,
            subject: `Neuer Flugauftrag ${booking.identifier} — AIRBASE`,
            template: PilotFlightAssignment,
            props: {
              pilotName: `${pilot.firstName} ${pilot.lastName}`,
              bookingIdentifier: booking.identifier,
              serviceType: booking.serviceType,
              scheduledDeparture: flight.scheduledDeparture?.toISOString() ?? "TBD",
              payloadWeightKg: booking.payloadWeightKg,
              deliveryAddress: booking.deliveryAddress ?? "Siehe Buchungsdetails",
              droneModel: drone?.model ?? "Wird zugewiesen",
              soraCategory: flight.soraCategory ?? undefined,
              notes: booking.operatorNotes ?? undefined,
            },
          }).catch((err) => {
            console.error(`[FlightAssignment] Failed to send pilot email:`, err);
          });
        }
      }

      return {
        flight: updated,
        assignedDroneId,
        assignedPilotId,
        autoAssigned: {
          drone: !input.droneId && !!assignedDroneId,
          pilot: !input.pilotId && !!assignedPilotId,
        },
      };
    }),

  /**
   * Preview available drones and pilots for a flight without assigning.
   */
  previewAvailability: operatorProcedure
    .input(z.object({ flightId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const flight = await ctx.db.query.flights.findFirst({
        where: eq(flights.id, input.flightId),
        with: { booking: true },
      });
      if (!flight) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Flight not found" });
      }

      const booking = flight.booking;
      const tenantId = booking.franchiseTenantId;
      const requiredPayloadKg = parseFloat(booking.payloadWeightKg);

      // Tenant isolation — if the flight belongs to a tenant, caller must match
      if (tenantId !== null && tenantId !== ctx.tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to flights in this tenant.",
        });
      }

      // Get all active drones for the tenant
      const tenantDrones = tenantId
        ? await ctx.db.query.drones.findMany({
            where: and(eq(drones.isActive, true), eq(drones.franchiseTenantId, tenantId)),
          })
        : await ctx.db.query.drones.findMany({
            where: eq(drones.isActive, true),
          });

      // Get busy drone IDs
      const busyDroneIds = await getBusyDroneIds(
        ctx.db,
        flight.scheduledDeparture,
        flight.scheduledArrival,
        flight.id,
      );

      const availableDrones = tenantDrones
        .filter((d) => parseFloat(d.maxPayloadKg) >= requiredPayloadKg)
        .map((d) => ({
          ...d,
          isAvailable: !busyDroneIds.has(d.id),
          meetsPayloadRequirement: true,
        }));

      // Get all active pilots for the tenant
      const tenantPilots = tenantId
        ? await ctx.db.query.pilots.findMany({
            where: and(eq(pilots.isActive, true), eq(pilots.franchiseTenantId, tenantId)),
          })
        : await ctx.db.query.pilots.findMany({
            where: eq(pilots.isActive, true),
          });

      const busyPilotIds = await getBusyPilotIds(
        ctx.db,
        flight.scheduledDeparture,
        flight.scheduledArrival,
        flight.id,
      );

      const availablePilots = tenantPilots.map((p) => ({
        ...p,
        isAvailable: !busyPilotIds.has(p.id),
        hasValidLicense: !p.licenseExpiry || p.licenseExpiry > new Date(),
      }));

      return {
        drones: availableDrones,
        pilots: availablePilots,
        requiredPayloadKg,
        timeWindow: {
          departure: flight.scheduledDeparture?.toISOString() ?? null,
          arrival: flight.scheduledArrival?.toISOString() ?? null,
        },
      };
    }),
});

// ─── Assignment helpers ─────────────────────────────────────────────────────

type DB = Parameters<Parameters<typeof operatorProcedure.mutation>[0]>[0]["ctx"]["db"];

async function getBusyDroneIds(
  db: DB,
  departure: Date | null,
  arrival: Date | null,
  excludeFlightId: string,
): Promise<Set<string>> {
  if (!departure) return new Set();

  const effectiveArrival = arrival ?? new Date(departure.getTime() + 2 * 60 * 60 * 1000);

  const busyFlights = await db
    .select({ droneId: flights.droneId })
    .from(flights)
    .where(
      and(
        ne(flights.id, excludeFlightId),
        inArray(flights.status, [...BUSY_FLIGHT_STATUSES]),
        // Overlapping time window
        or(
          // Flight starts during our window
          and(gte(flights.scheduledDeparture, departure), lte(flights.scheduledDeparture, effectiveArrival)),
          // Flight ends during our window
          and(gte(flights.scheduledArrival, departure), lte(flights.scheduledArrival, effectiveArrival)),
          // Flight spans our entire window
          and(lte(flights.scheduledDeparture, departure), gte(flights.scheduledArrival, effectiveArrival)),
        ),
      ),
    );

  return new Set(busyFlights.map((f) => f.droneId).filter(Boolean) as string[]);
}

async function getBusyPilotIds(
  db: DB,
  departure: Date | null,
  arrival: Date | null,
  excludeFlightId: string,
): Promise<Set<string>> {
  if (!departure) return new Set();

  const effectiveArrival = arrival ?? new Date(departure.getTime() + 2 * 60 * 60 * 1000);

  const busyFlights = await db
    .select({ pilotId: flights.pilotId })
    .from(flights)
    .where(
      and(
        ne(flights.id, excludeFlightId),
        inArray(flights.status, [...BUSY_FLIGHT_STATUSES]),
        or(
          and(gte(flights.scheduledDeparture, departure), lte(flights.scheduledDeparture, effectiveArrival)),
          and(gte(flights.scheduledArrival, departure), lte(flights.scheduledArrival, effectiveArrival)),
          and(lte(flights.scheduledDeparture, departure), gte(flights.scheduledArrival, effectiveArrival)),
        ),
      ),
    );

  return new Set(busyFlights.map((f) => f.pilotId).filter(Boolean) as string[]);
}

async function findBestDrone(
  db: DB,
  opts: {
    tenantId: string | null;
    requiredPayloadKg: number;
    scheduledDeparture: Date | null;
    scheduledArrival: Date | null;
    excludeFlightId: string;
  },
): Promise<string | null> {
  // Get active drones for the tenant
  const candidates = opts.tenantId
    ? await db.query.drones.findMany({
        where: and(eq(drones.isActive, true), eq(drones.franchiseTenantId, opts.tenantId)),
      })
    : await db.query.drones.findMany({
        where: eq(drones.isActive, true),
      });

  // Filter by payload capacity
  const capable = candidates.filter(
    (d) => parseFloat(d.maxPayloadKg) >= opts.requiredPayloadKg,
  );

  if (capable.length === 0) return null;

  // Exclude busy drones
  const busyIds = await getBusyDroneIds(
    db,
    opts.scheduledDeparture,
    opts.scheduledArrival,
    opts.excludeFlightId,
  );

  const available = capable.filter((d) => !busyIds.has(d.id));
  if (available.length === 0) return null;

  // Prefer the drone with the smallest surplus capacity (best fit)
  available.sort(
    (a, b) => parseFloat(a.maxPayloadKg) - parseFloat(b.maxPayloadKg),
  );

  return available[0].id;
}

async function findBestPilot(
  db: DB,
  opts: {
    tenantId: string | null;
    scheduledDeparture: Date | null;
    scheduledArrival: Date | null;
    excludeFlightId: string;
  },
): Promise<string | null> {
  const candidates = opts.tenantId
    ? await db.query.pilots.findMany({
        where: and(eq(pilots.isActive, true), eq(pilots.franchiseTenantId, opts.tenantId)),
      })
    : await db.query.pilots.findMany({
        where: eq(pilots.isActive, true),
      });

  // Filter by valid license
  const licensed = candidates.filter(
    (p) => !p.licenseExpiry || p.licenseExpiry > new Date(),
  );

  if (licensed.length === 0) return null;

  // Exclude busy pilots
  const busyIds = await getBusyPilotIds(
    db,
    opts.scheduledDeparture,
    opts.scheduledArrival,
    opts.excludeFlightId,
  );

  const available = licensed.filter((p) => !busyIds.has(p.id));
  if (available.length === 0) return null;

  // Prefer pilots with higher certifications (STS-01 > A2 > A1/A3)
  available.sort((a, b) => {
    const scoreA = (a.sts01Certified ? 4 : 0) + (a.soraA2Certified ? 2 : 0) + (a.soraA1A3Certified ? 1 : 0);
    const scoreB = (b.sts01Certified ? 4 : 0) + (b.soraA2Certified ? 2 : 0) + (b.soraA1A3Certified ? 1 : 0);
    return scoreB - scoreA;
  });

  return available[0].id;
}
