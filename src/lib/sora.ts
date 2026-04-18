/**
 * Airbase SORA (Specific Operations Risk Assessment) Engine
 *
 * Implements a simplified SORA v2.5 assessment for the Airbase T100 drone
 * (MTOW 170 kg) operating in Swiss airspace, primarily the Berner Oberland corridors.
 *
 * Reference: EASA SORA v2.5 (AMC1 UAS.SPEC.040) and BAZL Betriebshandbuch.
 *
 * IMPORTANT: This is a decision-support tool, not a certified assessment tool.
 * All flights require operator sign-off and may require official BAZL authorization.
 *
 * T100 note: At MTOW 170 kg, all operations fall into the SPECIFIC category
 * and require a SORA assessment + BAZL operator authorisation.
 */

import * as turf from "@turf/turf";
import { requiresBernBelpPermit } from "./geo";

// ─── GRC — Ground Risk Class ──────────────────────────────────────────────────

/**
 * Ground Risk Classes (1–7+) based on operational area population density
 * and populated area type (SORA Table 1).
 */
export type GRCLevel =
  | 1  // Controlled ground area, low density
  | 2  // Sparsely populated area
  | 3  // Populated area (rural villages, small towns)
  | 4  // Densely populated area (urban)
  | 5  // Gatherings of people (markets, events)
  | 6  // Very high density urban
  | 7; // Max — not practically used for ops

/**
 * GRC labels for UI display
 */
export const GRC_LABELS: Record<GRCLevel, string> = {
  1: "GRC 1 — Kontrollierte Fläche",
  2: "GRC 2 — Dünn besiedelt",
  3: "GRC 3 — Besiedelt (ländlich)",
  4: "GRC 4 — Dicht besiedelt (urban)",
  5: "GRC 5 — Menschenansammlungen",
  6: "GRC 6 — Sehr dicht (Stadtzentrum)",
  7: "GRC 7 — Maximum",
};

// ─── ARC — Air Risk Class ─────────────────────────────────────────────────────

export type ARCLevel = "a" | "b" | "c" | "d";

export const ARC_LABELS: Record<ARCLevel, string> = {
  a: "ARC-a — Unkontrollierter Luftraum, niedrig",
  b: "ARC-b — Unkontrollierter Luftraum, mittel",
  c: "ARC-c — Kontrollierter Luftraum (CTR/TMA)",
  d: "ARC-d — Stark frequentierter Luftraum",
};

// ─── SAIL — Specific Assurance and Integrity Level ───────────────────────────

export type SAILLevel = "I" | "II" | "III" | "IV" | "V" | "VI";

/** SAIL lookup table from SORA v2.5 Table 3 (GRC rows × ARC cols). */
const SAIL_TABLE: Record<GRCLevel, Record<ARCLevel, SAILLevel>> = {
  1: { a: "I",  b: "II", c: "IV", d: "VI" },
  2: { a: "II", b: "III", c: "V",  d: "VI" },
  3: { a: "III", b: "IV", c: "V",  d: "VI" },
  4: { a: "IV",  b: "V",  c: "VI", d: "VI" },
  5: { a: "V",   b: "V",  c: "VI", d: "VI" },
  6: { a: "V",   b: "VI", c: "VI", d: "VI" },
  7: { a: "VI",  b: "VI", c: "VI", d: "VI" },
};

// ─── SORA Category ────────────────────────────────────────────────────────────

/**
 * SORA Operational Category.
 * All T100 operations are SPECIFIC (MTOW > 25 kg) and require BAZL authorisation.
 */
export type SoraCategory = "OPEN_A1" | "OPEN_A2" | "OPEN_A3" | "SPECIFIC" | "CERTIFIED";

// ─── Berner Oberland Corridors ────────────────────────────────────────────────

/**
 * Pre-defined Berner Oberland delivery corridors used by Airbase.
 * Each corridor has a baseline GRC based on terrain characteristics.
 */
