-- Migration: Add 'pending_assignment' to flight_status enum
-- Part of AIR-269: Flight resource assignment (drone + pilot)
--
-- Flights are now created with status 'pending_assignment' after Stripe payment.
-- When an operator assigns drone + pilot via flightAssignment.assign(), the
-- status transitions to 'scheduled'.

ALTER TYPE "flight_status" ADD VALUE IF NOT EXISTS 'pending_assignment' BEFORE 'scheduled';
