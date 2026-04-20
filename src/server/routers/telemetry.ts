/**
 * Telemetry tRPC Router — query endpoints for drone fleet telemetry.
 *
 * Read-side of the telemetry pipeline. Write-side is handled by REST endpoints:
 *   - POST /api/telemetry/ingest      (DJI Cloud API MQTT bridge)
 *   - POST /api/telemetry/bazl        (BAZL redundancy LTE-GPS tracker)
 *
 * Falls back to simulated demo data when DATABASE_URL is not configured.
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server";
import { desc, eq, and, gte } from "drizzle-orm";
import { droneTelemetry, droneLatestPosition } from "@/lib/db/schema";
import { generateMockTelemetry } from "@/lib/telemetry";
import type { TelemetryReport, FleetTelemetrySnapshot } from "@/lib/telemetry";

export const telemetryRouter = createTRPCRouter({
  /**
   * Get latest position for all airborne drones.
   * Returns mock data in demo mode.
   */
  getFleetPositions: publicProcedure.query(async ({ ctx }): Promise<FleetTelemetrySnapshot> => {
    try {
      const rows = await ctx.db
        .select()
        .from(droneLatestPosition)
        .where(eq(droneLatestPosition.isAirborne, true));

      if (rows.length > 0) {
        return {
          drones: rows.map(rowToTelemetryReport),
          timestamp: new Date().toISOString(),
          sourceBreakdown: {
            djiCloudApi: rows.filter((r) => r.source === "dji_cloud_api").length,
            lteGpsTracker: rows.filter((r) => r.source === "lte_gps_tracker").length,
            simulation: rows.filter((r) => r.source === "simulation").length,
          },
        };
      }
    } catch {
      // DB unavailable — fall through to demo data
    }

    return generateMockTelemetry(Date.now());
  }),

  /**
   * Get telemetry history for a specific drone (last N minutes).
   */
  getDroneHistory: publicProcedure
    .input(
      z.object({
        droneSerial: z.string(),
        minutesBack: z.number().min(1).max(1440).default(30),
        limit: z.number().min(1).max(5000).default(500),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const since = new Date(Date.now() - input.minutesBack * 60 * 1000);
        const rows = await ctx.db
          .select()
          .from(droneTelemetry)
          .where(
            and(
              eq(droneTelemetry.droneSerial, input.droneSerial),
              gte(droneTelemetry.receivedAt, since),
            ),
          )
          .orderBy(desc(droneTelemetry.receivedAt))
          .limit(input.limit);

        return {
          points: rows.map((r) => ({
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lng),
            altitudeMslM: parseFloat(r.altitudeMslM),
            altitudeAglM: r.altitudeAglM ? parseFloat(r.altitudeAglM) : null,
            speedKmh: r.speedKmh ? parseFloat(r.speedKmh) : null,
            batteryPct: r.batteryPct,
            headingDeg: r.headingDeg ? parseFloat(r.headingDeg) : null,
            source: r.source,
            timestamp: r.receivedAt.toISOString(),
          })),
          droneSerial: input.droneSerial,
          fromTime: since.toISOString(),
          toTime: new Date().toISOString(),
        };
      } catch {
        return {
          points: [],
          droneSerial: input.droneSerial,
          fromTime: new Date().toISOString(),
          toTime: new Date().toISOString(),
        };
      }
    }),

  /**
   * Get latest position for a single drone.
   */
  getDronePosition: publicProcedure
    .input(z.object({ droneSerial: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const row = await ctx.db
          .select()
          .from(droneLatestPosition)
          .where(eq(droneLatestPosition.droneSerial, input.droneSerial))
          .limit(1);

        if (row.length > 0) {
          return { position: rowToTelemetryReport(row[0]) };
        }
      } catch {
        // DB unavailable
      }

      // Fall back to mock
      const mock = generateMockTelemetry(Date.now());
      const drone = mock.drones.find((d) => d.droneSerial === input.droneSerial);
      return { position: drone ?? null };
    }),
});

function rowToTelemetryReport(r: typeof droneLatestPosition.$inferSelect): TelemetryReport {
  return {
    droneSerial: r.droneSerial,
    droneId: r.droneId ?? undefined,
    flightId: r.flightId ?? undefined,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lng),
    altitudeMslM: parseFloat(r.altitudeMslM),
    altitudeAglM: r.altitudeAglM ? parseFloat(r.altitudeAglM) : 0,
    speedKmh: r.speedKmh ? parseFloat(r.speedKmh) : 0,
    headingDeg: r.headingDeg ? parseFloat(r.headingDeg) : 0,
    verticalSpeedMps: 0,
    batteryPct: r.batteryPct ?? 0,
    batteryVoltageV: 0,
    estimatedFlightTimeSec: r.estimatedFlightTimeSec ?? 0,
    payloadWeightKg: r.payloadWeightKg ? parseFloat(r.payloadWeightKg) : 0,
    winchActive: r.winchActive ?? false,
    cargoLocked: r.cargoLocked ?? true,
    cargoTempC: null,
    signalStrengthPct: r.signalStrengthPct ?? 0,
    gpsAccuracyM: 0,
    satelliteCount: 0,
    warnings: (r.warnings ?? []) as TelemetryReport["warnings"],
    source: r.source,
    deviceTimestamp: r.updatedAt.toISOString(),
    receivedAt: r.updatedAt.toISOString(),
  };
}
