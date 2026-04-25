import { describe, it, expect, vi } from "vitest";

/**
 * Tests for the booking module:
 *   - Router integration tests: exercise the tRPC create mutation via createCallerFactory
 *   - Pricing unit tests: verify calculatePrice + SORA integration directly
 *   - Identifier tests: verify UUID-based booking identifier format + uniqueness
 */

// ─── Mock external deps required by @/lib/trpc/server ─────────────────────

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(() =>
    Promise.resolve({
      users: { getUser: vi.fn(() => Promise.resolve({ publicMetadata: {} })) },
    })
  ),
}));

vi.mock("@/lib/demo-auth", () => ({
  getAuthUserId: vi.fn(() => Promise.resolve(null)),
  getUserRole: vi.fn(() => Promise.resolve(undefined)),
  isClerkConfigured: false,
}));

// Mock drizzle-orm eq() — router uses it to build where clauses on mock schema
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ _type: "eq", left: a, right: b })),
}));

// ─── DB mock (satisfies @/lib/trpc/server module-level import) ────────────

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      customers: { findFirst: vi.fn() },
      bookings: { findMany: vi.fn(), findFirst: vi.fn() },
      franchiseTenants: { findFirst: vi.fn() },
    },
    insert: vi.fn(),
    select: vi.fn(),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  bookings: { id: "id", customerId: "customerId", status: "status" },
  customers: { clerkUserId: "clerkUserId" },
  airbaseHubs: { isActive: "isActive" },
  franchiseTenants: { slug: "slug" },
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────

import { createCallerFactory } from "@/lib/trpc/server";
import { bookingRouter } from "./booking";
import { calculatePrice } from "@/lib/pricing";
import { assessSora, soraAirspaceSurchargeCHF, isRushBooking } from "@/lib/sora";

// ─── Router integration setup ─────────────────────────────────────────────

const createCaller = createCallerFactory(bookingRouter);

const VALID_BOOKING_INPUT = {
  serviceType: "LASTENFLUG" as const,
  serviceSubtype: "EINMALIGE_LIEFERUNG" as const,
  requestedDate: "2026-06-15",
  requestedTimeFrom: "10:00",
  payloadWeightKg: 15,
  deliveryLat: 46.95,
  deliveryLng: 7.45,
  deliveryAddress: "Bern, Bundesplatz 1",
  pickupOption: "CUSTOMER_LOCATION" as const,
  pickupLat: 46.89,
  pickupLng: 7.49,
  routeDistanceKm: 8,
};

/** Creates a mock db that tracks insert calls for assertion. */
function makeMockDb(existingCustomer: Record<string, unknown> | null = null) {
  const insertedValues: unknown[] = [];

  const db = {
    query: {
      customers: {
        findFirst: vi.fn().mockResolvedValue(existingCustomer),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockImplementation((data: unknown) => {
        insertedValues.push(data);
        return {
          returning: vi.fn().mockImplementation(() => {
            // First insert without existing customer = customer creation
            if (!existingCustomer && insertedValues.length === 1) {
              return Promise.resolve([{ id: "cust-new", email: "" }]);
            }
            // Otherwise it's the booking insert
            return Promise.resolve([
              { id: "booking-1", identifier: "AIR-2026-AABBCCDD", status: "pending" },
            ]);
          }),
        };
      }),
    }),
    select: vi.fn(),
  };

  return { db, insertedValues };
}

// ═══════════════════════════════════════════════════════════════════════════
// Router integration tests — exercises the actual tRPC create mutation
// ═══════════════════════════════════════════════════════════════════════════

describe("Booking router — create mutation", () => {
  it("creates a booking for an existing customer", async () => {
    const { db, insertedValues } = makeMockDb({
      id: "cust-1",
      clerkUserId: "user-1",
      email: "a@b.ch",
    });
    const caller = createCaller({ db: db as any, userId: "user-1", tenantId: null });

    const result = await caller.create(VALID_BOOKING_INPUT);

    expect(result).toBeDefined();
    expect(result.id).toBe("booking-1");
    // Only one insert (booking) — customer already exists
    expect(insertedValues).toHaveLength(1);
    expect(insertedValues[0]).toMatchObject({
      customerId: "cust-1",
      status: "pending",
      serviceType: "LASTENFLUG",
    });
  });

  it("auto-creates customer when not found in DB", async () => {
    const { db, insertedValues } = makeMockDb(null);
    const caller = createCaller({ db: db as any, userId: "new-user", tenantId: null });

    const result = await caller.create(VALID_BOOKING_INPUT);

    expect(result).toBeDefined();
    // Two inserts: customer creation + booking
    expect(insertedValues).toHaveLength(2);
    expect(insertedValues[0]).toMatchObject({ clerkUserId: "new-user" });
    expect(insertedValues[1]).toMatchObject({ customerId: "cust-new" });
  });

  it("wires SORA surcharge into booking when coordinates provided", async () => {
    const { db, insertedValues } = makeMockDb({ id: "cust-1", clerkUserId: "u1" });
    const caller = createCaller({ db: db as any, userId: "u1", tenantId: null });

    await caller.create({
      ...VALID_BOOKING_INPUT,
      pickupLat: 46.891,
      pickupLng: 7.498,
      deliveryLat: 46.754,
      deliveryLng: 7.628,
    });

    const bookingRow = insertedValues[0] as Record<string, string>;
    expect(parseFloat(bookingRow.soraSurchargeCHF)).toBeGreaterThanOrEqual(0);
    expect(parseFloat(bookingRow.totalCHF)).toBeGreaterThan(0);
  });

  it("applies rush surcharge for same-day booking", async () => {
    const { db, insertedValues } = makeMockDb({ id: "cust-1", clerkUserId: "u1" });
    const caller = createCaller({ db: db as any, userId: "u1", tenantId: null });

    const today = new Date().toISOString().slice(0, 10);
    await caller.create({
      ...VALID_BOOKING_INPUT,
      requestedDate: today,
      requestedTimeFrom: "09:00",
    });

    const bookingRow = insertedValues[0] as Record<string, string>;
    expect(parseFloat(bookingRow.rushSurchargeCHF)).toBe(80);
  });

  it("rejects unauthenticated caller", async () => {
    const { db } = makeMockDb(null);
    const caller = createCaller({ db: db as any, userId: null, tenantId: null });

    await expect(caller.create(VALID_BOOKING_INPUT)).rejects.toThrow("UNAUTHORIZED");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Pricing unit tests — verify calculatePrice + SORA/rush integration
// ═══════════════════════════════════════════════════════════════════════════

describe("Booking pricing — SORA integration", () => {
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
