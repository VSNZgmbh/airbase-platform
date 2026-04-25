/**
 * Safety Router — LUC Self-Authorization Engine + Safety Dashboard
 *
 * Implements the core of AIRBASE's LUC (Light UAS Operator Certificate) system.
 * Operators with LUC can self-authorize flights instead of waiting for BAZL approval.
 *
 * Authorization logic:
 *   1. SORA assessment (GRC, ARC, SAIL)
 *   2. Real-time weather check (Open-Meteo)
 *   3. NOTAM awareness (Skyguide FIR)
 *   4. Combined Go / No-Go / Escalate decision
 *   5. Full audit log to `flight_authorizations` for BAZL LUC audits
 *
 * Decision thresholds:
 *   - APPROVED:  SAIL ≤ III AND weather=safe AND notam=clear/info
 *   - ESCALATED: SAIL IV OR weather=marginal OR notam=warning
 *   - REJECTED:  SAIL V/VI OR weather=unsafe OR notam=critical
 */

import { z } from "zod";
import { desc, eq, and, gte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  operatorProcedure,
  protectedProcedure,
  safetyManagerProcedure,
  accountableManagerProcedure,
} from "@/lib/trpc/server";
import {
  flightAuthorizations,
  safetyOccurrences,
  franchiseTenants,
} from "@/lib/db/schema";
import { assessSora, type SAILLevel } from "@/lib/sora";
import { checkRouteNotams } from "./notam";

// ─── Weather helper (inline fetch to avoid circular dep) ──────────────────────

interface WeatherResult {
  condition: "safe" | "marginal" | "unsafe";
  windSpeedMs: number;
  precipitationMm: number;
  visibilityM: number | null;
  cloudCoverPercent: number;
  temperature: number;
  warnings: string[];
  fetchedAt: string;
}

async function fetchWeather(lat: number, lng: number, datetime: string): Promise<WeatherResult> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(6),
    longitude: lng.toFixed(6),
    hourly: "temperature_2m,wind_speed_10m,precipitation,visibility,cloud_cover",
    wind_speed_unit: "ms",
    forecast_days: "3",
    timezone: "Europe/Zurich",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  const data = await res.json();
  const times: string[] = data.hourly.time;
  const target = new Date(datetime).getTime();
  let closest = 0;
  let minDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - target);
    if (diff < minDiff) { minDiff = diff; closest = i; }
  }
  const wind = data.hourly.wind_speed_10m[closest] ?? 0;
  const precip = data.hourly.precipitation[closest] ?? 0;
  const vis = data.hourly.visibility[closest] ?? null;
  const cloud = data.hourly.cloud_cover[closest] ?? 0;
  const temp = data.hourly.temperature_2m[closest] ?? 0;
  const warnings: string[] = [];
  let condition: WeatherResult["condition"] = "safe";
  if (wind > 12) { warnings.push(`Wind ${wind.toFixed(1)} m/s > 12 m/s Limit`); condition = "unsafe"; }
  else if (wind > 9) { warnings.push(`Wind ${wind.toFixed(1)} m/s nähert sich Limit`); if (condition === "safe") condition = "marginal"; }
  if (precip > 0.2) { warnings.push(`Niederschlag ${precip.toFixed(1)} mm/h`); condition = "unsafe"; }
  if (vis !== null && vis < 5000) { warnings.push(`Sichtweite ${vis}m < 5000m VLOS-Minimum`); condition = "unsafe"; }
  else if (vis !== null && vis < 7500) { warnings.push(`Eingeschränkte Sichtweite ${vis}m`); if (condition === "safe") condition = "marginal"; }
  if (cloud > 80) { if (condition === "safe") condition = "marginal"; }
  return { condition, windSpeedMs: wind, precipitationMm: precip, visibilityM: vis, cloudCoverPercent: cloud, temperature: temp, warnings, fetchedAt: new Date().toISOString() };
}

// ─── Decision Engine ──────────────────────────────────────────────────────────

type Decision = "approved" | "rejected" | "escalated";

