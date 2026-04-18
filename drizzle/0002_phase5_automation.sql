-- Phase 5: Automation Engine — SORA risk surcharge + rush surcharge on bookings
-- Run after 0001_phase4_franchise_pricing.sql

-- Add SORA airspace complexity surcharge column to bookings
ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "sora_surcharge_chf" numeric(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "rush_surcharge_chf" numeric(10, 2) NOT NULL DEFAULT 0;

-- Index for permit lookups by flight and status
CREATE INDEX IF NOT EXISTS "permits_flight_id_idx" ON "permits" ("flight_id");
CREATE INDEX IF NOT EXISTS "permits_status_idx" ON "permits" ("status");
