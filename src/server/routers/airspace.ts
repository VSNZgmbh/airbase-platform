/**
 * Airspace Router — Live Luftraumüberwachung via SafeSky + INVOLI
 *
 * Provides real-time airspace traffic data and proximity alerts
 * for the Safety and Pilot dashboards. Falls back to demo data
 * when API keys are not configured.
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server";
import {
  fetchAirspaceSnapshot,
  computeProximityAlerts,
  type AirspaceSnapshot,
  type ProximityAlert,
} from "@/lib/airspace";
import { DEMO_AIRSPACE_TRAFFIC } from "@/lib/demo-data";

export const airspaceRouter = createTRPCRouter({
  /**
   * Get live airspace traffic snapshot around a center point.
   * Falls back to demo data when SafeSky/INVOLI keys are missing.
   */
  getTraffic: publicProcedure
    .input(
      z.object({
        lat: z.number().min(-90).max(90).default(46.6863),
        lng: z.number().min(-180).max(180).default(7.8632),
        radiusKm: z.number().min(1).max(100).default(30),
      }),
    )
    .query(async ({ input }): Promise<AirspaceSnapshot> => {
      const hasKeys = process.env.SAFESKY_API_KEY || process.env.INVOLI_API_KEY;

      if (hasKeys) {
        return fetchAirspaceSnapshot(input.lat, input.lng, input.radiusKm);
      }

      // Demo mode: return simulated traffic
      return {
        traffic: DEMO_AIRSPACE_TRAFFIC,
        providers: [
          {
            provider: "safesky",
            connected: true,
            latencyMs: 142,
            aircraftCount: DEMO_AIRSPACE_TRAFFIC.filter((t) => t.provider === "safesky").length,
            lastUpdateAt: new Date().toISOString(),
            coverageRadiusKm: input.radiusKm,
          },
          {
            provider: "involi",
            connected: true,
            latencyMs: 89,
            aircraftCount: DEMO_AIRSPACE_TRAFFIC.filter((t) => t.provider === "involi").length,
            lastUpdateAt: new Date().toISOString(),
            coverageRadiusKm: input.radiusKm,
          },
        ],
        centerLat: input.lat,
        centerLng: input.lng,
        radiusKm: input.radiusKm,
        fetchedAt: new Date().toISOString(),
      };
    }),

  /**
   * Get proximity alerts for all active drones.
   */
  getProximityAlerts: publicProcedure
    .input(
      z.object({
        drones: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            lat: z.number(),
            lng: z.number(),
            altitudeM: z.number(),
          }),
        ),
        lat: z.number().default(46.6863),
        lng: z.number().default(7.8632),
        radiusKm: z.number().default(30),
      }),
    )
    .query(async ({ input }): Promise<ProximityAlert[]> => {
      const hasKeys = process.env.SAFESKY_API_KEY || process.env.INVOLI_API_KEY;
      const traffic = hasKeys
        ? (await fetchAirspaceSnapshot(input.lat, input.lng, input.radiusKm)).traffic
        : DEMO_AIRSPACE_TRAFFIC;

      return computeProximityAlerts(input.drones, traffic);
    }),
});