export const BERNER_OBERLAND_CORRIDORS = [
  {
    id: "interlaken_grindelwald",
    name: "Interlaken — Grindelwald",
    grc: 2 as GRCLevel,
    description: "Alpine rural, sparsely populated valley",
    // Approximate bounding box for corridor detection
    bounds: { minLat: 46.60, maxLat: 46.72, minLng: 7.85, maxLng: 8.10 },
  },
  {
    id: "thun_interlaken",
    name: "Thun — Interlaken",
    grc: 3 as GRCLevel,
    description: "Mixed rural/town corridor along Thuner See",
    bounds: { minLat: 46.60, maxLat: 46.80, minLng: 7.55, maxLng: 7.90 },
  },
  {
    id: "bern_koniz",
    name: "Bern — Köniz",
    grc: 4 as GRCLevel,
    description: "Urban/suburban Bern area",
    bounds: { minLat: 46.89, maxLat: 46.96, minLng: 7.38, maxLng: 7.50 },
  },
  {
    id: "spiez_kandersteg",
    name: "Spiez — Kandersteg",
    grc: 2 as GRCLevel,
    description: "Rural alpine corridor",
    bounds: { minLat: 46.53, maxLat: 46.68, minLng: 7.60, maxLng: 7.75 },
  },
  {
    id: "brienz_meiringen",
    name: "Brienz — Meiringen",
    grc: 2 as GRCLevel,
    description: "Rural alpine valley",
    bounds: { minLat: 46.70, maxLat: 46.77, minLng: 8.00, maxLng: 8.20 },
  },
] as const;

// ─── Main Assessment ──────────────────────────────────────────────────────────

export interface SoraInput {
  /** Pickup coordinates */
  pickupLng: number;
  pickupLat: number;
  /** Delivery coordinates */
  deliveryLng: number;
  deliveryLat: number;
  /** Planned flight altitude in meters AGL */
  altitudeAgl?: number;
  /** Estimated flight date (for seasonal checks) */
  flightDate?: Date;
}

export interface SoraResult {
  grc: GRCLevel;
  arc: ARCLevel;
  sail: SAILLevel;
  /** Always SPECIFIC for T100 */
  category: "SPECIFIC";
  /** BAZL/FOCA permit required */
  requiresBazlPermit: boolean;
  /** Bern-Belp CTR clearance required */
  requiresBernBelpClearance: boolean;
  /** List of risk factors for display */
  riskFactors: string[];
  /** Overall risk level */
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** Recommended permits to obtain */
  recommendedPermits: PermitRequirement[];
}

export interface PermitRequirement {
  authority: string;
  type: string;
  description: string;
  isMandatory: boolean;
}

/**
 * Determine GRC based on route coordinates.
 * Uses corridor lookup + simple population density heuristics for Swiss territory.
 */
function calculateGRC(
  pickupLng: number,
  pickupLat: number,
  deliveryLng: number,
  deliveryLat: number
): GRCLevel {
  // Check if route passes through any known corridor
  const midLng = (pickupLng + deliveryLng) / 2;
  const midLat = (pickupLat + deliveryLat) / 2;

  // Find matching corridor by checking if midpoint falls in bounds
  let maxGRC: GRCLevel = 1;

  for (const corridor of BERNER_OBERLAND_CORRIDORS) {
    const inPickup =
      pickupLat >= corridor.bounds.minLat &&
      pickupLat <= corridor.bounds.maxLat &&
      pickupLng >= corridor.bounds.minLng &&
      pickupLng <= corridor.bounds.maxLng;

    const inDelivery =
      deliveryLat >= corridor.bounds.minLat &&
      deliveryLat <= corridor.bounds.maxLat &&
      deliveryLng >= corridor.bounds.minLng &&
      deliveryLng <= corridor.bounds.maxLng;

    const inMid =
      midLat >= corridor.bounds.minLat &&
      midLat <= corridor.bounds.maxLat &&
      midLng >= corridor.bounds.minLng &&
      midLng <= corridor.bounds.maxLng;

    if (inPickup || inDelivery || inMid) {
      if (corridor.grc > maxGRC) {
        maxGRC = corridor.grc;
      }
    }
  }

  // Heuristic: if coordinates are outside known corridors, default to GRC 3 (populated)
  // as a conservative assumption for unknown Swiss territory
  if (maxGRC === 1) {
    // Check if it looks like urban area (Bern coordinates ~46.95, 7.44)
    const isBernArea =
      pickupLat >= 46.88 && pickupLat <= 46.98 &&
      pickupLng >= 7.35 && pickupLng <= 7.55;
    const isDeliveryBernArea =
      deliveryLat >= 46.88 && deliveryLat <= 46.98 &&
      deliveryLng >= 7.35 && deliveryLng <= 7.55;

    if (isBernArea || isDeliveryBernArea) {
      return 4; // Urban Bern
    }
    return 3; // Default: populated area (conservative)
  }

  return maxGRC;
}

/**
 * Determine ARC based on airspace characteristics.
 * Uses Bern-Belp CTR detection + altitude.
 */
function calculateARC(
  pickupLng: number,
  pickupLat: number,
  deliveryLng: number,
  deliveryLat: number,
  altitudeAgl = 120
): ARCLevel {
  const inCTR = requiresBernBelpPermit(pickupLng, pickupLat, deliveryLng, deliveryLat);

  if (inCTR) {
    // Inside controlled airspace
    return altitudeAgl > 500 ? "d" : "c";
  }

  // Uncontrolled airspace
  if (altitudeAgl <= 120) {
    return "a"; // Below 120m AGL, uncontrolled = ARC-a (lowest risk)
  }
  return "b"; // Above 120m but uncontrolled
}

