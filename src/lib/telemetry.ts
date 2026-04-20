/**
 * Live Telemetry Types & Mock Simulator for DJI FlyCart 100
 *
 * Data flow:
 *   DJI Cloud API (MQTT) → /api/telemetry/ingest → DB + SSE broadcast
 *   LTE-GPS Tracker → /api/telemetry/bazl-redundancy → DB + SSE broadcast
 *   Demo mode → client-side simulator (this file)
 *
 * MQTT topic: thing/product/{device_sn}/osd (DJI Cloud API standard)
 */

import { DEMO_FLIGHTS, DEMO_DRONES, DEMO_BOOKINGS } from "@/lib/demo-data";

// ─── Types ──────────────────────────────────────────────────────────────────

export type TelemetrySource = "dji_cloud_api" | "lte_gps_tracker" | "manual" | "simulation";

export interface TelemetryWarning {
  code: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

/** Single telemetry report from a drone */
export interface TelemetryReport {
  droneSerial: string;
  droneId?: string;
  flightId?: string;

  // Position
  lat: number;
  lng: number;
  altitudeMslM: number;
  altitudeAglM: number;

  // Velocity
  speedKmh: number;
  headingDeg: number;
  verticalSpeedMps: number;

  // Battery (DB2160: 41 Ah, 52 V)
  batteryPct: number;
  batteryVoltageV: number;
  estimatedFlightTimeSec: number;

  // Payload & Winch
  payloadWeightKg: number;
  winchActive: boolean;
  cargoLocked: boolean;
  cargoTempC: number | null;

  // Signal quality
  signalStrengthPct: number;
  gpsAccuracyM: number;
  satelliteCount: number;

  // Warnings
  warnings: TelemetryWarning[];

