-- Migration: Fix DJI FlyCart 100 specs in drone_models — AIR-284
-- COO audit (AIR-283) found MTOW, empty weight, and MTOM class were incorrect.
-- Authoritative source: src/lib/sora.ts (SORA engine uses 149.9 kg MTOW)
-- Regulatory basis: EASA 2019/947 — >25 kg MTOW = Specific category

UPDATE "drone_models"
SET
  "max_takeoff_weight_kg" = 149.90,
  "empty_weight_kg" = 119.90,
  "mtom_class" = 'specific',
  "metadata" = jsonb_build_object(
    'airframe_weight_kg', 65,
    'easa_category', 'SPECIFIC',
    'sora_required', true,
    'bazl_authorization_required', true,
    'mtow_source', 'src/lib/sora.ts — authoritative SORA engine'
  ),
  "updated_at" = now()
WHERE "model_name" = 'DJI FlyCart 100';
