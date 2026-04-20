/**
 * POST /api/telemetry/ingest — DJI Cloud API MQTT Bridge
 *
 * Receives telemetry from the MQTT broker webhook (HTTP bridge).
 * The MQTT broker forwards DJI Cloud API OSD messages here.
 *
 * MQTT topic: thing/product/{device_sn}/osd
 * Auth: Bearer token (TELEMETRY_INGEST_API_KEY env var)
 *
 * Data flow:
 *   DJI FlyCart 100 → DJI Cloud API (MQTT) → MQTT Broker → HTTP Bridge → This endpoint → DB
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { droneTelemetry, droneLatestPosition } from "@/lib/db/schema";
import { validateIngestPayload } from "@/lib/telemetry";
import type { TelemetryReport } from "@/lib/telemetry";

export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  const expectedKey = process.env.TELEMETRY_INGEST_API_KEY;
  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Support single report or batch
  const reports: unknown[] = Array.isArray(body) ? body : [body];
  const results: { droneSerial: string; status: string }[] = [];

  for (const report of reports) {
    const validation = validateIngestPayload(report);
    if (!validation.valid) {
      results.push({ droneSerial: "unknown", status: `rejected: ${validation.error}` });
      continue;
    }

    const r = report as TelemetryReport;

    try {
      // Write to telemetry log
      await db.insert(droneTelemetry).values({
        droneId: r.droneId || null,
        flightId: r.flightId || null,
        droneSerial: r.droneSerial,
        lat: String(r.lat),
        lng: String(r.lng),
        altitudeMslM: String(r.altitudeMslM),
        altitudeAglM: r.altitudeAglM != null ? String(r.altitudeAglM) : null,
        speedKmh: r.speedKmh != null ? String(r.speedKmh) : null,
        headingDeg: r.headingDeg != null ? String(r.headingDeg) : null,
        verticalSpeedMps: r.verticalSpeedMps != null ? String(r.verticalSpeedMps) : null,
        batteryPct: r.batteryPct ?? null,
        batteryVoltageV: r.batteryVoltageV != null ? String(r.batteryVoltageV) : null,
        estimatedFlightTimeSec: r.estimatedFlightTimeSec ?? null,
        payloadWeightKg: r.payloadWeightKg != null ? String(r.payloadWeightKg) : null,
        winchActive: r.winchActive ?? false,
        cargoLocked: r.cargoLocked ?? true,
        cargoTempC: r.cargoTempC != null ? String(r.cargoTempC) : null,
        signalStrengthPct: r.signalStrengthPct ?? null,
        gpsAccuracyM: r.gpsAccuracyM != null ? String(r.gpsAccuracyM) : null,
        satelliteCount: r.satelliteCount ?? null,
        warnings: r.warnings ?? [],
        source: "dji_cloud_api",
        deviceTimestamp: r.deviceTimestamp ? new Date(r.deviceTimestamp) : null,
      });

      // Upsert latest position
      await db
        .insert(droneLatestPosition)
        .values({
          droneSerial: r.droneSerial,
          droneId: r.droneId || null,
          flightId: r.flightId || null,
          lat: String(r.lat),
          lng: String(r.lng),
          altitudeMslM: String(r.altitudeMslM),
          altitudeAglM: r.altitudeAglM != null ? String(r.altitudeAglM) : null,
          speedKmh: r.speedKmh != null ? String(r.speedKmh) : null,
          headingDeg: r.headingDeg != null ? String(r.headingDeg) : null,
          batteryPct: r.batteryPct ?? null,
          estimatedFlightTimeSec: r.estimatedFlightTimeSec ?? null,
          payloadWeightKg: r.payloadWeightKg != null ? String(r.payloadWeightKg) : null,
          winchActive: r.winchActive ?? false,
          cargoLocked: r.cargoLocked ?? true,
          signalStrengthPct: r.signalStrengthPct ?? null,
          warnings: r.warnings ?? [],
          source: "dji_cloud_api",
          isAirborne: true,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: droneLatestPosition.droneSerial,
          set: {
            droneId: r.droneId || null,
            flightId: r.flightId || null,
            lat: String(r.lat),
            lng: String(r.lng),
            altitudeMslM: String(r.altitudeMslM),
            altitudeAglM: r.altitudeAglM != null ? String(r.altitudeAglM) : null,
            speedKmh: r.speedKmh != null ? String(r.speedKmh) : null,
            headingDeg: r.headingDeg != null ? String(r.headingDeg) : null,
            batteryPct: r.batteryPct ?? null,
            estimatedFlightTimeSec: r.estimatedFlightTimeSec ?? null,
            payloadWeightKg: r.payloadWeightKg != null ? String(r.payloadWeightKg) : null,
            winchActive: r.winchActive ?? false,
            cargoLocked: r.cargoLocked ?? true,
            signalStrengthPct: r.signalStrengthPct ?? null,
            warnings: r.warnings ?? [],
            source: "dji_cloud_api",
            isAirborne: true,
            updatedAt: new Date(),
          },
        });

      results.push({ droneSerial: r.droneSerial, status: "accepted" });
    } catch (err) {
      console.error(`[telemetry/ingest] Error processing ${r.droneSerial}:`, err);
      results.push({ droneSerial: r.droneSerial, status: "error" });
    }
  }

  const accepted = results.filter((r) => r.status === "accepted").length;
  return NextResponse.json({
    processed: results.length,
    accepted,
    rejected: results.length - accepted,
    results,
  });
}