  // Metadata
  source: TelemetrySource;
  deviceTimestamp: string;
  receivedAt: string;
}

/** Fleet-wide telemetry snapshot for the frontend */
export interface FleetTelemetrySnapshot {
  drones: TelemetryReport[];
  timestamp: string;
  sourceBreakdown: {
    djiCloudApi: number;
    lteGpsTracker: number;
    simulation: number;
  };
}

/** BAZL redundancy report from external LTE-GPS tracker */
export interface BAZLRedundancyReport {
  trackerImei: string;
  droneSerial: string;
  lat: number;
  lng: number;
  altitudeM: number;
  speedKmh: number;
  headingDeg: number;
  batteryPct: number;
  signalStrengthPct: number;
  timestamp: string;
}

// ─── DJI Cloud API MQTT Message Types ───────────────────────────────────────
// Based on DJI Cloud API v2 — thing/product/{sn}/osd topic

export interface DJICloudOSDMessage {
  tid: string;
  bid: string;
  timestamp: number;
  data: {
    latitude: number;
    longitude: number;
    height: number; // MSL altitude in meters
    elevation: number; // AGL altitude
    attitude_head: number; // heading 0-360
    horizontal_speed: number; // m/s
    vertical_speed: number; // m/s
    battery: {
      capacity_percent: number;
      voltage: number; // mV
      remain_flight_time: number; // seconds
    };
    payload_weight: number; // grams
    winch_state: number; // 0=idle, 1=active
    cargo_lock: number; // 0=unlocked, 1=locked
    cargo_temperature: number; // celsius
    wind_speed: number; // m/s
    signal_quality: number; // 0-100%
    gps_number: number; // satellite count
    position_accuracy: number; // meters
    mode_code: number; // 0=standby, 1=takeoff, 2=flying, 3=landing
    obstacle_avoidance: {
      front: number; // meters
      back: number;
      left: number;
      right: number;
      up: number;
    };
  };
}

// ─── Conversion ─────────────────────────────────────────────────────────────

export function djiOsdToTelemetry(
  sn: string,
  msg: DJICloudOSDMessage,
): TelemetryReport {
  const d = msg.data;
  const warnings: TelemetryWarning[] = [];

  if (d.battery.capacity_percent < 20) {
    warnings.push({ code: "BAT_LOW", severity: "critical", message: `Batterie kritisch: ${d.battery.capacity_percent}%` });
  } else if (d.battery.capacity_percent < 30) {
    warnings.push({ code: "BAT_WARN", severity: "warning", message: `Batterie niedrig: ${d.battery.capacity_percent}%` });
  }

  if (d.wind_speed > 10) {
    warnings.push({ code: "WIND_HIGH", severity: d.wind_speed > 12 ? "critical" : "warning", message: `Windgeschwindigkeit: ${d.wind_speed.toFixed(1)} m/s` });
  }

  if (d.signal_quality < 30) {
    warnings.push({ code: "SIGNAL_LOW", severity: "warning", message: `Signalstärke: ${d.signal_quality}%` });
  }

  for (const [dir, dist] of Object.entries(d.obstacle_avoidance)) {
    if (dist < 5) {
      warnings.push({ code: `OBS_${dir.toUpperCase()}`, severity: "critical", message: `Hindernis ${dir}: ${dist.toFixed(1)}m` });
    }
  }

  return {
    droneSerial: sn,
    lat: d.latitude,
    lng: d.longitude,
    altitudeMslM: d.height,
    altitudeAglM: d.elevation,
    speedKmh: d.horizontal_speed * 3.6,
    headingDeg: d.attitude_head,
    verticalSpeedMps: d.vertical_speed,
    batteryPct: d.battery.capacity_percent,
    batteryVoltageV: d.battery.voltage / 1000,
    estimatedFlightTimeSec: d.battery.remain_flight_time,
    payloadWeightKg: d.payload_weight / 1000,
    winchActive: d.winch_state === 1,
    cargoLocked: d.cargo_lock === 1,
    cargoTempC: d.cargo_temperature,
    signalStrengthPct: d.signal_quality,
    gpsAccuracyM: d.position_accuracy,
    satelliteCount: d.gps_number,
    warnings,
    source: "dji_cloud_api",
    deviceTimestamp: new Date(msg.timestamp).toISOString(),
    receivedAt: new Date().toISOString(),
  };
}

// ─── Mock Telemetry Simulator ───────────────────────────────────────────────

const ACTIVE_ROUTES = DEMO_FLIGHTS
  .filter((f) => f.status === "in_air" || f.status === "pre_flight_check")
  .map((f, i) => ({
    flightId: f.id,
    droneSerial: f.drone.serialNumber,
    droneId: f.drone.id,
    pickupLat: parseFloat(f.booking.pickupLat),
    pickupLng: parseFloat(f.booking.pickupLng),
    deliveryLat: parseFloat(f.booking.deliveryLat),
    deliveryLng: parseFloat(f.booking.deliveryLng),
    payloadKg: parseFloat(f.booking.payloadWeightKg),
    pilotName: f.booking.pilotName,
    identifier: f.booking.identifier,
    initialProgress: 0.15 + i * 0.2,
  }));

export function generateMockTelemetry(tickMs: number): FleetTelemetrySnapshot {
  const now = Date.now();
  const t = (now % 120000) / 120000; // 2-minute cycle

  const drones: TelemetryReport[] = ACTIVE_ROUTES.map((route, i) => {
    const progress = (t + route.initialProgress) % 1;
    const lat = route.pickupLat + (route.deliveryLat - route.pickupLat) * progress;
    const lng = route.pickupLng + (route.deliveryLng - route.pickupLng) * progress;

    // Realistic altitude profile: climb → cruise → descend
    let altAgl: number;
    if (progress < 0.1) altAgl = progress * 1200; // climb to 120m
    else if (progress > 0.9) altAgl = (1 - progress) * 1200; // descend
    else altAgl = 120 + Math.sin(progress * Math.PI * 6 + i) * 15; // cruise with turbulence

    const headingRad = Math.atan2(
      route.deliveryLng - route.pickupLng,
      route.deliveryLat - route.pickupLat,
    );
    const headingDeg = ((headingRad * 180) / Math.PI + 360) % 360;

    const batteryPct = Math.max(15, 95 - progress * 70 + i * 3);
    const batteryVoltageV = 48 + (batteryPct / 100) * 4; // 48-52V range

    const warnings: TelemetryWarning[] = [];
    if (batteryPct < 25) {
      warnings.push({ code: "BAT_LOW", severity: "warning", message: `Batterie niedrig: ${Math.round(batteryPct)}%` });
    }
    if (i === 0 && progress > 0.7) {
      warnings.push({ code: "WIND_HIGH", severity: "warning", message: "Windgeschwindigkeit: 10.5 m/s" });
    }

    return {
      droneSerial: route.droneSerial,
      droneId: route.droneId,
      flightId: route.flightId,
      lat,
      lng,
      altitudeMslM: altAgl + 580, // Interlaken ~580m MSL
      altitudeAglM: altAgl,
      speedKmh: 55 + Math.sin(progress * Math.PI * 4 + i) * 12,
      headingDeg,
      verticalSpeedMps: progress < 0.1 ? 3.5 : progress > 0.9 ? -3.5 : Math.sin(progress * Math.PI * 8) * 0.5,
      batteryPct: Math.round(batteryPct),
      batteryVoltageV: Math.round(batteryVoltageV * 10) / 10,
      estimatedFlightTimeSec: Math.round(batteryPct * 8.4), // ~14 min at 100%
      payloadWeightKg: route.payloadKg,
      winchActive: false,
      cargoLocked: true,
      cargoTempC: 18 + Math.sin(now / 10000) * 3,
      signalStrengthPct: Math.max(40, 95 - Math.random() * 15),
      gpsAccuracyM: 0.5 + Math.random() * 1.5,
      satelliteCount: 18 + Math.floor(Math.random() * 6),
      warnings,
      source: "simulation" as const,
      deviceTimestamp: new Date(now).toISOString(),
      receivedAt: new Date(now).toISOString(),
    };
  });

  return {
    drones,
    timestamp: new Date(now).toISOString(),
    sourceBreakdown: {
      djiCloudApi: 0,
      lteGpsTracker: 0,
      simulation: drones.length,
    },
  };
}

/** Validate an incoming DJI Cloud API MQTT ingest payload */
export function validateIngestPayload(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== "object") return { valid: false, error: "Body must be a JSON object" };
  const b = body as Record<string, unknown>;
  if (typeof b.droneSerial !== "string") return { valid: false, error: "droneSerial is required" };
  if (typeof b.lat !== "number" || b.lat < -90 || b.lat > 90) return { valid: false, error: "lat must be -90..90" };
  if (typeof b.lng !== "number" || b.lng < -180 || b.lng > 180) return { valid: false, error: "lng must be -180..180" };
  if (typeof b.altitudeMslM !== "number") return { valid: false, error: "altitudeMslM is required" };
  return { valid: true };
}

/** Validate BAZL redundancy report */
export function validateBAZLReport(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== "object") return { valid: false, error: "Body must be a JSON object" };
  const b = body as Record<string, unknown>;
  if (typeof b.trackerImei !== "string") return { valid: false, error: "trackerImei is required" };
  if (typeof b.droneSerial !== "string") return { valid: false, error: "droneSerial is required" };
  if (typeof b.lat !== "number" || b.lat < -90 || b.lat > 90) return { valid: false, error: "lat must be -90..90" };
  if (typeof b.lng !== "number" || b.lng < -180 || b.lng > 180) return { valid: false, error: "lng must be -180..180" };
  if (typeof b.altitudeM !== "number") return { valid: false, error: "altitudeM is required" };
  return { valid: true };
}
