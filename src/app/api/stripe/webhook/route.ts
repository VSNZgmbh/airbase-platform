import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, flights, permits } from "@/lib/db/schema";

export const runtime = "nodejs";

// Bern-Belp Airport coordinates (for 5 km proximity check)
const BERN_BELP_LAT = 46.9141;
const BERN_BELP_LNG = 7.4977;

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
      console.error(`[Stripe webhook] Booking ${bookingId} not found`);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "confirmed") {
      // Idempotent — already processed
      return NextResponse.json({ received: true });
    }

    const now = new Date();

    // 1. Update booking to confirmed
    await db
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
    const [flight] = await db
      .insert(flights)
      .values({
        bookingId,
        status: "scheduled",
        scheduledDeparture: new Date(booking.requestedDate),
        notes: "Auto-created on payment confirmation",
      })
      .returning();

    console.log(`[Stripe webhook] Flight ${flight.id} created for booking ${booking.identifier}`);

    // 3. Create permit placeholders
    const permitsToCreate: { flightId: string; authority: string; notes: string }[] = [
      {
        flightId: flight.id,
        authority: "BAZL",
        notes: "Automatisch erstellt — Bewilligung ausstehend",
      },
    ];

    // Check proximity to Bern-Belp Airport
    if (booking.deliveryLat && booking.deliveryLng) {
      const distToBernBelp = haversineKm(
        parseFloat(booking.deliveryLat),
        parseFloat(booking.deliveryLng),
        BERN_BELP_LAT,
        BERN_BELP_LNG
      );
      if (distToBernBelp <= 5) {
        permitsToCreate.push({
          flightId: flight.id,
          authority: "Flughafen Bern-Belp",
          notes: `Route liegt ${distToBernBelp.toFixed(1)} km vom Flughafen Bern-Belp — Bewilligung erforderlich`,
        });
      }
    }

    // Always create Bern-Belp placeholder if pickup is also near
    if (booking.pickupLat && booking.pickupLng) {
      const distPickupToBernBelp = haversineKm(
        parseFloat(booking.pickupLat),
        parseFloat(booking.pickupLng),
        BERN_BELP_LAT,
        BERN_BELP_LNG
      );
      if (distPickupToBernBelp <= 5) {
        const alreadyAdded = permitsToCreate.some((p) => p.authority === "Flughafen Bern-Belp");
        if (!alreadyAdded) {
          permitsToCreate.push({
            flightId: flight.id,
            authority: "Flughafen Bern-Belp",
            notes: `Abflugort liegt ${distPickupToBernBelp.toFixed(1)} km vom Flughafen Bern-Belp — Bewilligung erforderlich`,
          });
        }
      }
    }

    await db.insert(permits).values(
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
  }

  return NextResponse.json({ received: true });
}
