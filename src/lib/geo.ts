import * as turf from "@turf/turf";

/**
 * Bern-Belp CTR (LSZB) — circular approximation (5 NM = 9.26 km radius).
 * Center: LSZB ARP [7.497°E, 46.900°N].
 * Replace with exact ICAO AIP AD 2-LSZB polygon once sourced.
 */
export const LSZB_CTR = turf.circle([7.497, 46.9], 9.26, {
  units: "kilometers",
});

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
