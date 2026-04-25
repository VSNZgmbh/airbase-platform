-- Migration: drone_models table + drones FK + seed DJI FlyCart 100 / T200 placeholder
-- Part of AIR-260: Production readiness

-- ─── 1. Create drone_models config table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS "drone_models" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "manufacturer" text NOT NULL,
  "model_name" text NOT NULL UNIQUE,
  "category" text NOT NULL DEFAULT 'heavy_lift',

  -- Performance specs
  "max_payload_kg" numeric(6,2) NOT NULL,
  "max_takeoff_weight_kg" numeric(6,2) NOT NULL,
  "empty_weight_kg" numeric(6,2) NOT NULL,
  "max_range_km" numeric(6,2) NOT NULL,
  "max_speed_kmh" numeric(6,2) NOT NULL,
  "cruise_speed_kmh" numeric(6,2),
  "max_altitude_m" integer,
  "max_wind_speed_ms" numeric(5,1),

  -- Battery
  "battery_type" text,
  "battery_capacity_ah" numeric(6,2),
  "battery_voltage_v" numeric(6,2),
  "max_flight_time_min" integer,

  -- Dimensions
  "rotor_diameter_in" numeric(5,1),
  "folded_dimensions" text,

  -- Regulatory
  "mtom_class" text,
  "noise_class_db" numeric(5,1),

  "is_active" boolean NOT NULL DEFAULT true,
  "metadata" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- ─── 2. Add drone_model_id FK to drones table ──────────────────────────────

ALTER TABLE "drones" ADD COLUMN IF NOT EXISTS "drone_model_id" uuid REFERENCES "drone_models"("id");

-- ─── 3. Seed DJI FlyCart 100 (active) ──────────────────────────────────────

INSERT INTO "drone_models" (
  "manufacturer", "model_name", "category",
  "max_payload_kg", "max_takeoff_weight_kg", "empty_weight_kg",
  "max_range_km", "max_speed_kmh", "cruise_speed_kmh",
  "max_altitude_m", "max_wind_speed_ms",
  "battery_type", "battery_capacity_ah", "battery_voltage_v", "max_flight_time_min",
  "rotor_diameter_in", "folded_dimensions",
  "mtom_class", "noise_class_db",
  "is_active"
) VALUES (
  'DJI', 'DJI FlyCart 100', 'heavy_lift',
  30.00, 95.00, 65.00,
  16.00, 67.00, 54.00,
  6000, 12.0,
  'DB2160', 41.00, 52.00, 28,
  62.0, '2245×1355×690 mm',
  'uncertified', 85.0,
  true
) ON CONFLICT ("model_name") DO NOTHING;

-- ─── 4. Seed DJI T200/FC200 (inactive placeholder) ────────────────────────

INSERT INTO "drone_models" (
  "manufacturer", "model_name", "category",
  "max_payload_kg", "max_takeoff_weight_kg", "empty_weight_kg",
  "max_range_km", "max_speed_kmh", "cruise_speed_kmh",
  "max_altitude_m", "max_wind_speed_ms",
  "battery_type", "battery_capacity_ah", "battery_voltage_v", "max_flight_time_min",
  "mtom_class",
  "is_active",
  "metadata"
) VALUES (
  'DJI', 'DJI FlyCart 200 (T200/FC200)', 'heavy_lift',
  40.00, 120.00, 80.00,
  20.00, 72.00, 58.00,
  6000, 15.0,
  'DB2160-X', 52.00, 58.00, 35,
  'uncertified',
  false,
  '{"note": "Placeholder — specs are preliminary, pending board securing API access per S4.9"}'::jsonb
) ON CONFLICT ("model_name") DO NOTHING;

-- ─── 5. Link existing drones to DJI FlyCart 100 model ──────────────────────

UPDATE "drones"
SET "drone_model_id" = (SELECT "id" FROM "drone_models" WHERE "model_name" = 'DJI FlyCart 100')
WHERE "model" ILIKE '%FlyCart 100%' AND "drone_model_id" IS NULL;