function computeDecision(
  sail: SAILLevel,
  weatherCondition: "safe" | "marginal" | "unsafe",
  notamSeverity: string,
): { decision: Decision; reason: string } {
  // Hard rejections
  if (sail === "V" || sail === "VI") {
    return { decision: "rejected", reason: `SAIL ${sail} übersteigt LUC-Selbstfreigabe-Limit (max SAIL IV). Manuelle BAZL-Bewilligung erforderlich.` };
  }
  if (weatherCondition === "unsafe") {
    return { decision: "rejected", reason: "Wetterbedingungen außerhalb SORA VLOS-Limits. Flug abgelehnt." };
  }
  if (notamSeverity === "critical") {
    return { decision: "rejected", reason: "Kritische NOTAM aktiv. Luftraum gesperrt, Flug abgelehnt." };
  }

  // Escalations requiring three-tier review (BAZL LUC / EASA Art. 12 AMC1)
  if (sail === "IV") {
    return { decision: "escalated", reason: `SAIL IV erfordert dreistufige Freigabe: Safety Manager + Accountable Manager (EASA Art. 12 AMC1).` };
  }
  if (weatherCondition === "marginal") {
    return { decision: "escalated", reason: "Marginale Wetterbedingungen — Safety Manager muss entscheiden." };
  }
  if (notamSeverity === "warning") {
    return { decision: "escalated", reason: "NOTAM-Warnung aktiv — Safety Manager Bestätigung erforderlich." };
  }

  // All-green → auto-approve
  return { decision: "approved", reason: `Automatisch freigegeben: SAIL ${sail}, Wetter sicher, Luftraum frei.` };
}

// ─── Rate limiter for authorize endpoint ─────────────────────────────────────

const authorizeRateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per user

