-- Phase 5: LUC Safety Dashboard — Flight Authorization Engine + Safety Occurrence Reports
-- Run after 0002_phase5_automation.sql

-- ─── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "authorization_decision" AS ENUM ('approved', 'rejected', 'escalated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "authorization_decision_by" AS ENUM ('system', 'safety_manager');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "occurrence_severity" AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "occurrence_status" AS ENUM ('open', 'under_review', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Flight Authorizations ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "flight_authorizations" (
  "id"                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "booking_id"              uuid REFERENCES "bookings"("id"),
  "flight_id"               uuid REFERENCES "flights"("id"),
  "franchise_tenant_id"     uuid REFERENCES "franchise_tenants"("id"),

  -- Route
  "pickup_lat"              numeric(10, 7) NOT NULL,
  "pickup_lng"              numeric(10, 7) NOT NULL,
  "delivery_lat"            numeric(10, 7) NOT NULL,
  "delivery_lng"            numeric(10, 7) NOT NULL,
  "altitude_agl"            integer DEFAULT 120,

  -- Planned time
  "requested_for_datetime"  timestamp NOT NULL,

  -- SORA snapshot columns (denormalized for fast queries)
  "sail_level"              text,
  "grc_score"               integer,
  "arc_level"               text,
  "overall_risk"            text,

  -- Full JSON audit snapshots
  "sora_result_json"        jsonb,
  "weather_result_json"     jsonb,
  "notam_result_json"       jsonb,

  -- Decision
  "decision"                authorization_decision NOT NULL,
  "decision_reason"         text NOT NULL,
  "decision_by"             authorization_decision_by NOT NULL DEFAULT 'system',
  "decision_by_user_id"     text,
  "decided_at"              timestamp NOT NULL DEFAULT now(),

  "created_at"              timestamp NOT NULL DEFAULT now(),
  "updated_at"              timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "fa_tenant_idx"   ON "flight_authorizations" ("franchise_tenant_id");
CREATE INDEX IF NOT EXISTS "fa_decision_idx" ON "flight_authorizations" ("decision");
CREATE INDEX IF NOT EXISTS "fa_decided_at_idx" ON "flight_authorizations" ("decided_at" DESC);

-- ─── Safety Occurrence Reports ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "safety_occurrences" (
  "id"                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "flight_id"               uuid REFERENCES "flights"("id"),
  "authorization_id"        uuid REFERENCES "flight_authorizations"("id"),
  "franchise_tenant_id"     uuid REFERENCES "franchise_tenants"("id"),

  "title"                   text NOT NULL,
  "description"             text NOT NULL,
  "severity"                occurrence_severity NOT NULL DEFAULT 'medium',
  "category"                text NOT NULL DEFAULT 'operational',

  "reported_at"             timestamp NOT NULL DEFAULT now(),
  "reported_by_user_id"     text,

  "status"                  occurrence_status NOT NULL DEFAULT 'open',
  "resolution"              text,
  "resolved_at"             timestamp,

  "created_at"              timestamp NOT NULL DEFAULT now(),
  "updated_at"              timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "sor_tenant_idx"   ON "safety_occurrences" ("franchise_tenant_id");
CREATE INDEX IF NOT EXISTS "sor_status_idx"   ON "safety_occurrences" ("status");
CREATE INDEX IF NOT EXISTS "sor_severity_idx" ON "safety_occurrences" ("severity");
