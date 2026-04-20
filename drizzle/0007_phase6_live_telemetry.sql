-- Phase 6: Live Telemetry Tracking for DJI FlyCart 100
-- Backend architecture for real-time drone position tracking via MQTT + LTE-GPS fallback.
-- Run after 0006_accountable_manager_tier.sql

-- ─── Telemetry source enum ──────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "telemetry_source" AS ENUM (
    'dji_cloud_api',
    'lte_gps_tracker',
    'manual',
    'simulation'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Telemetry log table (high-write, append-only) ─────────────────────────

CREATE TABLE IF NOT EXISTS "drone_telemetry" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "drone_id" uuid REFERENCES "drones"("id"),
  "flight_id" uuid REFERENCES "flights"("id"),
  "drone_serial" text NOT NULL,

  -- Position (WGS84)
  "lat" numeric(10,7) NOT NULL,
  "lng" numeric(10,7) NOT NULL,
  "altitude_msl_m" numeric(8,2) NOT NULL,
  "altitude_agl_m" numeric(8,2),

  -- Velocity
  "speed_kmh" numeric(6,2),
  "heading_deg" numeric(6,2),
  "vertical_speed_mps" numeric(6,2),

  -- Battery (DB2160: 41 Ah, 52 V)
  "battery_pct" integer,
  "battery_voltage_v" numeric(6,2),
  "estimated_flight_time_sec" integer,

  -- Payload & Winch
  "payload_weight_kg" numeric(6,2),
  "winch_active" boolean DEFAULT false,
  "cargo_locked" boolean DEFAULT true,
  "cargo_temp_c" numeric(5,1),

  -- Signal quality
  "signal_strength_pct" integer,
  "gps_accuracy_m" numeric(6,2),
  "satellite_count" integer,

  -- Warnings (JSON array)
  "warnings" jsonb,

  -- Source & timestamps
  "source" telemetry_source NOT NULL,
  "device_timestamp" timestamp,
  "received_at" timestamp NOT NULL DEFAULT now()
);

-- Index for per-drone time-series queries
CREATE INDEX IF NOT EXISTS "idx_drone_telemetry_serial_received"
  ON "drone_telemetry" ("drone_serial", "received_at" DESC);

-- Index for flight-based queries
CREATE INDEX IF NOT EXISTS "idx_drone_telemetry_flight_id"
  ON "drone_telemetry" ("flight_id")
  WHERE "flight_id" IS NOT NULL;

-- ─── Latest position table (upserted on each report) ───────────────────────

CREATE TABLE IF NOT EXISTS "drone_latest_position" (
  "drone_serial" text PRIMARY KEY,
  "drone_id" uuid REFERENCES "drones"("id"),
  "flight_id" uuid REFERENCES "flights"("id"),

  "lat" numeric(10,7) NOT NULL,
  "lng" numeric(10,7) NOT NULL,
  "altitude_msl_m" numeric(8,2) NOT NULL,
  "altitude_agl_m" numeric(8,2),
  "speed_kmh" numeric(6,2),
  "heading_deg" numeric(6,2),
  "battery_pct" integer,
  "estimated_flight_time_sec" integer,
  "payload_weight_kg" numeric(6,2),
  "winch_active" boolean DEFAULT false,
  "cargo_locked" boolean DEFAULT true,
  "signal_strength_pct" integer,
  "warnings" jsonb,
  "source" telemetry_source NOT NULL,
  "is_airborne" boolean NOT NULL DEFAULT false,

  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Index for fleet-wide airborne snapshot
CREATE INDEX IF NOT EXISTS "idx_drone_latest_position_airborne"
  ON "drone_latest_position" ("is_airborne")
  WHERE "is_airborne" = true;