function checkAuthorizeRateLimit(userId: string): void {
  const now = Date.now();
  const entry = authorizeRateLimit.get(userId);
  if (!entry || now > entry.resetAt) {
    authorizeRateLimit.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded: max ${RATE_LIMIT_MAX} authorization requests per minute.`,
    });
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const safetyRouter = createTRPCRouter({
  /**
   * Core LUC authorization engine.
   * Runs SORA + weather + NOTAM checks and issues a Go/No-Go/Escalate decision.
   * Writes the full decision to the audit log.
   * Protected: requires authentication. Rate-limited: 10 req/min per user.
   */
  authorize: protectedProcedure
    .input(
      z.object({
        pickupLat: z.number(),
        pickupLng: z.number(),
        deliveryLat: z.number(),
        deliveryLng: z.number(),
        altitudeAgl: z.number().min(1).max(600).default(120),
        requestedForDatetime: z.string().datetime(),
        bookingId: z.string().uuid().optional(),
        flightId: z.string().uuid().optional(),
        franchiseTenantId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Rate limit check
      checkAuthorizeRateLimit(ctx.userId);

      // 1. SORA
      const soraResult = assessSora({
        pickupLng: input.pickupLng,
        pickupLat: input.pickupLat,
        deliveryLng: input.deliveryLng,
        deliveryLat: input.deliveryLat,
        altitudeAgl: input.altitudeAgl,
        flightDate: new Date(input.requestedForDatetime),
      });

      // 2. Weather (worst of pickup + delivery)
      const [pickupWeather, deliveryWeather] = await Promise.all([
        fetchWeather(input.pickupLat, input.pickupLng, input.requestedForDatetime),
        fetchWeather(input.deliveryLat, input.deliveryLng, input.requestedForDatetime),
      ]);
      const conditionOrder = ["safe", "marginal", "unsafe"] as const;
      const worstCondition =
        conditionOrder.indexOf(pickupWeather.condition) >= conditionOrder.indexOf(deliveryWeather.condition)
          ? pickupWeather.condition
          : deliveryWeather.condition;
      const weatherResult = {
        pickup: pickupWeather,
        delivery: deliveryWeather,
        overallCondition: worstCondition,
        allWarnings: [...pickupWeather.warnings, ...deliveryWeather.warnings],
      };

      // 3. NOTAM — live Skyguide check for both pickup + delivery areas
      const notamResult = await checkRouteNotams(
        input.pickupLat,
        input.pickupLng,
        input.deliveryLat,
        input.deliveryLng,
      );

      // 4. Decision
      const { decision, reason } = computeDecision(soraResult.sail, worstCondition, notamResult.overallSeverity);

      // 5. Write audit log
      const [authorization] = await ctx.db
        .insert(flightAuthorizations)
        .values({
          bookingId: input.bookingId ?? null,
          flightId: input.flightId ?? null,
          franchiseTenantId: input.franchiseTenantId ?? null,
          pickupLat: String(input.pickupLat),
          pickupLng: String(input.pickupLng),
          deliveryLat: String(input.deliveryLat),
          deliveryLng: String(input.deliveryLng),
          altitudeAgl: input.altitudeAgl,
          requestedForDatetime: new Date(input.requestedForDatetime),
          sailLevel: soraResult.sail,
          grcScore: soraResult.grc,
          arcLevel: soraResult.arc,
          overallRisk: soraResult.overallRisk,
          soraResultJson: soraResult as unknown as Record<string, unknown>,
          weatherResultJson: weatherResult as unknown as Record<string, unknown>,
          notamResultJson: notamResult as unknown as Record<string, unknown>,
          decision,
          decisionReason: reason,
          decisionBy: "system",
          decidedAt: new Date(),
        })
        .returning();

      return {
        authorizationId: authorization.id,
        decision,
        reason,
        soraResult,
        weatherResult,
        notamResult,
      };
    }),

  /**
   * List recent flight authorizations (Safety Manager dashboard view).
   */
  listAuthorizations: operatorProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        franchiseTenantId: z.string().uuid().optional(),
        decision: z.enum(["approved", "rejected", "escalated"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.franchiseTenantId) {
        conditions.push(eq(flightAuthorizations.franchiseTenantId, input.franchiseTenantId));
      }
      if (input.decision) {
        conditions.push(eq(flightAuthorizations.decision, input.decision));
      }

      const rows = await ctx.db
        .select()
        .from(flightAuthorizations)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(flightAuthorizations.decidedAt))
        .limit(input.limit);

      return rows;
    }),

  /**
   * Compliance KPIs for the Safety Dashboard header.
   */
  getKPIs: operatorProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalResult, todayResult, openOccurrencesResult] = await Promise.all([
      // All-time counts by decision
      ctx.db
        .select({
          decision: flightAuthorizations.decision,
          count: sql<number>`count(*)::int`,
        })
        .from(flightAuthorizations)
        .groupBy(flightAuthorizations.decision),

      // Today's authorizations
      ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(flightAuthorizations)
        .where(gte(flightAuthorizations.decidedAt, today)),

      // Open safety occurrences
      ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(safetyOccurrences)
        .where(eq(safetyOccurrences.status, "open")),
    ]);

    const byDecision = Object.fromEntries(
      totalResult.map((r) => [r.decision, r.count])
    ) as Record<string, number>;

    const totalAll = Object.values(byDecision).reduce((a, b) => a + b, 0);
    const approved = byDecision["approved"] ?? 0;
    const rejected = byDecision["rejected"] ?? 0;
    const escalated = byDecision["escalated"] ?? 0;
    const approvalRate = totalAll > 0 ? Math.round((approved / totalAll) * 100) : 0;
    const escalationRate = totalAll > 0 ? Math.round((escalated / totalAll) * 100) : 0;

    return {
      totalAll,
      approved,
      rejected,
      escalated,
      approvalRate,
      escalationRate,
      todayCount: todayResult[0]?.count ?? 0,
      openOccurrences: openOccurrencesResult[0]?.count ?? 0,
    };
  }),

  /**
   * List safety occurrence reports.
   */
  listOccurrences: operatorProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(25),
        status: z.enum(["open", "under_review", "resolved"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.status) {
        conditions.push(eq(safetyOccurrences.status, input.status));
      }

      return ctx.db
        .select()
        .from(safetyOccurrences)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(safetyOccurrences.reportedAt))
        .limit(input.limit);
    }),

  /**
   * File a new Safety Occurrence Report (SOR).
   */
  reportOccurrence: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(200),
        description: z.string().min(10),
        severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        category: z.enum(["operational", "weather", "airspace", "technical", "human"]).default("operational"),
        flightId: z.string().uuid().optional(),
        authorizationId: z.string().uuid().optional(),
        franchiseTenantId: z.string().uuid().optional(),
        // ECCAIRS/ADREP mandatory fields (EU Regulation 376/2014)
        incidentOccurredAt: z.string().datetime().optional(),
        incidentLat: z.number().min(-90).max(90).optional(),
        incidentLng: z.number().min(-180).max(180).optional(),
        phaseOfOperation: z.enum(["takeoff", "cruise", "landing", "ground", "hover"]).optional(),
        isNearMiss: z.boolean().default(false),
        rootCause: z.string().optional(),
        contributingFactors: z.array(z.string()).default([]),
        correctiveActions: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      // 5-year retention for safety occurrences per BAZL/EU 376/2014
      const retentionExpiresAt = new Date(now);
      retentionExpiresAt.setFullYear(retentionExpiresAt.getFullYear() + 5);

      const [occurrence] = await ctx.db
        .insert(safetyOccurrences)
        .values({
          title: input.title,
          description: input.description,
          severity: input.severity,
          category: input.category,
          flightId: input.flightId ?? null,
          authorizationId: input.authorizationId ?? null,
          franchiseTenantId: input.franchiseTenantId ?? null,
          reportedByUserId: ctx.userId,
          reportedAt: now,
          // ECCAIRS fields
          incidentOccurredAt: input.incidentOccurredAt ? new Date(input.incidentOccurredAt) : null,
          incidentLat: input.incidentLat?.toString() ?? null,
          incidentLng: input.incidentLng?.toString() ?? null,
          phaseOfOperation: input.phaseOfOperation ?? null,
          isNearMiss: input.isNearMiss,
          rootCause: input.rootCause ?? null,
          contributingFactors: input.contributingFactors,
          correctiveActions: input.correctiveActions ?? null,
          retentionExpiresAt,
        })
        .returning();

      return occurrence;
    }),

  /**
   * Update a safety occurrence (resolve, escalate, etc.).
   */
  updateOccurrence: operatorProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["open", "under_review", "resolved"]).optional(),
        resolution: z.string().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (updates.status) updateData.status = updates.status;
      if (updates.resolution) updateData.resolution = updates.resolution;
      if (updates.severity) updateData.severity = updates.severity;
      if (updates.status === "resolved") updateData.resolvedAt = new Date();

      const [updated] = await ctx.db
        .update(safetyOccurrences)
        .set(updateData)
        .where(eq(safetyOccurrences.id, id))
        .returning();

      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
      return updated;
    }),

  /**
   * Safety Manager override — Tier 2 of the three-tier BAZL LUC workflow.
   *
   * For SAIL IV flights: Safety Manager approval is recorded as intermediate,
   * and the flight stays escalated pending Accountable Manager final sign-off.
   * For non-SAIL-IV escalations (weather/NOTAM): Safety Manager decision is final.
   */
  overrideDecision: safetyManagerProcedure
    .input(
      z.object({
        authorizationId: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]),
        reason: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch current authorization to check SAIL level
      const [current] = await ctx.db
        .select()
        .from(flightAuthorizations)
        .where(eq(flightAuthorizations.id, input.authorizationId))
        .limit(1);

      if (!current) throw new TRPCError({ code: "NOT_FOUND" });

      // SAIL IV + SM approves → record SM decision, keep escalated for AM
      if (current.sailLevel === "IV" && input.decision === "approved") {
        const [updated] = await ctx.db
          .update(flightAuthorizations)
          .set({
            safetyManagerDecision: "approved",
            safetyManagerUserId: ctx.userId,
            safetyManagerDecidedAt: new Date(),
            decisionReason: `Safety Manager genehmigt — Accountable Manager Freigabe ausstehend. SM: ${input.reason}`,
            updatedAt: new Date(),
          })
          .where(eq(flightAuthorizations.id, input.authorizationId))
          .returning();

        return updated;
      }

      // SM rejects or non-SAIL-IV escalation → SM decision is final
      const [updated] = await ctx.db
        .update(flightAuthorizations)
        .set({
          decision: input.decision,
          decisionReason: input.reason,
          decisionBy: "safety_manager",
          decisionByUserId: ctx.userId,
          decidedAt: new Date(),
          safetyManagerDecision: input.decision,
          safetyManagerUserId: ctx.userId,
          safetyManagerDecidedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(flightAuthorizations.id, input.authorizationId))
        .returning();

      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
      return updated;
    }),

  /**
   * Accountable Manager override — Tier 3 (final) of the BAZL LUC workflow.
   *
   * Only available for SAIL IV flights that have already been approved by
   * the Safety Manager. This is the final authorization required by
   * EASA Art. 12 AMC1 for the three-tier signature chain.
   */
  accountableManagerOverride: accountableManagerProcedure
    .input(
      z.object({
        authorizationId: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]),
        reason: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify SM has already approved
      const [current] = await ctx.db
        .select()
        .from(flightAuthorizations)
        .where(eq(flightAuthorizations.id, input.authorizationId))
        .limit(1);

      if (!current) throw new TRPCError({ code: "NOT_FOUND" });

      if (current.safetyManagerDecision !== "approved") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Safety Manager muss zuerst genehmigen, bevor der Accountable Manager entscheiden kann.",
        });
      }

      const [updated] = await ctx.db
        .update(flightAuthorizations)
        .set({
          decision: input.decision,
          decisionReason: `[Dreistufig] KI→SM→AM: ${input.reason}`,
          decisionBy: "accountable_manager",
          decisionByUserId: ctx.userId,
          decidedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(flightAuthorizations.id, input.authorizationId))
        .returning();

      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
      return updated;
    }),
});
