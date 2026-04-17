/**
 * Weather Router — Open-Meteo integration
 * Free API, no key required: https://api.open-meteo.com
 *
 * SORA VLOS operational limits used for go/no-go:
 *   Max wind speed: 12 m/s (Beaufort 6)
 *   Max precipitation: 0 mm/h (no rain/snow)
 *   Min visibility: 5000 m (VLOS standard)
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server";

// SORA VLOS operational weather limits
const WEATHER_LIMITS = {
  MAX_WIND_SPEED_MS: 12, // m/s — Beaufort 6
  MAX_PRECIPITATION_MM: 0.2, // mm/h — near-zero tolerance
  MIN_VISIBILITY_M: 5000, // m — VLOS minimum
  MAX_CLOUD_COVER_PERCENT: 80, // % — keep below thick overcast
} as const;

export type WeatherCondition = "safe" | "marginal" | "unsafe";

export interface WeatherCheckResult {
  condition: WeatherCondition;
  windSpeedMs: number;
  precipitationMm: number;
  visibilityM: number | null;
  cloudCoverPercent: number;
  temperature: number;
  warnings: string[];
  fetchedAt: string;
}

interface OpenMeteoResponse {
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    precipitation: number[];
    visibility: number[];
    cloud_cover: number[];
    temperature_2m: number[];
  };
}

function findClosestHourIndex(times: string[], targetIso: string): number {
  const targetMs = new Date(targetIso).getTime();
  let closest = 0;
  let minDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - targetMs);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return closest;
}

async function fetchOpenMeteo(
  lat: number,
  lng: number,
  targetDatetime: string
): Promise<WeatherCheckResult> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(6),
    longitude: lng.toFixed(6),
    hourly: "temperature_2m,wind_speed_10m,precipitation,visibility,cloud_cover",
    wind_speed_unit: "ms",
    forecast_days: "3",
    timezone: "Europe/Zurich",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 900 } }); // 15 min cache
  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status}`);
  }
  const data: OpenMeteoResponse = await res.json();
  const idx = findClosestHourIndex(data.hourly.time, targetDatetime);

  const windSpeedMs = data.hourly.wind_speed_10m[idx] ?? 0;
  const precipitationMm = data.hourly.precipitation[idx] ?? 0;
  const visibilityM = data.hourly.visibility[idx] ?? null;
  const cloudCoverPercent = data.hourly.cloud_cover[idx] ?? 0;
  const temperature = data.hourly.temperature_2m[idx] ?? 0;

  const warnings: string[] = [];
  let condition: WeatherCondition = "safe";

  if (windSpeedMs > WEATHER_LIMITS.MAX_WIND_SPEED_MS) {
    warnings.push(
      `Windgeschwindigkeit ${windSpeedMs.toFixed(1)} m/s überschreitet SORA-Limit (${WEATHER_LIMITS.MAX_WIND_SPEED_MS} m/s)`
    );
    condition = "unsafe";
  } else if (windSpeedMs > WEATHER_LIMITS.MAX_WIND_SPEED_MS * 0.75) {
    warnings.push(
      `Windgeschwindigkeit ${windSpeedMs.toFixed(1)} m/s nähert sich SORA-Limit`
    );
    if (condition === "safe") condition = "marginal";
  }

  if (precipitationMm > WEATHER_LIMITS.MAX_PRECIPITATION_MM) {
    warnings.push(
      `Niederschlag ${precipitationMm.toFixed(1)} mm/h — Flugbetrieb nicht empfohlen`
    );
    condition = "unsafe";
  }

  if (visibilityM !== null && visibilityM < WEATHER_LIMITS.MIN_VISIBILITY_M) {
    warnings.push(
      `Sichtweite ${visibilityM}m unterschreitet VLOS-Minimum (${WEATHER_LIMITS.MIN_VISIBILITY_M}m)`
    );
    condition = "unsafe";
  } else if (visibilityM !== null && visibilityM < WEATHER_LIMITS.MIN_VISIBILITY_M * 1.5) {
    warnings.push(`Eingeschränkte Sichtweite ${visibilityM}m — VLOS im Grenzbereich`);
    if (condition === "safe") condition = "marginal";
  }

  if (cloudCoverPercent > WEATHER_LIMITS.MAX_CLOUD_COVER_PERCENT) {
    warnings.push(`Bedeckungsgrad ${cloudCoverPercent}% — schlechte Sichtverhältnisse möglich`);
    if (condition === "safe") condition = "marginal";
  }

  return {
    condition,
    windSpeedMs,
    precipitationMm,
    visibilityM,
    cloudCoverPercent,
    temperature,
    warnings,
    fetchedAt: new Date().toISOString(),
  };
}

export const weatherRouter = createTRPCRouter({
  /**
   * Check weather conditions at a given coordinate and time.
   * Returns go/no-go assessment with warnings.
   */
  check: publicProcedure
    .input(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        datetime: z.string().datetime().optional(),
      })
    )
    .query(async ({ input }) => {
      const targetDatetime = input.datetime ?? new Date().toISOString();
      return fetchOpenMeteo(input.lat, input.lng, targetDatetime);
    }),

  /**
   * Check weather for a full route (pickup + delivery).
   * Returns worst-case condition across both endpoints.
   */
  checkRoute: publicProcedure
    .input(
      z.object({
        pickupLat: z.number(),
        pickupLng: z.number(),
        deliveryLat: z.number(),
        deliveryLng: z.number(),
        datetime: z.string().datetime().optional(),
      })
    )
    .query(async ({ input }) => {
      const targetDatetime = input.datetime ?? new Date().toISOString();
      const [pickup, delivery] = await Promise.all([
        fetchOpenMeteo(input.pickupLat, input.pickupLng, targetDatetime),
        fetchOpenMeteo(input.deliveryLat, input.deliveryLng, targetDatetime),
      ]);

      const conditionOrder: WeatherCondition[] = ["safe", "marginal", "unsafe"];
      const worstCondition =
        conditionOrder.indexOf(pickup.condition) >= conditionOrder.indexOf(delivery.condition)
          ? pickup.condition
          : delivery.condition;

      return {
        pickup,
        delivery,
        overallCondition: worstCondition,
        allWarnings: [...pickup.warnings, ...delivery.warnings],
      };
    }),
});
