-- VOLTAIR Rebrand Migration
-- Renames airbase_hubs table and AIRBASE_HUB enum value

-- 1. Rename the table
ALTER TABLE "airbase_hubs" RENAME TO "voltair_hubs";

-- 2. Rename the enum value from AIRBASE_HUB to VOLTAIR_HUB
ALTER TYPE "pickup_option" RENAME VALUE 'AIRBASE_HUB' TO 'VOLTAIR_HUB';
