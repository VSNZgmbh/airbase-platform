import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, getUserRole } from "@/lib/demo-auth";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { db } from "@/lib/db";
import { flights, bookings, pilots, drones, customers, invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { FlightReport, type FlightReportData } from "@/lib/pdf/FlightReport";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ flightId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { flightId } = await params;

  const flight = await db.query.flights.findFirst({
    where: eq(flights.id, flightId),
    with: {
      booking: {
        with: { customer: true, invoices: true },
      },
      pilot: true,
      drone: true,
    },
  });

  if (!flight) {
    return NextResponse.json({ error: "Flight not found" }, { status: 404 });
  }

  // Ownership check: operators can access all reports, others only their own
  const role = await getUserRole(userId);
  if (role !== "operator") {
    const isCustomer = flight.booking.customer?.clerkUserId === userId;
    const isPilot = flight.pilot?.clerkUserId === userId;
    if (!isCustomer && !isPilot) {
      return NextResponse.json({ error: "Forbidden: you do not have access to this flight report" }, { status: 403 });
    }
  }

  const booking = flight.booking;
  const customer = booking.customer;
  const pilot = flight.pilot;
  const drone = flight.drone;
  const invoice = booking.invoices?.[0];

  const postFlightData = flight.flightPlanJson as {
    postFlight?: {
      actualWeightKg?: number;
      flightDurationMinutes?: number;
      submittedAt?: string;
    };
  } | null;

  const reportData: FlightReportData = {
    bookingIdentifier: booking.identifier,
    serviceType: booking.serviceType,
    serviceSubtype: booking.serviceSubtype ?? undefined,
    customerName: `${customer?.firstName ?? ""} ${customer?.lastName ?? ""}`.trim(),
    deliveryAddress: booking.deliveryAddress ?? "—",
    pickupAddress: booking.pickupAddress ?? undefined,
    routeDistanceKm: booking.routeDistanceKm ?? undefined,
    payloadWeightKg: booking.payloadWeightKg,
    payloadDescription: booking.payloadDescription ?? undefined,
    isDangerousGoods: booking.isDangerousGoods,
    pilotName: pilot ? `${pilot.firstName} ${pilot.lastName}` : "—",
    droneModel: drone?.model ?? "—",
    droneSerial: drone?.serialNumber ?? "—",
    scheduledDeparture: flight.scheduledDeparture
      ? format(new Date(flight.scheduledDeparture), "d. MMM yyyy HH:mm", { locale: de })
      : undefined,
    actualDeparture: flight.actualDeparture
      ? format(new Date(flight.actualDeparture), "d. MMM yyyy HH:mm", { locale: de })
      : undefined,
    actualArrival: flight.actualArrival
      ? format(new Date(flight.actualArrival), "d. MMM yyyy HH:mm", { locale: de })
      : undefined,
    flightDurationMinutes: postFlightData?.postFlight?.flightDurationMinutes,
    soraCategory: flight.soraCategory ?? undefined,
    grcScore: flight.grcScore ?? undefined,
    arcScore: flight.arcScore ?? undefined,
    actualWeightKg: postFlightData?.postFlight?.actualWeightKg,
    notes: flight.notes ?? undefined,
    incidentReport: flight.incidentReport ?? undefined,
    invoiceNumber: invoice?.invoiceNumber,
    totalCHF: invoice?.totalCHF ?? undefined,
    reportGeneratedAt: format(new Date(), "d. MMM yyyy HH:mm", { locale: de }),
  };

  const pdfBuffer = await renderToBuffer(
    createElement(FlightReport, { data: reportData }) as ReactElement<DocumentProps>
  );

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="airbase-flugbericht-${booking.identifier}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
