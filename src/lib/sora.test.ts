import { describe, it, expect } from "vitest";
import {
  assessSora,
  soraAirspaceSurchargeCHF,
  isRushBooking,
  type SAILLevel,
} from "./sora";

// ─── isRushBooking() ────────────────────────────────────────────────────────

describe("isRushBooking()", () => {
  const now = new Date("2026-04-25T12:00:00Z");

  it("returns true for same-day booking", () => {
    expect(isRushBooking("2026-04-25", undefined, undefined, now)).toBe(true);
  });

  it("returns true for next-day booking", () => {
    expect(isRushBooking("2026-04-26", undefined, undefined, now)).toBe(true);
  });

  it("returns false for future date (3+ days) during standard hours", () => {
    expect(isRushBooking("2026-04-28", "09:00", undefined, now)).toBe(false);
  });

  it("returns true for future date with off-hours before 08:00", () => {
    expect(isRushBooking("2026-04-28", "07:30", undefined, now)).toBe(true);
  });

  it("returns true for future date at exactly 17:00", () => {
    expect(isRushBooking("2026-04-28", "17:00", undefined, now)).toBe(true);
  });

  it("returns false for future date at 16:59", () => {
    expect(isRushBooking("2026-04-28", "16:59", undefined, now)).toBe(false);
  });
});

// ─── soraAirspaceSurchargeCHF() ─────────────────────────────────────────────

describe("soraAirspaceSurchargeCHF()", () => {
  const cases: [SAILLevel, number][] = [
    ["I", 0],
    ["II", 25],
    ["III", 50],
    ["IV", 75],
    ["V", 120],
    ["VI", 200],
  ];

  it.each(cases)("SAIL %s returns CHF %d", (sail, expected) => {
    expect(soraAirspaceSurchargeCHF(sail)).toBe(expected);
  });
});

// ─── assessSora() — GRC zone lookup ────────────────────────────────────────

describe("assessSora() — GRC zone lookup", () => {
  it("Alpine GRC-1 zone (Jungfrau) returns grc: 1, overallRisk: LOW", () => {
    const result = assessSora({
      pickupLat: 46.54,
      pickupLng: 7.97,
      deliveryLat: 46.56,
      deliveryLng: 8.0,
    });
    expect(result.grc).toBe(1);
    expect(result.overallRisk).toBe("LOW");
  });

  it("Urban GRC-5 zone (Zurich) returns grc: 5", () => {
    const result = assessSora({
      pickupLat: 47.38,
      pickupLng: 8.53,
      deliveryLat: 47.38,
      deliveryLng: 8.53,
    });
    expect(result.grc).toBe(5);
  });

  it("always returns category: SPECIFIC and requiresBazlPermit: true", () => {
    const result = assessSora({
      pickupLat: 46.54,
      pickupLng: 7.97,
      deliveryLat: 46.56,
      deliveryLng: 8.0,
    });
    expect(result.category).toBe("SPECIFIC");
    expect(result.requiresBazlPermit).toBe(true);
  });
});

// ─── assessSora() — ARC/SAIL ───────────────────────────────────────────────

describe("assessSora() — ARC/SAIL", () => {
  it("route below 120m AGL, uncontrolled airspace returns arc: a", () => {
    // Jungfrau area — uncontrolled, low altitude
    const result = assessSora({
      pickupLat: 46.54,
      pickupLng: 7.97,
      deliveryLat: 46.56,
      deliveryLng: 8.0,
      altitudeAgl: 100,
    });
    expect(result.arc).toBe("a");
  });

  it("route above 120m AGL, uncontrolled airspace returns arc: b", () => {
    const result = assessSora({
      pickupLat: 46.54,
      pickupLng: 7.97,
      deliveryLat: 46.56,
      deliveryLng: 8.0,
      altitudeAgl: 200,
    });
    expect(result.arc).toBe("b");
  });

  it("route intersecting LSZB CTR returns arc: c with Bern-Belp clearance", () => {
    // Belp airport area to Thun — route through Bern-Belp CTR
    const result = assessSora({
      pickupLat: 46.891,
      pickupLng: 7.498,
      deliveryLat: 46.754,
      deliveryLng: 7.628,
      altitudeAgl: 100,
    });
    expect(result.arc).toBe("c");
    expect(result.requiresBernBelpClearance).toBe(true);
  });

  it("route in CTR at >500m AGL returns arc: d", () => {
    const result = assessSora({
      pickupLat: 46.891,
      pickupLng: 7.498,
      deliveryLat: 46.754,
      deliveryLng: 7.628,
      altitudeAgl: 600,
    });
    expect(result.arc).toBe("d");
  });
});

// ─── assessSora() — Restricted zones ───────────────────────────────────────

describe("assessSora() — Restricted zones", () => {
  it("route through Axalp military zone includes restriction in riskFactors", () => {
    const result = assessSora({
      pickupLat: 46.69,
      pickupLng: 8.04,
      deliveryLat: 46.69,
      deliveryLng: 8.04,
    });
    expect(result.riskFactors.some((f) => f.includes("Axalp"))).toBe(true);
  });
});

// ─── SAIL Table integrity ──────────────────────────────────────────────────

describe("SAIL Table integrity", () => {
  it("GRC 1, ARC-a returns SAIL I", () => {
    // Jungfrau pure alpine — GRC 1, uncontrolled low altitude → ARC-a
    const result = assessSora({
      pickupLat: 46.54,
      pickupLng: 7.97,
      deliveryLat: 46.56,
      deliveryLng: 8.0,
      altitudeAgl: 100,
    });
    expect(result.grc).toBe(1);
    expect(result.arc).toBe("a");
    expect(result.sail).toBe("I");
  });
});
