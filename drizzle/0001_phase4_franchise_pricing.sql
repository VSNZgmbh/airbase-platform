-- Phase 4: Franchise multi-tenancy — per-tenant pricing config and service areas
-- Run after 0000_initial_schema.sql

CREATE TABLE IF NOT EXISTS "tenant_pricing_config" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "franchise_tenant_id" uuid NOT NULL UNIQUE REFERENCES "franchise_tenants"("id"),
  "base_rate_chf_per_km" numeric(8, 2) NOT NULL DEFAULT '12.00',
  "weight_free_kg" numeric(6, 2) NOT NULL DEFAULT '20',
  "weight_surcharge_chf_per_kg" numeric(6, 2) NOT NULL DEFAULT '0.50',
  "hub_pickup_surcharge_chf" numeric(8, 2) NOT NULL DEFAULT '25.00',
  "custom_pickup_chf_per_km" numeric(6, 2) NOT NULL DEFAULT '2.00',
  "minimum_booking_chf" numeric(8, 2) NOT NULL DEFAULT '120.00',
  "vat_percent" numeric(4, 2) NOT NULL DEFAULT '8.10',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tenant_service_areas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "franchise_tenant_id" uuid NOT NULL REFERENCES "franchise_tenants"("id"),
  "name" text NOT NULL,
  "geo_json" jsonb,
  "center_lat" numeric(10, 7),
  "center_lng" numeric(10, 7),
  "radius_km" numeric(6, 2),
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "tenant_service_areas_tenant_idx"
  ON "tenant_service_areas" ("franchise_tenant_id");
