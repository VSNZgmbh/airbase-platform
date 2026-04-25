import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, flights, permits } from "@/lib/db/schema";
import { requiresBernBelpPermit } from "@/lib/geo";

export const runtime = "nodejs";

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
    try {
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

      // 2. Create flight record — pending_assignment until operator assigns drone + pilot
      const [flight] = await tx
        .insert(flights)
        .values({
          bookingId,
          status: "pending_assignment",
          scheduledDeparture: new Date(booking.requestedDate),
          notes: "Auto-created on payment confirmation — awaiting resource assignment",
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

      // M3: CTR polygon intersection check (FOCA/BAZL compliance).
      // Triggers a permit whenever the straight-line route transits the
      // Bern-Belp CTR (LSZB, 5 NM radius), including routes whose endpoints
      // lie outside the CTR but whose path crosses it (e.g. Münsingen → Thun).
      const pickupLng = booking.pickupLng ? parseFloat(booking.pickupLng) : null;
      const pickupLat = booking.pickupLat ? parseFloat(booking.pickupLat) : null;
      const deliveryLng = booking.deliveryLng ? parseFloat(booking.deliveryLng) : null;
      const deliveryLat = booking.deliveryLat ? parseFloat(booking.deliveryLat) : null;

      if (
        pickupLng !== null &&
        pickupLat !== null &&
        deliveryLng !== null &&
        deliveryLat !== null &&
        requiresBernBelpPermit(pickupLng, pickupLat, deliveryLng, deliveryLat)
      ) {
        permitsToCreate.push({
          flightId: flight.id,
          authority: "Flughafen Bern-Belp",
          notes:
            "Route schneidet Bern-Belp CTR (LSZB, 5 NM) — Bewilligung gemäss FOCA/BAZL erforderlich",
        });
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
    } catch (err) {
      console.error("[Stripe webhook] Transaction failed:", err);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
