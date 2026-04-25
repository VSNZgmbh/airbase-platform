import { describe, it, expect } from "vitest";
import { calculatePrice, validatePayload, type PriceInput } from "./pricing";

// ─── calculatePrice() — base rate ──────────────────────────────────────────

describe("calculatePrice() — base rate", () => {
  const base = (km: number): PriceInput => ({
    routeDistanceKm: km,
    payloadWeightKg: 10,
    pickupOption: "CUSTOMER_LOCATION",
  });

  it("10 km = CHF 120 base (at minimum)", () => {
    const r = calculatePrice(base(10));
    expect(r.basePrice).toBe(120);
  });

  it("20 km = CHF 240 base", () => {
    const r = calculatePrice(base(20));
    expect(r.basePrice).toBe(240);
  });
});

// ─── Weight surcharge ──────────────────────────────────────────────────────

describe("calculatePrice() — weight surcharge", () => {
  const weighted = (kg: number): PriceInput => ({
    routeDistanceKm: 20,
    payloadWeightKg: kg,
    pickupOption: "CUSTOMER_LOCATION",
  });

  it("20 kg payload has zero surcharge", () => {
    expect(calculatePrice(weighted(20)).weightSurcharge).toBe(0);
  });

  it("25 kg payload has CHF 2.50 surcharge", () => {
    expect(calculatePrice(weighted(25)).weightSurcharge).toBe(2.5);
  });

  it("0.1 kg payload has zero surcharge (below free tier)", () => {
    expect(calculatePrice(weighted(0.1)).weightSurcharge).toBe(0);
  });
});

// ─── Pickup surcharges ─────────────────────────────────────────────────────

describe("calculatePrice() — pickup surcharges", () => {
  it("CUSTOMER_LOCATION has zero pickup surcharge", () => {
    const r = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 10,
      pickupOption: "CUSTOMER_LOCATION",
    });
    expect(r.pickupSurcharge).toBe(0);
  });

  it("AIRBASE_HUB has CHF 25 pickup surcharge", () => {
    const r = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 10,
      pickupOption: "AIRBASE_HUB",
    });
    expect(r.pickupSurcharge).toBe(25);
  });

  it("CUSTOM_PICKUP with 10 km from hub has CHF 20 surcharge", () => {
    const r = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 10,
      pickupOption: "CUSTOM_PICKUP",
      pickupDistanceFromHubKm: 10,
    });
    expect(r.pickupSurcharge).toBe(20);
  });
});

// ─── Minimum enforcement ───────────────────────────────────────────────────

describe("calculatePrice() — minimum enforcement", () => {
  it("subtotal below CHF 120 is raised to 120, total = 129.72", () => {
    const r = calculatePrice({
      routeDistanceKm: 1, // 1 * 12 = CHF 12 base — well below minimum
      payloadWeightKg: 1,
      pickupOption: "CUSTOMER_LOCATION",
    });
    expect(r.subtotal).toBe(120);
    expect(r.total).toBe(129.72);
  });
});

// ─── VAT ────────────────────────────────────────────────────────────────────

describe("calculatePrice() — VAT", () => {
  it("CHF 240 subtotal has CHF 19.44 VAT, total CHF 259.44", () => {
    const r = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 10,
      pickupOption: "CUSTOMER_LOCATION",
    });
    expect(r.subtotal).toBe(240);
    expect(r.vatAmount).toBe(19.44);
    expect(r.total).toBe(259.44);
  });

  it("vatPercent is 8.1", () => {
    const r = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 10,
      pickupOption: "CUSTOMER_LOCATION",
    });
    expect(r.vatPercent).toBe(8.1);
  });
});

// ─── SORA surcharge passthrough ────────────────────────────────────────────

describe("calculatePrice() — SORA surcharge", () => {
  it("soraAirspaceSurchargeCHF: 75 passes through as soraSurchargeCHF: 75", () => {
    const r = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 10,
      pickupOption: "CUSTOMER_LOCATION",
      soraAirspaceSurchargeCHF: 75,
    });
    expect(r.soraSurchargeCHF).toBe(75);
  });
});

// ─── Rush surcharge ────────────────────────────────────────────────────────

describe("calculatePrice() — rush surcharge", () => {
  it("isRushBooking: true adds CHF 80 rush surcharge", () => {
    const r = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 10,
      pickupOption: "CUSTOMER_LOCATION",
      isRushBooking: true,
    });
    expect(r.rushSurchargeCHF).toBe(80);
  });

  it("isRushBooking: false has zero rush surcharge", () => {
    const r = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 10,
      pickupOption: "CUSTOMER_LOCATION",
      isRushBooking: false,
    });
    expect(r.rushSurchargeCHF).toBe(0);
  });
});

// ─── Tenant overrides ──────────────────────────────────────────────────────

describe("calculatePrice() — tenant overrides", () => {
  it("baseRateCHFPerKm override uses custom rate", () => {
    const r = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 10,
      pickupOption: "CUSTOMER_LOCATION",
      tenantOverrides: { baseRateCHFPerKm: 10 },
    });
    expect(r.basePrice).toBe(200);
  });

  it("vatPercent: 0 override results in zero VAT", () => {
    const r = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 10,
      pickupOption: "CUSTOMER_LOCATION",
      tenantOverrides: { vatPercent: 0 },
    });
    expect(r.vatAmount).toBe(0);
  });
});

// ─── Float precision ───────────────────────────────────────────────────────

describe("calculatePrice() — float precision", () => {
  it("all output fields have at most 2 decimal places", () => {
    const r = calculatePrice({
      routeDistanceKm: 17.3,
      payloadWeightKg: 23.7,
      pickupOption: "CUSTOM_PICKUP",
      pickupDistanceFromHubKm: 3.3,
      soraAirspaceSurchargeCHF: 50,
      isRushBooking: true,
    });
    const twoDecimals = (n: number) => Math.round(n * 100) / 100 === n;
    expect(twoDecimals(r.basePrice)).toBe(true);
    expect(twoDecimals(r.weightSurcharge)).toBe(true);
    expect(twoDecimals(r.pickupSurcharge)).toBe(true);
    expect(twoDecimals(r.soraSurchargeCHF)).toBe(true);
    expect(twoDecimals(r.subtotal)).toBe(true);
    expect(twoDecimals(r.vatAmount)).toBe(true);
    expect(twoDecimals(r.total)).toBe(true);
  });
});

// ─── validatePayload() ─────────────────────────────────────────────────────

describe("validatePayload()", () => {
  it("0 kg is invalid", () => {
    expect(validatePayload(0).valid).toBe(false);
  });

  it("100 kg FC100 is valid", () => {
    expect(validatePayload(100, "FC100").valid).toBe(true);
  });

  it("101 kg FC100 is invalid", () => {
    expect(validatePayload(101, "FC100").valid).toBe(false);
  });

  it("200 kg FC200 is valid", () => {
    expect(validatePayload(200, "FC200").valid).toBe(true);
  });

  it("201 kg FC200 is invalid", () => {
    expect(validatePayload(201, "FC200").valid).toBe(false);
  });
});
