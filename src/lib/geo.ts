import * as turf from "@turf/turf";
import { LSZB_CTR_POLYGON } from "@/data/airspace";

/**
 * Bern-Belp CTR (LSZB) — official AIP polygon.
 * Source: Swiss AIP AD 2-LSZB (skyguide), verified via OpenAIP community data.
 * Boundary: 4 straight-line vertices + 5.02 NM arc centered on 46°55'09"N 007°29'32.8"E.
 * Class D airspace, GND–5000 ft MSL.
 * See src/data/airspace/lszb_ctr.geojson for full coordinate provenance.
 */
export const LSZB_CTR = LSZB_CTR_POLYGON;

// ─── Swiss CTR Bounding Boxes ────────────────────────────────────────────────
// Conservative bounding-box approximations for major Swiss CTR/TMA airspace.
// Source: Swiss AIP AD 2 (skyguide). Replace with official AIP polygons when available.
// Used for ARC calculation to detect controlled airspace intersections.

interface CTRBounds {
  icao: string;
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const SWISS_CTR_BOUNDS: CTRBounds[] = [
  // LSZB uses the precise polygon below — not listed here
  { icao: "LSZH", name: "CTR Zürich-Kloten", minLat: 47.30, maxLat: 47.55, minLng: 8.35, maxLng: 8.72 },
  { icao: "LSGG", name: "CTR Genève-Cointrin", minLat: 46.15, maxLat: 46.35, minLng: 5.95, maxLng: 6.30 },
  { icao: "LFSB", name: "CTR Basel-Mulhouse", minLat: 47.52, maxLat: 47.68, minLng: 7.38, maxLng: 7.72 },
  { icao: "LSGS", name: "CTR Sion", minLat: 46.19, maxLat: 46.28, minLng: 7.27, maxLng: 7.42 },
  { icao: "LSZA", name: "CTR Lugano-Agno", minLat: 45.96, maxLat: 46.05, minLng: 8.86, maxLng: 8.97 },
  { icao: "LSZL", name: "CTR Locarno", minLat: 46.14, maxLat: 46.20, minLng: 8.85, maxLng: 8.93 },
  { icao: "LSMP", name: "CTR Payerne (Militär)", minLat: 46.80, maxLat: 46.88, minLng: 6.87, maxLng: 6.97 },
  { icao: "LSME", name: "CTR Emmen (Militär)", minLat: 47.04, maxLat: 47.11, minLng: 8.24, maxLng: 8.35 },
  { icao: "LSMM", name: "CTR Meiringen (Militär)", minLat: 46.72, maxLat: 46.78, minLng: 8.05, maxLng: 8.14 },
];

/** Check if a point falls inside any Swiss CTR bounding box. */
function pointInAnyCTRBounds(lat: number, lng: number): CTRBounds | null {
  for (const ctr of SWISS_CTR_BOUNDS) {
    if (lat >= ctr.minLat && lat <= ctr.maxLat && lng >= ctr.minLng && lng <= ctr.maxLng) {
      return ctr;
    }
  }
  return null;
}

/**
 * Returns true when the straight-line route between pickup and delivery
 * intersects or is contained within the Bern-Belp CTR polygon.
 * Covers three cases:
 *  1. Route line crosses the CTR boundary
 *  2. Pickup point is inside the CTR
 *  3. Delivery point is inside the CTR
 */
export function requiresBernBelpPermit(
  pickupLng: number,
  pickupLat: number,
  deliveryLng: number,
  deliveryLat: number
): boolean {
  const route = turf.lineString([
    [pickupLng, pickupLat],
    [deliveryLng, deliveryLat],
  ]);
  const pickupPt = turf.point([pickupLng, pickupLat]);
  const deliveryPt = turf.point([deliveryLng, deliveryLat]);

  return (
    turf.booleanIntersects(route, LSZB_CTR) ||
    turf.booleanPointInPolygon(pickupPt, LSZB_CTR) ||
    turf.booleanPointInPolygon(deliveryPt, LSZB_CTR)
  );
}

/**
 * Check whether a route intersects ANY Swiss controlled airspace (CTR/TMA).
 * Uses the precise LSZB polygon + conservative bounding boxes for other CTRs.
 * Samples 5 points along the route (0%, 25%, 50%, 75%, 100%).
 *
 * Returns true if the route passes through controlled airspace.
 */
export function routeIntersectsControlledAirspace(
  pickupLng: number,
  pickupLat: number,
  deliveryLng: number,
  deliveryLat: number
): boolean {
  // Check LSZB with precise polygon first
  if (requiresBernBelpPermit(pickupLng, pickupLat, deliveryLng, deliveryLat)) {
    return true;
  }

  // Sample route against all other CTR bounding boxes
  const fractions = [0, 0.25, 0.5, 0.75, 1.0];
  for (const t of fractions) {
    const lat = pickupLat + t * (deliveryLat - pickupLat);
    const lng = pickupLng + t * (deliveryLng - pickupLng);
    if (pointInAnyCTRBounds(lat, lng)) {
      return true;
    }
  }

  return false;
}
