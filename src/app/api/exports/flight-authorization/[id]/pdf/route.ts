import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, getUserRole, getUserTenantId } from "@/lib/demo-auth";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { db } from "@/lib/db";
import {
  flightAuthorizations,
  safetyOccurrences,
  franchiseTenants,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  FlightAuthorizationReport,
  type FlightAuthorizationReportData,
} from "@/lib/pdf/FlightAuthorizationReport";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const LUC_NUMBER = process.env.LUC_NUMBER ?? "CH.LUC.AIRBASE-001";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only operators, safety managers, and accountable managers can access
  const role = await getUserRole(userId);
  if (!role || !["operator", "safety_manager", "accountable_manager"].includes(role)) {
    return NextResponse.json(
      { error: "Forbidden: operator, safety_manager, or accountable_manager role required" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const authorization = await db.query.flightAuthorizations.findFirst({
    where: eq(flightAuthorizations.id, id),
    with: {
      franchiseTenant: true,
    },
  });

  if (!authorization) {
    return NextResponse.json(
      { error: "Flight authorization not found" },
      { status: 404 }
    );
  }

  // C-1 fix: Tenant isolation — operators and safety managers can only access their own tenant's records
  // Tenantless authorizations are restricted to accountable_manager only (prevents null-tenant bypass)
  if (role !== "accountable_manager") {
    const requesterTenantId = await getUserTenantId(userId);
    if (!authorization.franchiseTenantId || requesterTenantId !== authorization.franchiseTenantId) {
      return NextResponse.json(
        { error: "Forbidden: you do not have access to this tenant's records" },
        { status: 403 }
      );
    }
  }

  // Fetch linked SORs for this authorization
  const linkedSORs = await db
    .select({
      id: safetyOccurrences.id,
      title: safetyOccurrences.title,
      severity: safetyOccurrences.severity,
    })
    .from(safetyOccurrences)
    .where(eq(safetyOccurrences.authorizationId, id));

  const fmtDate = (d: Date | null | undefined) =>
    d ? format(new Date(d), "d. MMM yyyy HH:mm", { locale: de }) : "—";

  const weatherJson = authorization.weatherResultJson as {
    overallCondition?: "safe" | "marginal" | "unsafe";
    pickup?: {
      windSpeedMs?: number;
      precipitationMm?: number;
      visibilityM?: number | null;
      temperature?: number;
      warnings?: string[];
    };
    delivery?: {
      windSpeedMs?: number;
      precipitationMm?: number;
      visibilityM?: number | null;
      temperature?: number;
      warnings?: string[];
    };
  } | null;

  const notamJson = authorization.notamResultJson as {
    overallSeverity?: string;
    alerts?: string[];
    affectedAreas?: string[];
    notams?: Array<{ message?: string; area?: string }>;
  } | null;

  const soraJson = authorization.soraResultJson as {
    populationDensity?: string;
    airspaceClass?: string;
    alpineZone?: boolean;
    riskFactors?: string[];
  } | null;

  const weatherPoint = (p: typeof weatherJson extends null ? never : NonNullable<typeof weatherJson>["pickup"]) => ({
    windSpeedMs: p?.windSpeedMs ?? 0,
    precipitationMm: p?.precipitationMm ?? 0,
    visibilityM: p?.visibilityM ?? null,
    temperature: p?.temperature ?? 0,
    warnings: p?.warnings ?? [],
  });

  const reportData: FlightAuthorizationReportData = {
    authorizationId: authorization.id,
    lucNumber: LUC_NUMBER,
    tenantName: authorization.franchiseTenant?.name ?? "AIRBASE",
    createdAt: fmtDate(authorization.createdAt),
    decidedAt: fmtDate(authorization.decidedAt),
    requestedForDatetime: fmtDate(authorization.requestedForDatetime),

    pickupLat: authorization.pickupLat,
    pickupLng: authorization.pickupLng,
    deliveryLat: authorization.deliveryLat,
    deliveryLng: authorization.deliveryLng,
    altitudeAgl: authorization.altitudeAgl ?? 120,

    sailLevel: authorization.sailLevel ?? "—",
    grcScore: authorization.grcScore ?? 0,
    arcLevel: authorization.arcLevel ?? "—",
    overallRisk: authorization.overallRisk ?? "—",
    soraDetails: soraJson
      ? {
          populationDensity: soraJson.populationDensity,
          airspaceClass: soraJson.airspaceClass,
          alpineZone: soraJson.alpineZone,
          riskFactors: soraJson.riskFactors,
        }
      : undefined,

    weather: {
      overallCondition: weatherJson?.overallCondition ?? "safe",
      pickup: weatherPoint(weatherJson?.pickup),
      delivery: weatherPoint(weatherJson?.delivery),
    },

    notam: {
      overallSeverity: notamJson?.overallSeverity ?? "clear",
      alerts: notamJson?.alerts ?? notamJson?.notams?.map((n) => n.message ?? "").filter(Boolean) ?? [],
      affectedAreas: notamJson?.affectedAreas ?? notamJson?.notams?.map((n) => n.area ?? "").filter(Boolean) ?? [],
    },

    decision: authorization.decision,
    decisionReason: authorization.decisionReason,
    decisionBy: authorization.decisionBy,
    decisionByUserId: authorization.decisionByUserId ?? undefined,
    safetyManagerDecision: authorization.safetyManagerDecision ?? undefined,
    safetyManagerUserId: authorization.safetyManagerUserId ?? undefined,
    safetyManagerDecidedAt: authorization.safetyManagerDecidedAt
      ? fmtDate(authorization.safetyManagerDecidedAt)
      : undefined,

    linkedSORs: linkedSORs.map((s) => ({
      id: s.id,
      title: s.title,
      severity: s.severity,
    })),

    bazlExportedAt: authorization.bazlExportedAt
      ? fmtDate(authorization.bazlExportedAt)
      : undefined,
    retentionExpiresAt: authorization.retentionExpiresAt
      ? fmtDate(authorization.retentionExpiresAt)
      : undefined,
    reportGeneratedAt: format(new Date(), "d. MMM yyyy HH:mm", { locale: de }),
  };

  const pdfBuffer = await renderToBuffer(
    createElement(FlightAuthorizationReport, {
      data: reportData,
    }) as ReactElement<DocumentProps>
  );

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bazl-authorization-${authorization.id.slice(0, 8)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
