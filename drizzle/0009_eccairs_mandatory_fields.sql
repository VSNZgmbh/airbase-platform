-- Migration: ECCAIRS/ADREP mandatory fields for EU Regulation 376/2014
-- Part of AIR-268: Extend safety_occurrences schema (SM-4, SM-5)

-- ─── 1. Phase-of-operation enum ────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "phase_of_operation" AS ENUM ('takeoff', 'cruise', 'landing', 'ground', 'hover');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 2. ECCAIRS mandatory fields on safety_occurrences ─────────────────────

ALTER TABLE "safety_occurrences"
  ADD COLUMN IF NOT EXISTS "incident_occurred_at" timestamp,
  ADD COLUMN IF NOT EXISTS "incident_lat" numeric(10,7),
  ADD COLUMN IF NOT EXISTS "incident_lng" numeric(10,7),
  ADD COLUMN IF NOT EXISTS "phase_of_operation" "phase_of_operation",
  ADD COLUMN IF NOT EXISTS "is_near_miss" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "root_cause" text,
  ADD COLUMN IF NOT EXISTS "contributing_factors" jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "corrective_actions" text,
  ADD COLUMN IF NOT EXISTS "investigated_by_user_id" text,
  ADD COLUMN IF NOT EXISTS "investigation_completed_at" timestamp,
  ADD COLUMN IF NOT EXISTS "bazl_notified_at" timestamp,
  ADD COLUMN IF NOT EXISTS "bazl_reference_number" text,
  ADD COLUMN IF NOT EXISTS "eccairs_report_id" text;

-- ─── 3. Retention metadata on safety_occurrences (5-year) ──────────────────

ALTER TABLE "safety_occurrences"
  ADD COLUMN IF NOT EXISTS "retention_expires_at" timestamp;

-- ─── 4. BAZL export + retention metadata on flight_authorizations (3-year) ─

ALTER TABLE "flight_authorizations"
  ADD COLUMN IF NOT EXISTS "bazl_exported_at" timestamp,
  ADD COLUMN IF NOT EXISTS "retention_expires_at" timestamp;

-- ─── 5. Retention metadata on drone_telemetry (1-year) ─────────────────────

ALTER TABLE "drone_telemetry"
  ADD COLUMN IF NOT EXISTS "retention_expires_at" timestamp;

-- ─── 6. Indexes for compliance queries ─────────────────────────────────────

CREATE INDEX IF NOT EXISTS "idx_safety_occ_incident_occurred"
  ON "safety_occurrences" ("incident_occurred_at");

CREATE INDEX IF NOT EXISTS "idx_safety_occ_bazl_reference"
  ON "safety_occurrences" ("bazl_reference_number")
  WHERE "bazl_reference_number" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_safety_occ_eccairs_report"
  ON "safety_occurrences" ("eccairs_report_id")
  WHERE "eccairs_report_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_safety_occ_near_miss"
  ON "safety_occurrences" ("is_near_miss")
  WHERE "is_near_miss" = true;

CREATE INDEX IF NOT EXISTS "idx_safety_occ_retention"
  ON "safety_occurrences" ("retention_expires_at")
  WHERE "retention_expires_at" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_flight_auth_retention"
  ON "flight_authorizations" ("retention_expires_at")
  WHERE "retention_expires_at" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_telemetry_retention"
  ON "drone_telemetry" ("retention_expires_at")
  WHERE "retention_expires_at" IS NOT NULL;
