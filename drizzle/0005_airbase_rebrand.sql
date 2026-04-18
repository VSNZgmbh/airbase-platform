-- AIRBASE Rebrand Migration
-- Reverses 0004 and establishes correct AIRBASE branding

-- 1. Rename the table back to airbase_hubs
ALTER TABLE "voltair_hubs" RENAME TO "airbase_hubs";

-- 2. Rename the enum value from VOLTAIR_HUB to AIRBASE_HUB
ALTER TYPE "pickup_option" RENAME VALUE 'VOLTAIR_HUB' TO 'AIRBASE_HUB';
