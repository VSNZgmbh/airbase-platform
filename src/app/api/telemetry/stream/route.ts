/**
 * GET /api/telemetry/stream — Server-Sent Events (SSE) for live telemetry
 *
 * Pushes fleet telemetry updates to the frontend every 2 seconds.
 * Works on Vercel (Edge/Serverless) — no WebSocket needed.
 *
 * Reads from drone_latest_position table (real data).
 * Falls back to simulated telemetry when DATABASE_URL is not set.
 *
 * Frontend connects with EventSource:
 *   const es = new EventSource("/api/telemetry/stream");
 *   es.onmessage = (e) => { const data = JSON.parse(e.data); ... };
 */

import { NextRequest } from "next/server";
import { generateMockTelemetry } from "@/lib/telemetry";
import type { TelemetryReport, FleetTelemetrySnapshot } from "@/lib/telemetry";

const INTERVAL_MS = 2000; // Push every 2 seconds
const MAX_DURATION_MS = 55000; // Close before Vercel 60s timeout

/** Read fleet snapshot from drone_latest_position table */
async function getFleetSnapshot(): Promise<FleetTelemetrySnapshot | null> {
  if (!process.env.DATABASE_URL) return null;

  try {
    // Dynamic import to avoid crashing when DATABASE_URL is not set
    const { db } = await import("@/lib/db");
    const { droneLatestPosition } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(droneLatestPosition)
      .where(eq(droneLatestPosition.isAirborne, true));

    if (rows.length === 0) return null;

    const drones: TelemetryReport[] = rows.map((r) => ({
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
    }));

    return {
      drones,
      timestamp: new Date().toISOString(),
      sourceBreakdown: {
        djiCloudApi: rows.filter((r) => r.source === "dji_cloud_api").length,
        lteGpsTracker: rows.filter((r) => r.source === "lte_gps_tracker").length,
        simulation: rows.filter((r) => r.source === "simulation").length,
      },
    };
  } catch {
    return null;
  }
}

/** Get fleet telemetry — real DB data with mock fallback */
async function getTelemetrySnapshot(): Promise<FleetTelemetrySnapshot> {
  const dbSnapshot = await getFleetSnapshot();
  if (dbSnapshot) return dbSnapshot;
  return generateMockTelemetry(Date.now());
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const startTime = Date.now();

      // Send initial snapshot immediately
      try {
        const snapshot = await getTelemetrySnapshot();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`),
        );
      } catch {
        // Skip if error
      }

      // Push updates at interval
      const interval = setInterval(async () => {
        if (closed || Date.now() - startTime > MAX_DURATION_MS) {
          clearInterval(interval);
          try { controller.close(); } catch { /* already closed */ }
          return;
        }

        try {
          const snapshot = await getTelemetrySnapshot();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`),
          );
        } catch {
          clearInterval(interval);
          try { controller.close(); } catch { /* already closed */ }
        }
      }, INTERVAL_MS);

      // Handle client disconnect via AbortSignal
      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
