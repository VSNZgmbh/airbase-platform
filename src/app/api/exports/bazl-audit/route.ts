import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, getUserRole } from "@/lib/demo-auth";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { db } from "@/lib/db";
import {
  flightAuthorizations,
  safetyOccurrences,
  franchiseTenants,
} from "@/lib/db/schema";
import { and, gte, lte, eq, desc, inArray, or } from "drizzle-orm";
import archiver from "archiver";
import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import {
  FlightAuthorizationReport,
  type FlightAuthorizationReportData,
} from "@/lib/pdf/FlightAuthorizationReport";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const LUC_NUMBER = process.env.LUC_NUMBER ?? "CH.LUC.AIRBASE-001";

function fmtDate(d: Date | null | undefined): string {
  return d ? format(new Date(d), "d. MMM yyyy HH:mm", { locale: de }) : "—";
}

function fmtDateShort(d: Date | null | undefined): string {
  return d ? format(new Date(d), "yyyy-MM-dd") : "—";
}

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Accountable Manager only (BAZL LUC Tier 3)
  const role = await getUserRole(userId);
  if (role !== "accountable_manager") {
    return NextResponse.json(
      { error: "Forbidden: accountable_manager role required for BAZL audit export" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  if (!fromStr || !toStr) {
    return NextResponse.json(
      { error: "Missing required query parameters: from, to (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const fromDate = new Date(fromStr + "T00:00:00Z");
  const toDate = new Date(toStr + "T23:59:59.999Z");

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

  if (fromDate > toDate) {
    return NextResponse.json(
      { error: "'from' date must be before or equal to 'to' date" },
      { status: 400 }
    );
  }

  const MAX_RANGE_DAYS = 180;
  const rangeDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  if (rangeDays > MAX_RANGE_DAYS) {
    return NextResponse.json(
      { error: `Date range exceeds maximum of ${MAX_RANGE_DAYS} days. Please narrow your export period.` },
      { status: 400 }
    );
  }

  // Fetch all authorizations in the date range
  const authorizations = await db
    .select()
    .from(flightAuthorizations)
    .where(
      and(
        gte(flightAuthorizations.decidedAt, fromDate),
        lte(flightAuthorizations.decidedAt, toDate)
      )
    )
    .orderBy(desc(flightAuthorizations.decidedAt));

  // Fetch SORs: those reported in the date range OR linked to in-range authorizations
  const authIds = authorizations.map((a) => a.id);
  const occurrences = await db
    .select()
    .from(safetyOccurrences)
    .where(
      or(
        and(
          gte(safetyOccurrences.reportedAt, fromDate),
          lte(safetyOccurrences.reportedAt, toDate)
        ),
        ...(authIds.length > 0
          ? [inArray(safetyOccurrences.authorizationId, authIds)]
          : [])
      )
    )
    .orderBy(desc(safetyOccurrences.reportedAt));

  // Fetch tenant names for all authorizations
  const tenantIds = [
    ...new Set(
      authorizations
        .map((a) => a.franchiseTenantId)
        .filter((id): id is string => id != null)
    ),
  ];
  const tenantMap = new Map<string, string>();
  if (tenantIds.length > 0) {
    const tenants = await db
      .select({ id: franchiseTenants.id, name: franchiseTenants.name })
      .from(franchiseTenants)
      .where(inArray(franchiseTenants.id, tenantIds));
    for (const t of tenants) {
      tenantMap.set(t.id, t.name);
    }
  }

  // Build SOR lookup by authorizationId
  const sorByAuth = new Map<string, typeof occurrences>();
  for (const occ of occurrences) {
    if (occ.authorizationId) {
      const existing = sorByAuth.get(occ.authorizationId) ?? [];
      existing.push(occ);
      sorByAuth.set(occ.authorizationId, existing);
    }
  }

  // Create ZIP archive
  const exportId = randomUUID();
  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  archive.on("data", (chunk: Buffer) => chunks.push(chunk));

  const archiveFinished = new Promise<void>((resolve, reject) => {
    archive.on("end", resolve);
    archive.on("error", reject);
  });

  // Generate individual PDFs for each authorization
  for (const auth of authorizations) {
    const weatherJson = auth.weatherResultJson as {
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

    const notamJson = auth.notamResultJson as {
      overallSeverity?: string;
      alerts?: string[];
      affectedAreas?: string[];
      notams?: Array<{ message?: string; area?: string }>;
    } | null;

    const soraJson = auth.soraResultJson as {
      populationDensity?: string;
      airspaceClass?: string;
      alpineZone?: boolean;
      riskFactors?: string[];
    } | null;

    const weatherPoint = (p: { windSpeedMs?: number; precipitationMm?: number; visibilityM?: number | null; temperature?: number; warnings?: string[] } | undefined) => ({
      windSpeedMs: p?.windSpeedMs ?? 0,
      precipitationMm: p?.precipitationMm ?? 0,
      visibilityM: p?.visibilityM ?? null,
      temperature: p?.temperature ?? 0,
      warnings: p?.warnings ?? [],
    });

    const linkedSORs = (sorByAuth.get(auth.id) ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      severity: s.severity,
    }));

    const reportData: FlightAuthorizationReportData = {
      authorizationId: auth.id,
      lucNumber: LUC_NUMBER,
      tenantName: auth.franchiseTenantId
        ? tenantMap.get(auth.franchiseTenantId) ?? "AIRBASE"
        : "AIRBASE",
      createdAt: fmtDate(auth.createdAt),
      decidedAt: fmtDate(auth.decidedAt),
      requestedForDatetime: fmtDate(auth.requestedForDatetime),
      pickupLat: auth.pickupLat,
      pickupLng: auth.pickupLng,
      deliveryLat: auth.deliveryLat,
      deliveryLng: auth.deliveryLng,
      altitudeAgl: auth.altitudeAgl ?? 120,
      sailLevel: auth.sailLevel ?? "—",
      grcScore: auth.grcScore ?? 0,
      arcLevel: auth.arcLevel ?? "—",
      overallRisk: auth.overallRisk ?? "—",
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
        alerts:
          notamJson?.alerts ??
          notamJson?.notams?.map((n) => n.message ?? "").filter(Boolean) ??
          [],
        affectedAreas:
          notamJson?.affectedAreas ??
          notamJson?.notams?.map((n) => n.area ?? "").filter(Boolean) ??
          [],
      },
      decision: auth.decision,
      decisionReason: auth.decisionReason,
      decisionBy: auth.decisionBy,
      decisionByUserId: auth.decisionByUserId ?? undefined,
      safetyManagerDecision: auth.safetyManagerDecision ?? undefined,
      safetyManagerUserId: auth.safetyManagerUserId ?? undefined,
      safetyManagerDecidedAt: auth.safetyManagerDecidedAt
        ? fmtDate(auth.safetyManagerDecidedAt)
        : undefined,
      linkedSORs,
      bazlExportedAt: auth.bazlExportedAt
        ? fmtDate(auth.bazlExportedAt)
        : undefined,
      retentionExpiresAt: auth.retentionExpiresAt
        ? fmtDate(auth.retentionExpiresAt)
        : undefined,
      reportGeneratedAt: format(new Date(), "d. MMM yyyy HH:mm", {
        locale: de,
      }),
    };

    const pdfBuffer = await renderToBuffer(
      createElement(FlightAuthorizationReport, {
        data: reportData,
      }) as ReactElement<DocumentProps>
    );

    archive.append(Buffer.from(pdfBuffer), {
      name: `authorizations/${fmtDateShort(auth.decidedAt)}_${auth.id.slice(0, 8)}.pdf`,
    });
  }

  // CSV summary of authorizations
  const csvHeader =
    "authorization_id,decided_at,decision,decision_by,sail_level,grc_score,arc_level,overall_risk,pickup_lat,pickup_lng,delivery_lat,delivery_lng,altitude_agl\n";
  const q = (v: string | null | undefined) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const csvRows = authorizations
    .map(
      (a) =>
        `${a.id},${a.decidedAt?.toISOString() ?? ""},${q(a.decision)},${q(a.decisionBy)},${q(a.sailLevel)},${a.grcScore ?? ""},${q(a.arcLevel)},${q(a.overallRisk)},${a.pickupLat},${a.pickupLng},${a.deliveryLat},${a.deliveryLng},${a.altitudeAgl ?? ""}`
    )
    .join("\n");
  archive.append(csvHeader + csvRows, { name: "authorizations_summary.csv" });

  // CSV summary of safety occurrences (ECCAIRS-compliant fields)
  const sorCsvHeader =
    "occurrence_id,title,severity,status,category,reported_at,incident_occurred_at,phase_of_operation,is_near_miss,root_cause,corrective_actions,bazl_reference_number,eccairs_report_id\n";
  const sorCsvRows = occurrences
    .map(
      (o) =>
        `${o.id},${q(o.title)},${q(o.severity)},${q(o.status)},${q(o.category)},${o.reportedAt?.toISOString() ?? ""},${o.incidentOccurredAt?.toISOString() ?? ""},${q(o.phaseOfOperation)},${o.isNearMiss},${q(o.rootCause)},${q(o.correctiveActions)},${q(o.bazlReferenceNumber)},${q(o.eccairsReportId)}`
    )
    .join("\n");
  archive.append(sorCsvHeader + sorCsvRows, {
    name: "safety_occurrences.csv",
  });

  // JSON manifest
  const manifest = {
    exportId,
    generatedAt: new Date().toISOString(),
    generatedBy: userId,
    lucNumber: LUC_NUMBER,
    period: {
      from: fromStr,
      to: toStr,
    },
    records: {
      authorizations: authorizations.length,
      approved: authorizations.filter((a) => a.decision === "approved").length,
      rejected: authorizations.filter((a) => a.decision === "rejected").length,
      escalated: authorizations.filter((a) => a.decision === "escalated")
        .length,
      safetyOccurrences: occurrences.length,
    },
    regulationReference:
      "EASA UAS Regulation (EU) 2019/947, BAZL LUC Requirements, EU 376/2014 (Safety Occurrence Reporting)",
    retentionPolicy: {
      flightAuthorizations: "3 years",
      safetyOccurrences: "5 years (EU 376/2014)",
      telemetryData: "1 year",
    },
  };
  archive.append(JSON.stringify(manifest, null, 2), {
    name: "manifest.json",
  });

  archive.finalize();
  await archiveFinished;

  // Mark exported authorizations with bazlExportedAt timestamp (atomic batch)
  const now = new Date();
  const unexportedIds = authorizations
    .filter((a) => !a.bazlExportedAt)
    .map((a) => a.id);
  if (unexportedIds.length > 0) {
    await db
      .update(flightAuthorizations)
      .set({ bazlExportedAt: now, updatedAt: now })
      .where(inArray(flightAuthorizations.id, unexportedIds));
  }

  const zipBuffer = Buffer.concat(chunks);

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="bazl-audit-${fromStr}-to-${toStr}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
