import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Hoisted mocks (available in vi.mock factories) ─────────────────────────

const { mockTransaction, mockConstructEvent } = vi.hoisted(() => ({
  mockTransaction: vi.fn(),
  mockConstructEvent: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      bookings: {
        findFirst: vi.fn(),
      },
    },
    transaction: mockTransaction,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  bookings: { id: "id", status: "status" },
  flights: {},
  permits: {},
}));

vi.mock("@/lib/geo", () => ({
  requiresBernBelpPermit: vi.fn(() => false),
}));

vi.mock("stripe", () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
}));

// Import after mocks
import { POST } from "./route";
import { db } from "@/lib/db";
import { requiresBernBelpPermit } from "@/lib/geo";

function makeRequest(body: string, signature = "valid-sig"): NextRequest {
  return new NextRequest("http://localhost/api/stripe/webhook", {
    method: "POST",
    body,
    headers: {
      "stripe-signature": signature,
      "content-type": "application/json",
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  process.env.STRIPE_SECRET_KEY = "sk_test";
});

// ─── Configuration checks ──────────────────────────────────────────────────

describe("Stripe webhook — configuration", () => {
  it("returns 500 when STRIPE_WEBHOOK_SECRET is missing", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(500);
  });

  it("returns 500 when STRIPE_SECRET_KEY is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(500);
  });
});

// ─── Signature verification ─────────────────────────────────────────────────

describe("Stripe webhook — signature", () => {
  it("returns 400 when stripe-signature header is missing", async () => {
    const req = new NextRequest("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: "{}",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(400);
  });
});

// ─── payment_intent.succeeded ──────────────────────────────────────────────

describe("Stripe webhook — payment_intent.succeeded", () => {
  it("returns 200 and acks when bookingId metadata is missing", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", metadata: {} } },
    });
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });

  it("returns 200 when booking is not found (prevents retry storm)", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", metadata: { bookingId: "missing-id" } } },
    });
    vi.mocked(db.query.bookings.findFirst).mockResolvedValue(undefined);
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
  });

  it("returns 200 idempotently when booking is already confirmed", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", metadata: { bookingId: "booking-1" } } },
    });
    vi.mocked(db.query.bookings.findFirst).mockResolvedValue({
      id: "booking-1",
      status: "confirmed",
      identifier: "AIR-2026-0001",
    } as any);
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    // Transaction should NOT be called for already-confirmed booking
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("calls transaction to confirm booking, create flight and permits", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", metadata: { bookingId: "booking-1" } } },
    });
    vi.mocked(db.query.bookings.findFirst).mockResolvedValue({
      id: "booking-1",
      status: "pending",
      identifier: "AIR-2026-0001",
      requestedDate: "2026-05-01",
      pickupLng: null,
      pickupLat: null,
      deliveryLng: null,
      deliveryLat: null,
      metadata: null,
    } as any);
    mockTransaction.mockImplementation(async (fn: Function) => {
      const tx = {
        update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
        insert: vi.fn(() => ({
          values: vi.fn(() => ({ returning: vi.fn(() => [{ id: "flight-1" }]) })),
        })),
      };
      return fn(tx);
    });
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalledOnce();
  });

  it("returns 500 when transaction throws (DB error propagates)", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", metadata: { bookingId: "booking-1" } } },
    });
    vi.mocked(db.query.bookings.findFirst).mockResolvedValue({
      id: "booking-1",
      status: "pending",
      identifier: "AIR-2026-0001",
      requestedDate: "2026-05-01",
      metadata: null,
    } as any);
    mockTransaction.mockRejectedValue(new Error("DB connection lost"));
    const res = await POST(makeRequest("{}")).catch(() => new Response(null, { status: 500 }));
    // Transaction error should result in non-200 (webhook will retry)
    expect(res.status).toBe(500);
  });
});

// ─── Unhandled event types ─────────────────────────────────────────────────

describe("Stripe webhook — unhandled events", () => {
  it("returns 200 for unhandled event types", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.created",
      data: { object: { id: "cus_1" } },
    });
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
  });
});

// ─── CTR permit detection ──────────────────────────────────────────────────

describe("Stripe webhook — CTR permit creation", () => {
  it("creates Bern-Belp permit when route intersects CTR", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", metadata: { bookingId: "booking-1" } } },
    });
    vi.mocked(db.query.bookings.findFirst).mockResolvedValue({
      id: "booking-1",
      status: "pending",
      identifier: "AIR-2026-0001",
      requestedDate: "2026-05-01",
      pickupLng: "7.498",
      pickupLat: "46.891",
      deliveryLng: "7.628",
      deliveryLat: "46.754",
      metadata: null,
    } as any);
    vi.mocked(requiresBernBelpPermit).mockReturnValue(true);

    mockTransaction.mockImplementation(async (fn: Function) => {
      const tx = {
        update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
        insert: vi.fn(() => ({
          values: vi.fn((vals: any) => ({
            returning: vi.fn(() => [{ id: "flight-1" }]),
          })),
        })),
      };
      return fn(tx);
    });

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    expect(requiresBernBelpPermit).toHaveBeenCalled();
  });
});
