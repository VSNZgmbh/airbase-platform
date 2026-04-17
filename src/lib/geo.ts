import * as turf from "@turf/turf";

/**
 * Bern-Belp CTR (LSZB) — circular approximation.
 * Center: best-known ARP from ICAO/Eurocontrol public databases (46.9142°N, 7.4989°E).
 * Not yet verified against Swiss AIP AD 2-LSZB official publication.
 * Radius conservatively increased to 11 km (interim mitigation) to compensate for
 * residual coordinate uncertainty and cover the historical 1.6 km offset gap.
 * Pending replacement with official CTR polygon once sourced (see sibling task).
 * COO determination documented in AIR-89; coordinate discrepancy background in AIR-88.
 */
export const LSZB_CTR = turf.circle([7.4989, 46.9142], 11, {
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
