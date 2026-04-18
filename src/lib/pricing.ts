/**
 * VOLTAIR Pricing Engine
 *
 * Rates (Phase 5 update):
 *   Base rate:          CHF 12.00 / km
 *   Weight surcharge:   CHF 0.50 / kg above 20 kg
 *   Pickup surcharges:
 *     Option A (customer location):  CHF 0
 *     Option B (VOLTAIR hub):         CHF 25 flat
 *     Option C (custom pickup):       CHF 2 / km from nearest hub
 *   SORA airspace surcharge: CHF 0–200 based on SAIL level
 *   Rush surcharge:     CHF 80 (same/next day or outside 08–17)
 *   Minimum booking:    CHF 120
 *   VAT:                8.1% (Swiss standard rate)
 */

export const PRICING_CONFIG = {
  BASE_RATE_CHF_PER_KM: 12.0,
  WEIGHT_FREE_KG: 20,
  WEIGHT_SURCHARGE_CHF_PER_KG: 0.5,
  HUB_PICKUP_SURCHARGE_CHF: 25,
  CUSTOM_PICKUP_CHF_PER_KM: 2,
  MINIMUM_BOOKING_CHF: 120,
  VAT_PERCENT: 8.1,
  /** Rush booking surcharge (same/next day or off-hours) */
  RUSH_SURCHARGE_CHF: 80,
} as const;

export type PickupOption = "CUSTOMER_LOCATION" | "VOLTAIR_HUB" | "CUSTOM_PICKUP";

export interface TenantPricingOverrides {
  baseRateCHFPerKm?: number;
  weightFreeKg?: number;
  weightSurchargeCHFPerKg?: number;
  hubPickupSurchargeCHF?: number;
  customPickupCHFPerKm?: number;
  minimumBookingCHF?: number;
  vatPercent?: number;
}

export interface PriceInput {
  routeDistanceKm: number;
  payloadWeightKg: number;
  pickupOption: PickupOption;
  pickupDistanceFromHubKm?: number; // required for CUSTOM_PICKUP
  tenantOverrides?: TenantPricingOverrides;
  /** CHF surcharge for SORA airspace complexity (from soraAirspaceSurchargeCHF()) */
  soraAirspaceSurchargeCHF?: number;
  /** Whether this is a rush booking (same/next day or outside standard hours) */
  isRushBooking?: boolean;
}

export interface PriceBreakdown {
  basePrice: number;
  weightSurcharge: number;
  pickupSurcharge: number;
  /** SORA airspace complexity surcharge (CHF) */
  soraSurchargeCHF: number;
  /** Rush booking surcharge (CHF) */
  rushSurchargeCHF: number;
  subtotal: number;
  vatPercent: number;
  vatAmount: number;
  total: number;
  currency: "CHF";
}

export function calculatePrice(input: PriceInput): PriceBreakdown {
  const {
    routeDistanceKm,
    payloadWeightKg,
    pickupOption,
    pickupDistanceFromHubKm,
    tenantOverrides,
    soraAirspaceSurchargeCHF: soraSurcharge = 0,
    isRushBooking,
  } = input;

  const cfg = {
    BASE_RATE_CHF_PER_KM: tenantOverrides?.baseRateCHFPerKm ?? PRICING_CONFIG.BASE_RATE_CHF_PER_KM,
    WEIGHT_FREE_KG: tenantOverrides?.weightFreeKg ?? PRICING_CONFIG.WEIGHT_FREE_KG,
    WEIGHT_SURCHARGE_CHF_PER_KG: tenantOverrides?.weightSurchargeCHFPerKg ?? PRICING_CONFIG.WEIGHT_SURCHARGE_CHF_PER_KG,
    HUB_PICKUP_SURCHARGE_CHF: tenantOverrides?.hubPickupSurchargeCHF ?? PRICING_CONFIG.HUB_PICKUP_SURCHARGE_CHF,
    CUSTOM_PICKUP_CHF_PER_KM: tenantOverrides?.customPickupCHFPerKm ?? PRICING_CONFIG.CUSTOM_PICKUP_CHF_PER_KM,
    MINIMUM_BOOKING_CHF: tenantOverrides?.minimumBookingCHF ?? PRICING_CONFIG.MINIMUM_BOOKING_CHF,
    VAT_PERCENT: tenantOverrides?.vatPercent ?? PRICING_CONFIG.VAT_PERCENT,
  };

  // Base price: distance × rate
  const basePrice = routeDistanceKm * cfg.BASE_RATE_CHF_PER_KM;

  // Weight surcharge: extra kg above free tier
  const extraKg = Math.max(0, payloadWeightKg - cfg.WEIGHT_FREE_KG);
  const weightSurcharge = extraKg * cfg.WEIGHT_SURCHARGE_CHF_PER_KG;

  // Pickup surcharge
  let pickupSurcharge = 0;
  if (pickupOption === "VOLTAIR_HUB") {
    pickupSurcharge = cfg.HUB_PICKUP_SURCHARGE_CHF;
  } else if (pickupOption === "CUSTOM_PICKUP") {
    const hubDistance = pickupDistanceFromHubKm ?? 0;
    pickupSurcharge = hubDistance * cfg.CUSTOM_PICKUP_CHF_PER_KM;
  }

  // SORA airspace complexity surcharge
  const soraSurchargeCHF = Math.round((soraSurcharge ?? 0) * 100) / 100;

  // Rush booking surcharge (same/next day or outside 08:00–17:00)
  const rushSurchargeCHF = isRushBooking ? PRICING_CONFIG.RUSH_SURCHARGE_CHF : 0;

  // Subtotal before VAT, apply minimum
  let subtotal = basePrice + weightSurcharge + pickupSurcharge + soraSurchargeCHF + rushSurchargeCHF;
  subtotal = Math.max(subtotal, cfg.MINIMUM_BOOKING_CHF);

  // Round to 2 decimal places
  subtotal = Math.round(subtotal * 100) / 100;

  // VAT
  const vatAmount =
    Math.round(subtotal * (cfg.VAT_PERCENT / 100) * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    weightSurcharge: Math.round(weightSurcharge * 100) / 100,
    pickupSurcharge: Math.round(pickupSurcharge * 100) / 100,
    soraSurchargeCHF,
    rushSurchargeCHF,
    subtotal,
    vatPercent: cfg.VAT_PERCENT,
    vatAmount,
    total,
    currency: "CHF",
  };
}

export function formatCHF(amount: number): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
  }).format(amount);
}

// FlyCart 100 validation
export const FLYCART_100 = {
  MAX_PAYLOAD_KG: 100,
  MAX_RANGE_KM: 100,
  CRUISE_SPEED_KMH: 75,
} as const;

export function validatePayload(weightKg: number): {
  valid: boolean;
  error?: string;
} {
  if (weightKg <= 0) {
    return { valid: false, error: "Gewicht muss grösser als 0 kg sein." };
  }
  if (weightKg > FLYCART_100.MAX_PAYLOAD_KG) {
    return {
      valid: false,
      error: `FlyCart 100 Maximalnutzlast: ${FLYCART_100.MAX_PAYLOAD_KG} kg. Bitte wenden Sie sich für Überlasten an uns.`,
    };
  }
  return { valid: true };
}