/**
 * Run full SORA assessment for a planned flight.
 */
export function assessSora(input: SoraInput): SoraResult {
  const { pickupLng, pickupLat, deliveryLng, deliveryLat, altitudeAgl = 120 } = input;

  const grc = calculateGRC(pickupLng, pickupLat, deliveryLng, deliveryLat);
  const arc = calculateARC(pickupLng, pickupLat, deliveryLng, deliveryLat, altitudeAgl);
  const sail = SAIL_TABLE[grc][arc];
  const requiresBernBelpClearance = requiresBernBelpPermit(
    pickupLng, pickupLat, deliveryLng, deliveryLat
  );

  // T100 at 170 kg MTOW: ALWAYS SPECIFIC category + requires BAZL operator authorisation
  const requiresBazlPermit = true;

  const riskFactors: string[] = [];

  if (grc >= 4) riskFactors.push("Dicht besiedeltes Gebiet (GRC ≥ 4)");
  if (grc >= 3) riskFactors.push("Besiedeltes Gebiet — Bodenmassnahmen erforderlich");
  if (arc === "c" || arc === "d") riskFactors.push("Kontrollierter Luftraum — CTR-Freigabe nötig");
  if (requiresBernBelpClearance) riskFactors.push("Route kreuzt Bern-Belp CTR (LSZB)");
  if (sail === "V" || sail === "VI") riskFactors.push(`SAIL ${sail} — Hohe Sicherheitsanforderungen`);
  riskFactors.push("Airbase T100 (170 kg MTOW) — SPECIFIC Kategorie, BAZL-Betriebsgenehmigung erforderlich");

  // Overall risk
  let overallRisk: SoraResult["overallRisk"];
  if (sail === "I" || sail === "II") overallRisk = "LOW";
  else if (sail === "III" || sail === "IV") overallRisk = "MEDIUM";
  else if (sail === "V") overallRisk = "HIGH";
  else overallRisk = "CRITICAL";

  // Permit requirements
  const recommendedPermits: PermitRequirement[] = [
    {
      authority: "BAZL/FOCA",
      type: "SPECIFIC_AUTHORISATION",
      description: "Betriebsgenehmigung für SPECIFIC-Kategorie UAS (T100, 170 kg MTOW)",
      isMandatory: true,
    },
  ];

  if (requiresBernBelpClearance) {
    recommendedPermits.push({
      authority: "Flughafen Bern-Belp (LSZB)",
      type: "CTR_CLEARANCE",
      description: "Luftraum-Freigabe für Flüge im CTR Bern-Belp",
      isMandatory: true,
    });
  }

  if (grc >= 3) {
    recommendedPermits.push({
      authority: "Gemeinde / Kanton",
      type: "MUNICIPAL_PERMIT",
      description: "Kommunale Bewilligung für Flüge über besiedeltem Gebiet",
      isMandatory: grc >= 4,
    });
  }

  return {
    grc,
    arc,
    sail,
    category: "SPECIFIC",
    requiresBazlPermit,
    requiresBernBelpClearance,
    riskFactors,
    overallRisk,
    recommendedPermits,
  };
}

/**
 * Determine the airspace risk surcharge in CHF based on SAIL level.
 * Higher SAIL = more compliance overhead = higher surcharge.
 */
export function soraAirspaceSurchargeCHF(sail: SAILLevel): number {
  const surcharges: Record<SAILLevel, number> = {
    I:   0,
    II:  25,
    III: 50,
    IV:  75,
    V:   120,
    VI:  200,
  };
  return surcharges[sail];
}

/**
 * Check if a requested time qualifies as a rush booking.
 * Rush applies when:
 * - Same-day booking (requestedDate = today)
 * - Next-day booking
 * - Time slot outside standard hours (before 08:00 or after 17:00)
 */
export function isRushBooking(
  requestedDate: string,
  requestedTimeFrom?: string,
  bookingCreatedAt?: Date
): boolean {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split("T")[0];

  if (requestedDate === todayStr || requestedDate === tomorrowStr) {
    return true;
  }

  if (requestedTimeFrom) {
    const [hours] = requestedTimeFrom.split(":").map(Number);
    if (hours < 8 || hours >= 17) {
      return true;
    }
  }

  return false;
}

/**
 * Rush surcharge in CHF.
 */
export const RUSH_SURCHARGE_CHF = 80;
