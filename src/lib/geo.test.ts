import { describe, it, expect } from "vitest";
import { requiresBernBelpPermit, LSZB_CTR } from "./geo";

/**
 * Unit tests for requiresBernBelpPermit() — safety-critical BAZL/FOCA gate.
 *
 * CTR definition: official AIP polygon from Swiss AIP AD 2-LSZB (skyguide).
 * Boundary defined by 4 straight-line vertices + 5.02 NM arc centered on
 * 46°55'09"N 007°29'32.8"E. Class D, GND–5000 ft MSL.
 * See src/data/airspace/lszb_ctr.geojson for provenance.
 */

describe("requiresBernBelpPermit()", () => {
  /**
   * Belp (airport village) [7.498, 46.891] is inside the CTR,
   * essentially at the airport. Must require permit.
   */
  it("returns true for route originating at Belp airport area", () => {
    expect(requiresBernBelpPermit(7.498, 46.891, 7.628, 46.754)).toBe(true);
  });

  /**
   * Route Münsingen → Thun.
   * Münsingen [7.564, 46.874] lies inside the CTR (within the 5.02 NM arc),
   * Thun [7.628, 46.754] lies outside.
   * The route originates inside the CTR → permit required.
   */
  it("returns true when route originates inside CTR (Münsingen → Thun)", () => {
    expect(requiresBernBelpPermit(7.564, 46.874, 7.628, 46.754)).toBe(true);
  });

  /**
   * Route Thun → Spiez.
   * Both endpoints are south-east of the CTR, well outside.
   * No intersection → no permit required.
   */
  it("returns false when route is entirely outside CTR (Thun → Spiez)", () => {
    expect(requiresBernBelpPermit(7.628, 46.754, 7.677, 46.69)).toBe(false);
  });

  /**
   * Pickup point is the ARP (aerodrome reference point) — unambiguously inside.
   */
  it("returns true when pickup is at LSZB ARP", () => {
    expect(requiresBernBelpPermit(7.4989, 46.9142, 7.677, 46.69)).toBe(true);
  });

  /**
   * Delivery point is at the ARP — unambiguously inside.
   */
  it("returns true when delivery is at LSZB ARP", () => {
    expect(requiresBernBelpPermit(7.628, 46.754, 7.4989, 46.9142)).toBe(true);
  });

  /**
   * Edge case: pickup is exactly on the CTR polygon boundary.
   * booleanPointInPolygon treats boundary as inside (ignoreBoundary defaults
   * to false) → conservative behaviour → permit required.
   */
  it("returns true when pickup is exactly on CTR boundary", () => {
    const [boundaryLng, boundaryLat] = LSZB_CTR.geometry.coordinates[0][0] as [
      number,
      number,
    ];
    expect(requiresBernBelpPermit(boundaryLng, boundaryLat, 7.677, 46.69)).toBe(
      true,
    );
  });

  /**
   * Edge case: degenerate zero-length route (same pickup and delivery).
   * A point outside the CTR should yield false — no false positives.
   */
  it("returns false for degenerate route with both endpoints outside CTR", () => {
    // Thun [7.628, 46.754] is well outside the CTR.
    expect(requiresBernBelpPermit(7.628, 46.754, 7.628, 46.754)).toBe(false);
  });

  /**
   * Edge case: degenerate zero-length route where both endpoints are
   * inside the CTR — must still return true.
   */
  it("returns true for degenerate route with both endpoints inside CTR", () => {
    expect(requiresBernBelpPermit(7.4989, 46.9142, 7.4989, 46.9142)).toBe(true);
  });

  /**
   * Route that crosses the CTR without either endpoint inside.
   * Bern city [7.45, 47.00] is inside the NW extension of the CTR,
   * but a route from Fribourg [7.16, 46.80] to Burgdorf [7.63, 47.05]
   * crosses through the CTR.
   */
  it("returns true when route crosses CTR without endpoints inside", () => {
    // Konolfingen [7.62, 46.88] is just outside the eastern arc,
    // Schwarzenburg [7.34, 46.82] is just outside the SW corner.
    // A direct line between them cuts through the southern arc.
    expect(requiresBernBelpPermit(7.34, 46.82, 7.62, 46.88)).toBe(true);
  });

  /**
   * Bern Hauptbahnhof area [7.44, 46.95] — inside the NW extension
   * of the CTR (between vertex A and D). Must require permit.
   */
  it("returns true for point inside NW extension of CTR", () => {
    expect(requiresBernBelpPermit(7.44, 46.95, 7.44, 46.95)).toBe(true);
  });

  /**
   * Point clearly west of CTR: Fribourg [7.16, 46.80].
   * Well outside all boundaries.
   */
  it("returns false for point far west of CTR (Fribourg)", () => {
    expect(requiresBernBelpPermit(7.16, 46.80, 7.16, 46.80)).toBe(false);
  });
});
