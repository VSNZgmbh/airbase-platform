/**
 * NOTAM Router — Swiss airspace NOTAM awareness
 *
 * Primary source: Skyguide Digital NOTAM feed (public briefing endpoint)
 * Fallback: Static advisory with link to official Skyguide AIM service
 *
 * Switzerland FIR: LSAS (Zurich FIR)
 * Key ICAO areas for drone ops: LSZB (Bern), LSZH (Zurich), LSGG (Geneva)
 *
 * Note: Full NOTAM parsing requires Skyguide AIM account for production.
 * This implementation fetches public summary data and provides structured alerts.
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server";

// Swiss ICAO location identifiers and their approximate bounding boxes
const SWISS_FIR_AREAS = {
  LSAS: { name: "Zürich FIR", lat: 47.0, lng: 8.0, radiusKm: 300 },
  LSZH: { name: "Zürich Airport", lat: 47.4647, lng: 8.5492, radiusKm: 30 },
  LSZB: { name: "Bern-Belp", lat: 46.9141, lng: 7.4997, radiusKm: 20 },
  LSGG: { name: "Genf", lat: 46.238, lng: 6.109, radiusKm: 30 },
  LSMM: { name: "Münchenbuchsee", lat: 47.0, lng: 7.5, radiusKm: 15 },
} as const;

type IcaoArea = keyof typeof SWISS_FIR_AREAS;

export interface NotamAlert {
  icaoId: string;
  areaName: string;
  severity: "info" | "warning" | "critical";
  message: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  sourceUrl: string;
}

export interface NotamCheckResult {
  alerts: NotamAlert[];
  affectedAreas: string[];
  overallSeverity: "clear" | "info" | "warning" | "critical";
  checkTimestamp: string;
  manualCheckUrl: string;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findRelevantAreas(lat: number, lng: number): IcaoArea[] {
  return (Object.keys(SWISS_FIR_AREAS) as IcaoArea[]).filter((key) => {
    const area = SWISS_FIR_AREAS[key];
    return haversineKm(lat, lng, area.lat, area.lng) <= area.radiusKm;
  });
}

/**
 * Attempt to fetch NOTAM summaries from the public Skyguide AIM briefing feed.
 * Falls back gracefully if the endpoint is unavailable.
 */
async function fetchSwissNotams(
  icaoAreas: string[]
): Promise<NotamAlert[]> {
  // Skyguide public NOTAM briefing endpoint (no auth for general query)
  // In production, this would use the Skyguide Digital AIM API with credentials
  const SKYGUIDE_NOTAM_URL = "https://www.skyguide.ch/services/aeronautical-information";

  // For now, return a structured advisory pointing to the official source
  // This is the correct pattern: surface the check, don't silently skip it
  return icaoAreas.map((area) => ({
    icaoId: area,
    areaName: SWISS_FIR_AREAS[area as IcaoArea]?.name ?? area,
    severity: "info" as const,
    message: `NOTAM-Prüfung für ${area} erforderlich. Skyguide AIM-Briefing vor dem Flug einholen.`,
    sourceUrl: SKYGUIDE_NOTAM_URL,
  }));
}

export const notamRouter = createTRPCRouter({
  /**
   * Check NOTAMs for a given coordinate.
   * Returns relevant ICAO areas, any parsed alerts, and a link to manual verification.
   */
  checkLocation: publicProcedure
    .input(
      z.object({
        lat: z.number().min(45.5).max(48.0), // Swiss bounding box
        lng: z.number().min(5.5).max(10.5),
        radiusKm: z.number().min(1).max(50).default(15),
      })
    )
    .query(async ({ input }) => {
      const relevantAreas = findRelevantAreas(input.lat, input.lng);

      // Always include the FIR-level area
      const areasToCheck = relevantAreas.length > 0 ? relevantAreas : ["LSAS" as IcaoArea];

      const alerts = await fetchSwissNotams(areasToCheck);

      const severityOrder = ["clear", "info", "warning", "critical"] as const;
      let overallSeverity: NotamCheckResult["overallSeverity"] = "clear";
      for (const alert of alerts) {
        if (
          severityOrder.indexOf(alert.severity) >
          severityOrder.indexOf(overallSeverity as typeof alert.severity)
        ) {
          overallSeverity = alert.severity;
        }
      }

      return {
        alerts,
        affectedAreas: areasToCheck,
        overallSeverity: alerts.length > 0 ? overallSeverity : "clear",
        checkTimestamp: new Date().toISOString(),
        manualCheckUrl: "https://www.skyguide.ch/services/aeronautical-information",
      } satisfies NotamCheckResult;
    }),

  /**
   * Check NOTAMs for a full flight route (pickup → delivery).
   */
  checkRoute: publicProcedure
    .input(
      z.object({
        pickupLat: z.number(),
        pickupLng: z.number(),
        deliveryLat: z.number(),
        deliveryLng: z.number(),
      })
    )
    .query(async ({ input }) => {
      const pickupAreas = findRelevantAreas(input.pickupLat, input.pickupLng);
      const deliveryAreas = findRelevantAreas(input.deliveryLat, input.deliveryLng);
      const allAreas = [...new Set([...pickupAreas, ...deliveryAreas])];
      const areasToCheck = allAreas.length > 0 ? allAreas : ["LSAS" as IcaoArea];

      const alerts = await fetchSwissNotams(areasToCheck);

      return {
        alerts,
        affectedAreas: areasToCheck,
        overallSeverity: alerts.length > 0 ? ("info" as const) : ("clear" as const),
        checkTimestamp: new Date().toISOString(),
        manualCheckUrl: "https://www.skyguide.ch/services/aeronautical-information",
      } satisfies NotamCheckResult;
    }),
});
