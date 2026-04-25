/**
 * POST /api/telemetry/bazl — BAZL Redundancy API (LTE-GPS Fallback)
 *
 * Independent secondary telemetry endpoint receiving data from external
 * LTE-GPS trackers mounted on each DJI FlyCart 100 drone.
 *
 * Required by BAZL (Swiss Federal Office of Civil Aviation) for LUC compliance:
 * continuous position tracking must be maintained even if DJI Cloud API
 * primary link is lost. The LTE-GPS tracker provides cellular-based position
 * reporting via an independent data path.
 *
 * Auth: Bearer token (BAZL_TRACKER_API_KEY env var)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { droneTelemetry, droneLatestPosition } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { validateBAZLReport } from "@/lib/telemetry";
import type { BAZLRedundancyReport } from "@/lib/telemetry";

export async function POST(req: NextRequest) {
  // Auth check — reject if key is not configured or header does not match
  const authHeader = req.headers.get("authorization");
  const expectedKey = process.env.BAZL_TRACKER_API_KEY;
  if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = validateBAZLReport(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const report = body as BAZLRedundancyReport;

  try {
    // Write to telemetry log with lte_gps_tracker source
    await db.insert(droneTelemetry).values({
      droneSerial: report.droneSerial,
      lat: String(report.lat),
      lng: String(report.lng),
      altitudeMslM: String(report.altitudeM),
      speedKmh: report.speedKmh != null ? String(report.speedKmh) : null,
      headingDeg: report.headingDeg != null ? String(report.headingDeg) : null,
      batteryPct: report.batteryPct ?? null,
      signalStrengthPct: report.signalStrengthPct ?? null,
      source: "lte_gps_tracker",
      deviceTimestamp: report.timestamp ? new Date(report.timestamp) : null,
    });

    // Upsert latest position — only if newer than existing DJI Cloud API data
    // LTE-GPS is the fallback, so we only overwrite if DJI data is stale (>30s)
    await db
      .insert(droneLatestPosition)
      .values({
        droneSerial: report.droneSerial,
        lat: String(report.lat),
        lng: String(report.lng),
        altitudeMslM: String(report.altitudeM),
        speedKmh: report.speedKmh != null ? String(report.speedKmh) : null,
        headingDeg: report.headingDeg != null ? String(report.headingDeg) : null,
        batteryPct: report.batteryPct ?? null,
        signalStrengthPct: report.signalStrengthPct ?? null,
        source: "lte_gps_tracker",
        isAirborne: true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: droneLatestPosition.droneSerial,
        set: {
          lat: String(report.lat),
          lng: String(report.lng),
          altitudeMslM: String(report.altitudeM),
          speedKmh: report.speedKmh != null ? String(report.speedKmh) : null,
          headingDeg: report.headingDeg != null ? String(report.headingDeg) : null,
          batteryPct: report.batteryPct ?? null,
          signalStrengthPct: report.signalStrengthPct ?? null,
          source: "lte_gps_tracker",
          isAirborne: true,
          updatedAt: new Date(),
        },
        setWhere: sql`${droneLatestPosition.updatedAt} < now() - interval '30 seconds'`,
      });

    return NextResponse.json({
      status: "accepted",
      droneSerial: report.droneSerial,
      trackerImei: report.trackerImei,
      source: "lte_gps_tracker",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[telemetry/bazl] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", droneSerial: report.droneSerial },
      { status: 500 },
    );
  }
}

/**
 * GET /api/telemetry/bazl — Health check for BAZL compliance monitoring.
 * Returns the status of the redundancy endpoint.
 */
export async function GET() {
  return NextResponse.json({
    service: "AIRBASE BAZL Redundancy Telemetry API",
    status: "operational",
    compliance: "BAZL LUC — Independent Position Tracking",
    description: "Secondary telemetry endpoint for LTE-GPS tracker fallback",
    timestamp: new Date().toISOString(),
  });
}
