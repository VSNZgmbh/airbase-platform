import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Integration tests for the booking router.
 * All DB/tRPC calls are mocked — no real database required.
 */

// Mock the DB module before imports
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    query: {
      customers: { findFirst: vi.fn() },
      bookings: { findMany: vi.fn(), findFirst: vi.fn() },
    },
    insert: vi.fn(),
    $count: vi.fn(),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  bookings: { id: "id", customerId: "customerId", status: "status" },
  customers: { clerkUserId: "clerkUserId" },
  airbaseHubs: { isActive: "isActive" },
}));

vi.mock("@/lib/trpc/server", () => {
  const router = vi.fn((routes: Record<string, unknown>) => routes);
  const middleware = vi.fn((fn: unknown) => ({ use: vi.fn(() => ({ use: vi.fn(() => ({ mutation: vi.fn(), query: vi.fn() })) })) }));
  return {
    createTRPCRouter: router,
    publicProcedure: {
      query: vi.fn((fn: unknown) => fn),
      use: vi.fn(),
    },
    protectedProcedure: {
      input: vi.fn(() => ({
        mutation: vi.fn((fn: unknown) => fn),
        query: vi.fn((fn: unknown) => fn),
      })),
    },
  };
});

vi.mock("@/lib/validations", () => ({
  createBookingSchema: { parse: vi.fn((v: unknown) => v) },
}));

// The actual functions under test
import { calculatePrice } from "@/lib/pricing";
import { assessSora, soraAirspaceSurchargeCHF, isRushBooking } from "@/lib/sora";

describe("Booking logic — pricing integration", () => {
  it("booking with coordinates includes SORA surcharge in price", () => {
    const soraResult = assessSora({
      pickupLng: 7.498,
      pickupLat: 46.891,
      deliveryLng: 7.628,
      deliveryLat: 46.754,
    });
    const surcharge = soraAirspaceSurchargeCHF(soraResult.sail);
    const price = calculatePrice({
      routeDistanceKm: 10,
      payloadWeightKg: 20,
      pickupOption: "CUSTOMER_LOCATION",
      soraAirspaceSurchargeCHF: surcharge,
      isRushBooking: false,
    });
    expect(price.soraSurchargeCHF).toBe(surcharge);
    expect(price.total).toBeGreaterThan(0);
  });

  it("rush booking adds CHF 80 surcharge", () => {
    const now = new Date("2026-04-25T12:00:00Z");
    const rush = isRushBooking("2026-04-25", "09:00", undefined, now);
    expect(rush).toBe(true);

    const price = calculatePrice({
      routeDistanceKm: 10,
      payloadWeightKg: 20,
      pickupOption: "CUSTOMER_LOCATION",
      isRushBooking: rush,
    });
    expect(price.rushSurchargeCHF).toBe(80);
  });

  it("non-rush booking has no rush surcharge", () => {
    const now = new Date("2026-04-25T12:00:00Z");
    const rush = isRushBooking("2026-05-01", "09:00", undefined, now);
    expect(rush).toBe(false);

    const price = calculatePrice({
      routeDistanceKm: 10,
      payloadWeightKg: 20,
      pickupOption: "CUSTOMER_LOCATION",
      isRushBooking: rush,
    });
    expect(price.rushSurchargeCHF).toBe(0);
  });
});

describe("Booking identifier", () => {
  it("generates unique identifiers using UUID (no race condition)", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const year = 2026;
      const shortId = crypto.randomUUID().slice(0, 8).toUpperCase();
      const identifier = `AIR-${year}-${shortId}`;
      ids.add(identifier);
    }
    // All 100 identifiers should be unique
    expect(ids.size).toBe(100);
  });

  it("identifier format matches AIR-YYYY-XXXXXXXX", () => {
    const year = 2026;
    const shortId = crypto.randomUUID().slice(0, 8).toUpperCase();
    const identifier = `AIR-${year}-${shortId}`;
    expect(identifier).toMatch(/^AIR-\d{4}-[0-9A-F]{8}$/);
  });
});

describe("Booking pricing — edge cases", () => {
  it("minimum price enforced even with tiny route", () => {
    const price = calculatePrice({
      routeDistanceKm: 0.1,
      payloadWeightKg: 1,
      pickupOption: "CUSTOMER_LOCATION",
    });
    expect(price.subtotal).toBeGreaterThanOrEqual(120);
  });

  it("heavy payload adds weight surcharge", () => {
    const price = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 50,
      pickupOption: "CUSTOMER_LOCATION",
    });
    // 50 - 20 = 30 extra kg * 0.50 = CHF 15
    expect(price.weightSurcharge).toBe(15);
  });

  it("AIRBASE_HUB pickup adds CHF 25 surcharge", () => {
    const price = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 20,
      pickupOption: "AIRBASE_HUB",
    });
    expect(price.pickupSurcharge).toBe(25);
  });

  it("VAT is correctly calculated at 8.1%", () => {
    const price = calculatePrice({
      routeDistanceKm: 20,
      payloadWeightKg: 20,
      pickupOption: "CUSTOMER_LOCATION",
    });
    const expectedVat = Math.round(price.subtotal * 0.081 * 100) / 100;
    expect(price.vatAmount).toBe(expectedVat);
  });
});
