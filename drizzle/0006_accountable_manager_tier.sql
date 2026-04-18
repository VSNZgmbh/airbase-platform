-- Phase 5.1: Accountable Manager Approval Tier (BAZL LUC / EASA Art. 12 AMC1)
-- Adds three-tier authorization: System → Safety Manager → Accountable Manager
-- Run after 0005_airbase_rebrand.sql

-- ─── Add 'accountable_manager' to authorization_decision_by enum ─────────────

ALTER TYPE "authorization_decision_by" ADD VALUE IF NOT EXISTS 'accountable_manager';

-- ─── Add Safety Manager intermediate decision columns ────────────────────────
-- These track the Safety Manager's approval before escalation to Accountable Manager.
-- Required for SAIL IV flights: SM approves first, then AM gives final sign-off.

ALTER TABLE "flight_authorizations"
  ADD COLUMN IF NOT EXISTS "safety_manager_decision" authorization_decision,
  ADD COLUMN IF NOT EXISTS "safety_manager_user_id" text,
  ADD COLUMN IF NOT EXISTS "safety_manager_decided_at" timestamp;
