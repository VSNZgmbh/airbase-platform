import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, flights, permits } from "@/lib/db/schema";

export const runtime = "nodejs";

// Bern-Belp Airport coordinates
const BERN_BELP_LAT = 46.9141;
const BERN_BELP_LNG = 7.4977;

// Conservative buffer: 10 km covers the Bern-Belp CTR (approx 3–5 NM radius).
// TODO (M3 — COO input required): This check only tests route *endpoints*, not the
// full route segment. Operations whose route transits the CTR without endpoints inside
// the buffer will be missed. Correct fix: intersect route waypoints (stored in
// flights.flightPlanJson after dispatch) against the official Bern-Belp CTR polygon
// (ICAO AIP AD 2-LSZB). Awaiting COO sign-off on regulatory threshold — see subtask.
const BERN_BELP_CTR_BUFFER_KM = 10;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const bookingId = paymentIntent.metadata?.bookingId;

    if (!bookingId) {
      console.warn("[Stripe webhook] payment_intent.succeeded missing bookingId metadata");
      return NextResponse.json({ received: true });
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      // M2: Return 200 so Stripe does not retry indefinitely for a genuinely missing booking.
      // A non-2xx response triggers Stripe's retry storm (up to 72 h). Log the anomaly for ops.
      console.error(
        `[Stripe webhook] Booking ${bookingId} not found — acknowledging to prevent retry storm`
      );
      return NextResponse.json({ received: true });
    }

    if (booking.status === "confirmed") {
      // Idempotent — already processed
      return NextResponse.json({ received: true });
    }

    const now = new Date();

    // C1: Wrap all three mutations in a single transaction so a partial failure
    // (e.g. permits insert) cannot leave the booking confirmed with no regulatory records.
    await db.transaction(async (tx) => {
      // 1. Update booking to confirmed
      await tx
        .update(bookings)
        .set({
          status: "confirmed",
          metadata: {
            ...((booking.metadata as Record<string, unknown>) ?? {}),
            stripePaymentIntentId: paymentIntent.id,
            confirmedAt: now.toISOString(),
          },
          updatedAt: now,
        })
        .where(eq(bookings.id, bookingId));

      // 2. Create flight record
      const [flight] = await tx
        .insert(flights)
        .values({
          bookingId,
          status: "scheduled",
          scheduledDeparture: new Date(booking.requestedDate),
          notes: "Auto-created on payment confirmation",
        })
        .returning();

      console.log(
        `[Stripe webhook] Flight ${flight.id} created for booking ${booking.identifier}`
      );

      // 3. Build permit list and insert atomically with flight
      const permitsToCreate: { flightId: string; authority: string; notes: string }[] = [
        {
          flightId: flight.id,
          authority: "BAZL",
          notes: "Automatisch erstellt — Bewilligung ausstehend",
        },
      ];

      // M3 interim: use conservative 10 km buffer (covers Bern-Belp CTR)
      // for both delivery and pickup endpoints.
      const checkPoints: Array<{ lat: string | null; lng: string | null; label: string }> = [
        { lat: booking.deliveryLat, lng: booking.deliveryLng, label: "Lieferort" },
        { lat: booking.pickupLat ?? null, lng: booking.pickupLng ?? null, label: "Abflugort" },
      ];

      for (const point of checkPoints) {
        if (!point.lat || !point.lng) continue;
        const dist = haversineKm(
          parseFloat(point.lat),
          parseFloat(point.lng),
          BERN_BELP_LAT,
          BERN_BELP_LNG
        );
        if (dist <= BERN_BELP_CTR_BUFFER_KM) {
          const alreadyAdded = permitsToCreate.some((p) => p.authority === "Flughafen Bern-Belp");
          if (!alreadyAdded) {
            permitsToCreate.push({
              flightId: flight.id,
              authority: "Flughafen Bern-Belp",
              notes: `${point.label} liegt ${dist.toFixed(1)} km vom Flughafen Bern-Belp (konservativer CTR-Puffer 10 km) — Bewilligung erforderlich`,
            });
          }
        }
      }

      await tx.insert(permits).values(
        permitsToCreate.map((p) => ({
          flightId: p.flightId,
          authority: p.authority,
          status: "pending" as const,
          notes: p.notes,
        }))
      );

      console.log(
        `[Stripe webhook] ${permitsToCreate.length} permit(s) created for flight ${flight.id}`
      );
    });
  }

  return NextResponse.json({ received: true });
}
