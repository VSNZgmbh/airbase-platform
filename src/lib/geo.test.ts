import { describe, it, expect } from "vitest";
import { requiresBernBelpPermit, LSZB_CTR } from "./geo";

/**
 * Unit tests for requiresBernBelpPermit() — safety-critical BAZL/FOCA gate.
 *
 * CTR definition: circular approximation centered at [7.497°E, 46.900°N],
 * radius 9.26 km (5 NM). See AIR-88 for a known ~1.6 km offset from the
 * actual LSZB ARP — these tests validate the implemented approximation.
 */

describe("requiresBernBelpPermit()", () => {
  /**
   * Route Münsingen → Thun.
   * Münsingen [7.564, 46.874] lies inside the CTR (~5.9 km from center),
   * Thun [7.628, 46.754] lies outside (~19 km from center).
   * The route originates inside the CTR → permit required.
   *
   * Note: the QA spec listed [7.653, 46.874] for Münsingen, which is outside
   * the CTR. The verified Swiss coordinate is ~[7.564, 46.874] (inside CTR).
   */
  it("returns true when route originates inside CTR (Münsingen → Thun)", () => {
    expect(requiresBernBelpPermit(7.564, 46.874, 7.628, 46.754)).toBe(true);
  });

  /**
   * Route Thun → Spiez.
   * Both endpoints are south-east of the CTR, well outside the 9.26 km radius.
   * No intersection → no permit required.
   */
  it("returns false when route is entirely outside CTR (Thun → Spiez)", () => {
    expect(requiresBernBelpPermit(7.628, 46.754, 7.677, 46.69)).toBe(false);
  });

  /**
   * Pickup point is the CTR center — unambiguously inside.
   */
  it("returns true when pickup is inside CTR", () => {
    expect(requiresBernBelpPermit(7.497, 46.9, 7.677, 46.69)).toBe(true);
  });

  /**
   * Delivery point is the CTR center — unambiguously inside.
   */
  it("returns true when delivery is inside CTR", () => {
    expect(requiresBernBelpPermit(7.628, 46.754, 7.497, 46.9)).toBe(true);
  });

  /**
   * Edge case: pickup is exactly on the CTR polygon boundary.
   * booleanPointInPolygon treats boundary as inside (ignoreBoundary defaults
   * to false) → conservative behaviour → permit required.
   */
  it("returns true when pickup is exactly on CTR boundary", () => {
    // First vertex of the generated circle polygon — guaranteed on the boundary.
    const [boundaryLng, boundaryLat] = LSZB_CTR.geometry.coordinates[0][0] as [
      number,
      number,
    ];
    // Delivery is outside the CTR.
    expect(requiresBernBelpPermit(boundaryLng, boundaryLat, 7.677, 46.69)).toBe(
      true,
    );
  });

  /**
   * Edge case: degenerate zero-length route (same pickup and delivery).
   * A point outside the CTR should yield false — no false positives.
   */
  it("returns false for degenerate route with both endpoints outside CTR", () => {
    // Thun [7.628, 46.754] is ~19 km from CTR center — well outside.
    expect(requiresBernBelpPermit(7.628, 46.754, 7.628, 46.754)).toBe(false);
  });

  /**
   * Edge case: degenerate zero-length route where both endpoints are
   * inside the CTR — must still return true.
   */
  it("returns true for degenerate route with both endpoints inside CTR", () => {
    expect(requiresBernBelpPermit(7.497, 46.9, 7.497, 46.9)).toBe(true);
  });
});
