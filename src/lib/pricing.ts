/**
 * AIRBASE Pricing Engine
 *
 * Rates (Phase 5 update):
 *   Base rate:          CHF 12.00 / km
 *   Weight surcharge:   CHF 0.50 / kg above 20 kg
 *   Pickup surcharges:
 *     Option A (customer location):  CHF 0
 *     Option B (AIRBASE hub):         CHF 25 flat
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

export type PickupOption = "CUSTOMER_LOCATION" | "AIRBASE_HUB" | "CUSTOM_PICKUP";

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
  if (pickupOption === "AIRBASE_HUB") {
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

// DJI FlyCart 100 — Real specs (Source: dji.com/flycart-100/specs)
// Single-battery mode: 100 kg payload, 6 km range, 7 min flight time
// Dual-battery mode:   85 kg payload, 12 km range, 14 min flight time
export const FLYCART_100 = {
  MODEL: "DJI FlyCart 100",
  MAX_PAYLOAD_KG: 100,               // Single-battery mode max
  MAX_PAYLOAD_DUAL_KG: 85,           // Dual-battery mode max
  MAX_RANGE_KM: 12,                  // Dual-battery, at 149.9 kg operational limit
  MAX_RANGE_SINGLE_KM: 6,            // Single-battery, at 149.9 kg operational limit
  CRUISE_SPEED_KMH: 54,              // 15 m/s
  MAX_SPEED_KMH: 72,                 // 20 m/s
  EMPTY_WEIGHT_KG: 55.2,             // With lifting system
  MTOW_KG: 170,                      // Manufacturer MTOW (operational limit: 149.9 kg for SPECIFIC category)
  ROTOR_SYSTEM: "Coaxial 4-axis",    // 8 rotor blades, 62" propellers
  PROPELLER_SIZE_INCH: 62,           // Carbon fiber composite
  MOTOR_COUNT: 8,                     // 4-axis coaxial, 8 blades
  MAX_ALTITUDE_M: 6000,              // Operating altitude
  WIND_RESISTANCE_MS: 12,            // Max wind speed m/s
  DELIVERY_WINCH_M: 30,              // Winch cable length
  DELIVERY_ELECTRIC_HOOK: true,      // Electric hook release
  BATTERY_HOTSWAP: true,             // Hot-swap batteries
  BATTERY_FAST_CHARGE: true,         // Ultra-fast charging
  SAFETY_LIDAR: true,                // LiDAR obstacle avoidance
  SAFETY_MMWAVE_RADAR: true,         // mmWave radar
  SAFETY_VISION_DIRECTIONS: 5,       // 5-direction vision system
  SAFETY_PARACHUTE: true,            // Emergency parachute
  INSPECTION_INTERVAL_FLIGHTS: 100,   // First inspection after 100 flights
  INSPECTION_INTERVAL_HOURS: 50,      // Subsequent: every 50h
  IP_RATING: "IP55",
  OPERATING_TEMP_MIN_C: -20,
  OPERATING_TEMP_MAX_C: 40,
} as const;

// DJI FlyCart 200 (FC200) — Placeholder specs (Source: dronexl.co, April 2026)
// Pending verified data from Deep Researcher — will be updated once available
// Single-drone: 200 kg payload, up to 36 km range (no load)
// Multi-drone swarm: 2× = 360 kg, 4× = 600 kg coordinated payload
export const FLYCART_200 = {
  MODEL: "DJI FlyCart 200",
  MAX_PAYLOAD_KG: 200,               // Single-drone max payload
  MAX_PAYLOAD_QUAD_BATTERY_KG: 200,   // Quad-battery config, full payload
  MAX_RANGE_KM: 36,                   // No-load transit range
  MAX_RANGE_FULL_LOAD_DUAL_KM: 6,    // Dual-battery, 200 kg payload
  MAX_RANGE_FULL_LOAD_QUAD_KM: 10,   // Quad-battery, 200 kg payload
  CRUISE_SPEED_KMH: 72,              // 20 m/s loaded
  MAX_SPEED_KMH: 72,                 // 20 m/s
  CLIMB_SPEED_MS: 5,                 // Vertical climb/descend
  EMPTY_WEIGHT_KG: 0,                // TBC — pending verified specs
  MTOW_KG: 0,                        // TBC — pending verified specs
  ROTOR_SYSTEM: "Coaxial multi-axis", // Flat-wire motors, 120V platform
  PROPELLER_SIZE_INCH: 68,           // Carbon fiber composite
  MOTOR_COUNT: 0,                     // TBC — pending verified specs
  MOTOR_THRUST_KG_PER_AXIS: 183,    // Single motor axis thrust
  MAX_ALTITUDE_M: 6000,              // Operating altitude
  PAYLOAD_AT_3000M_KG: 200,         // Full payload at 3,000m
  PAYLOAD_AT_4500M_KG: 170,         // Reduced payload at 4,500m
  PAYLOAD_AT_6000M_KG: 140,         // Reduced payload at 6,000m
  WIND_RESISTANCE_MS: 12,            // Placeholder — TBC
  BATTERY_MODEL: "DB2400",           // 46 Ah
  BATTERY_FAST_CHARGE_MIN: 8,       // ~7-8 min with C12000 charger
  BATTERY_SLOTS: 4,                  // Up to 4 batteries simultaneously
  SWARM_MAX_DRONES: 4,              // Multi-drone coordinated ops
  SWARM_PAYLOAD_2X_KG: 360,         // 2 drones coordinated
  SWARM_PAYLOAD_4X_KG: 600,         // 4 drones coordinated
  SAFETY_LIDAR: true,
  SAFETY_MMWAVE_RADAR: true,
  SAFETY_VISION_DIRECTIONS: 5,
  SAFETY_PARACHUTE: true,
  IP_RATING: "IP55",                 // Placeholder — TBC
  OPERATING_TEMP_MIN_C: -20,
  OPERATING_TEMP_MAX_C: 40,
  SPEC_STATUS: "placeholder_pending_verification" as const,
} as const;

export function validatePayload(weightKg: number, model: "FC100" | "FC200" = "FC100"): {
  valid: boolean;
  error?: string;
} {
  if (weightKg <= 0) {
    return { valid: false, error: "Gewicht muss grösser als 0 kg sein." };
  }
  const maxPayload = model === "FC200" ? FLYCART_200.MAX_PAYLOAD_KG : FLYCART_100.MAX_PAYLOAD_KG;
  const modelName = model === "FC200" ? FLYCART_200.MODEL : FLYCART_100.MODEL;
  if (weightKg > maxPayload) {
    return {
      valid: false,
      error: `${modelName} Maximalnutzlast: ${maxPayload} kg. Bitte wenden Sie sich für Überlasten an uns.`,
    };
  }
  return { valid: true };
}
