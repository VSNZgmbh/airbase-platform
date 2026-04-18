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
