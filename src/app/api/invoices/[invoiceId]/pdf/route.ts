import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, getUserRole } from "@/lib/demo-auth";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { db } from "@/lib/db";
import { invoices, customers, bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { InvoiceReport, type InvoiceReportData } from "@/lib/pdf/InvoiceReport";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { invoiceId } = await params;

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
    with: {
      booking: true,
      customer: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Access control: operators can access all invoices, customers only their own
  const customer = invoice.customer;
  const role = await getUserRole(userId);
  if (role !== "operator" && customer.clerkUserId !== userId) {
    return NextResponse.json(
      { error: "Forbidden: you do not have access to this invoice" },
      { status: 403 }
    );
  }

  const booking = invoice.booking;

  const customerName = customer.firstName && customer.lastName
    ? `${customer.firstName} ${customer.lastName}`
    : customer.email;

  const reportData: InvoiceReportData = {
    invoiceNumber: invoice.invoiceNumber,
    bookingIdentifier: booking.identifier,
    customerName,
    customerAddress: customer.address ?? undefined,
    customerCity: customer.city ?? undefined,
    serviceType: booking.serviceType,
    flightDate: booking.requestedDate
      ? format(new Date(booking.requestedDate), "d. MMMM yyyy", { locale: de })
      : "—",
    subtotalCHF: invoice.amountCHF,
    vatPercent: booking.vatPercent ?? "8.10",
    vatCHF: invoice.vatAmountCHF ?? "0.00",
    totalCHF: invoice.totalCHF,
    dueDate: invoice.dueDate
      ? format(new Date(invoice.dueDate), "d. MMMM yyyy", { locale: de })
      : "—",
    generatedAt: format(new Date(), "d. MMM yyyy HH:mm", { locale: de }),
  };

  const pdfBuffer = await renderToBuffer(
    createElement(InvoiceReport, { data: reportData }) as ReactElement<DocumentProps>
  );

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="rechnung-${invoice.invoiceNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
