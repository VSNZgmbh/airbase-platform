/**
 * Airspace Monitoring Service — Multi-Provider DAA (Detect and Avoid)
 *
 * Integrates two independent airspace surveillance providers for redundancy:
 *   1. SafeSky UAV API — Primary aggregator (ADS-B, FLARM, Mode-S, FANET, 30+ sources)
 *   2. INVOLI VistaTrack REST API — Swiss professional backup (<1.2s latency)
 *
 * Multi-provider strategy = SORA DAA compliance gold standard.
 * Each provider returns normalized AirspaceTraffic[] for the map overlay.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type AircraftCategory =
  | "drone"
  | "helicopter"
  | "glider"
  | "paraglider"
  | "fixed_wing"
  | "balloon"
  | "unknown";

export type TrackingSource = "adsb" | "flarm" | "mode_s" | "fanet" | "mlat" | "unknown";

export type ThreatLevel = "none" | "advisory" | "warning" | "alert";

export interface AirspaceTraffic {
  id: string;
  callsign: string | null;
  lat: number;
  lng: number;
  altitudeM: number;
  headingDeg: number;
  speedKmh: number;
  verticalRateMps: number;
  category: AircraftCategory;
  source: TrackingSource;
  provider: "safesky" | "involi";
  lastSeenAt: string;
  /** Distance to our drone in meters (computed client-side) */
  distanceM?: number;
  /** Threat level relative to active flights */
  threatLevel?: ThreatLevel;
}

export interface AirspaceProviderStatus {
  provider: "safesky" | "involi";
  connected: boolean;
  latencyMs: number | null;
  aircraftCount: number;
  lastUpdateAt: string | null;
  coverageRadiusKm: number;
}

export interface AirspaceSnapshot {
  traffic: AirspaceTraffic[];
  providers: AirspaceProviderStatus[];
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  fetchedAt: string;
}

export interface ProximityAlert {
  droneId: string;
  droneName: string;
  aircraft: AirspaceTraffic;
  distanceM: number;
  closingSpeedKmh: number;
  threatLevel: ThreatLevel;
  timeToClosestApproachSec: number | null;
  message: string;
}

// ─── Threat Classification ───────────────────────────────────────────────────

const ALERT_RADIUS_M = 500;
const WARNING_RADIUS_M = 1500;
const ADVISORY_RADIUS_M = 3000;

export function classifyThreat(distanceM: number, altitudeDiffM: number): ThreatLevel {
  const effectiveDistance = Math.sqrt(distanceM ** 2 + altitudeDiffM ** 2);
  if (effectiveDistance < ALERT_RADIUS_M) return "alert";
  if (effectiveDistance < WARNING_RADIUS_M) return "warning";
  if (effectiveDistance < ADVISORY_RADIUS_M) return "advisory";
  return "none";
}

export function getThreatColor(level: ThreatLevel): string {
  switch (level) {
    case "alert": return "#DC2626";
    case "warning": return "#F59E0B";
    case "advisory": return "#3B82F6";
    case "none": return "#9CA3AF";
  }
}

export function getThreatLabel(level: ThreatLevel): string {
  switch (level) {
    case "alert": return "ALARM";
    case "warning": return "WARNUNG";
    case "advisory": return "HINWEIS";
    case "none": return "Klar";
  }
}

// ─── Distance Utilities ──────────────────────────────────────────────────────

/** Haversine distance in meters */
export function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── SafeSky API Client ──────────────────────────────────────────────────────

const SAFESKY_API_BASE = "https://api.safesky.app/v1";

export async function fetchSafeSkyTraffic(
  lat: number,
  lng: number,
  radiusKm: number,
  apiKey?: string,
): Promise<{ traffic: AirspaceTraffic[]; status: AirspaceProviderStatus }> {
  const key = apiKey ?? process.env.SAFESKY_API_KEY;
  const start = Date.now();

  if (!key) {
    return {
      traffic: [],
      status: {
        provider: "safesky",
        connected: false,
        latencyMs: null,
        aircraftCount: 0,
        lastUpdateAt: null,
        coverageRadiusKm: radiusKm,
      },
    };
  }

  try {
    const res = await fetch(
      `${SAFESKY_API_BASE}/beacons?lat=${lat}&lng=${lng}&alt=500&radius=${radiusKm * 1000}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 5 },
        signal: AbortSignal.timeout(8000),
      },
    );

    const latency = Date.now() - start;

    if (!res.ok) {
      return {
        traffic: [],
        status: {
          provider: "safesky",
          connected: false,
          latencyMs: latency,
          aircraftCount: 0,
          lastUpdateAt: new Date().toISOString(),
          coverageRadiusKm: radiusKm,
        },
      };
    }

    const data = await res.json();
    const traffic: AirspaceTraffic[] = (Array.isArray(data) ? data : []).map((b: any) => ({
      id: `ss-${b.id ?? b.hex_id ?? Math.random().toString(36).slice(2)}`,
      callsign: b.callsign ?? null,
      lat: b.latitude ?? b.lat,
      lng: b.longitude ?? b.lng,
      altitudeM: b.altitude ?? 0,
      headingDeg: b.heading ?? 0,
      speedKmh: (b.ground_speed ?? 0) * 3.6,
      verticalRateMps: b.vertical_rate ?? 0,
      category: mapSafeSkyCategory(b.aircraft_type),
      source: mapSafeSkySource(b.source),
      provider: "safesky" as const,
      lastSeenAt: b.last_seen ?? new Date().toISOString(),
    }));

    return {
      traffic,
      status: {
        provider: "safesky",
        connected: true,
        latencyMs: latency,
        aircraftCount: traffic.length,
        lastUpdateAt: new Date().toISOString(),
        coverageRadiusKm: radiusKm,
      },
    };
  } catch {
    return {
      traffic: [],
      status: {
        provider: "safesky",
        connected: false,
        latencyMs: Date.now() - start,
        aircraftCount: 0,
        lastUpdateAt: new Date().toISOString(),
        coverageRadiusKm: radiusKm,
      },
    };
  }
}

function mapSafeSkyCategory(type: number | string | undefined): AircraftCategory {
  const map: Record<string, AircraftCategory> = {
    "1": "glider", "2": "balloon", "3": "paraglider",
    "4": "fixed_wing", "5": "helicopter", "6": "drone",
  };
  return map[String(type)] ?? "unknown";
}

function mapSafeSkySource(src: string | undefined): TrackingSource {
  if (!src) return "unknown";
  const lower = src.toLowerCase();
  if (lower.includes("adsb")) return "adsb";
  if (lower.includes("flarm")) return "flarm";
  if (lower.includes("fanet")) return "fanet";
  if (lower.includes("mlat")) return "mlat";
  return "unknown";
}

// ─── INVOLI VistaTrack API Client ────────────────────────────────────────────

const INVOLI_API_BASE = "https://api.involi.com/v1";

export async function fetchINVOLITraffic(
  lat: number,
  lng: number,
  radiusKm: number,
  apiKey?: string,
): Promise<{ traffic: AirspaceTraffic[]; status: AirspaceProviderStatus }> {
  const key = apiKey ?? process.env.INVOLI_API_KEY;
  const start = Date.now();

  if (!key) {
    return {
      traffic: [],
      status: {
        provider: "involi",
        connected: false,
        latencyMs: null,
        aircraftCount: 0,
        lastUpdateAt: null,
        coverageRadiusKm: radiusKm,
      },
    };
  }

  try {
    const res = await fetch(
      `${INVOLI_API_BASE}/traffic?lat=${lat}&lon=${lng}&radius=${radiusKm}`,
      {
        headers: {
          "X-API-Key": key,
          Accept: "application/json",
        },
        next: { revalidate: 3 },
        signal: AbortSignal.timeout(5000),
      },
    );

    const latency = Date.now() - start;

    if (!res.ok) {
      return {
        traffic: [],
        status: {
          provider: "involi",
          connected: false,
          latencyMs: latency,
          aircraftCount: 0,
          lastUpdateAt: new Date().toISOString(),
          coverageRadiusKm: radiusKm,
        },
      };
    }

    const data = await res.json();
    const traffic: AirspaceTraffic[] = (Array.isArray(data?.aircraft) ? data.aircraft : []).map((a: any) => ({
      id: `inv-${a.icao_address ?? a.id ?? Math.random().toString(36).slice(2)}`,
      callsign: a.callsign ?? null,
      lat: a.latitude,
      lng: a.longitude,
      altitudeM: a.altitude_m ?? a.altitude ?? 0,
      headingDeg: a.track ?? a.heading ?? 0,
      speedKmh: a.ground_speed_kmh ?? (a.ground_speed ?? 0) * 3.6,
      verticalRateMps: a.vertical_rate ?? 0,
      category: mapINVOLICategory(a.emitter_category),
      source: "adsb" as const,
      provider: "involi" as const,
      lastSeenAt: a.last_update ?? new Date().toISOString(),
    }));

    return {
      traffic,
      status: {
        provider: "involi",
        connected: true,
        latencyMs: latency,
        aircraftCount: traffic.length,
        lastUpdateAt: new Date().toISOString(),
        coverageRadiusKm: radiusKm,
      },
    };
  } catch {
    return {
      traffic: [],
      status: {
        provider: "involi",
        connected: false,
        latencyMs: Date.now() - start,
        aircraftCount: 0,
        lastUpdateAt: new Date().toISOString(),
        coverageRadiusKm: radiusKm,
      },
    };
  }
}

function mapINVOLICategory(cat: number | string | undefined): AircraftCategory {
  const map: Record<string, AircraftCategory> = {
    "0": "unknown", "1": "fixed_wing", "2": "fixed_wing",
    "3": "helicopter", "4": "glider", "5": "balloon",
    "6": "drone", "7": "paraglider",
  };
  return map[String(cat)] ?? "unknown";
}

// ─── Aggregated Fetch ────────────────────────────────────────────────────────

export async function fetchAirspaceSnapshot(
  lat: number,
  lng: number,
  radiusKm = 30,
): Promise<AirspaceSnapshot> {
  const [safesky, involi] = await Promise.allSettled([
    fetchSafeSkyTraffic(lat, lng, radiusKm),
    fetchINVOLITraffic(lat, lng, radiusKm),
  ]);

  const ssResult = safesky.status === "fulfilled" ? safesky.value : {
    traffic: [] as AirspaceTraffic[],
    status: { provider: "safesky" as const, connected: false, latencyMs: null, aircraftCount: 0, lastUpdateAt: null, coverageRadiusKm: radiusKm },
  };
  const invResult = involi.status === "fulfilled" ? involi.value : {
    traffic: [] as AirspaceTraffic[],
    status: { provider: "involi" as const, connected: false, latencyMs: null, aircraftCount: 0, lastUpdateAt: null, coverageRadiusKm: radiusKm },
  };

  // Deduplicate by proximity (same aircraft seen by both providers)
  const merged = deduplicateTraffic([...ssResult.traffic, ...invResult.traffic]);

  return {
    traffic: merged,
    providers: [ssResult.status, invResult.status],
    centerLat: lat,
    centerLng: lng,
    radiusKm,
    fetchedAt: new Date().toISOString(),
  };
}

function deduplicateTraffic(items: AirspaceTraffic[]): AirspaceTraffic[] {
  const result: AirspaceTraffic[] = [];
  for (const item of items) {
    const isDupe = result.some(
      (existing) =>
        haversineM(existing.lat, existing.lng, item.lat, item.lng) < 100 &&
        Math.abs(existing.altitudeM - item.altitudeM) < 50,
    );
    if (!isDupe) result.push(item);
  }
  return result;
}

// ─── Proximity Alerting ──────────────────────────────────────────────────────

export function computeProximityAlerts(
  drones: { id: string; name: string; lat: number; lng: number; altitudeM: number }[],
  traffic: AirspaceTraffic[],
): ProximityAlert[] {
  const alerts: ProximityAlert[] = [];

  for (const drone of drones) {
    for (const aircraft of traffic) {
      const dist = haversineM(drone.lat, drone.lng, aircraft.lat, aircraft.lng);
      const altDiff = Math.abs(drone.altitudeM - aircraft.altitudeM);
      const threat = classifyThreat(dist, altDiff);

      if (threat !== "none") {
        const closingSpeed = aircraft.speedKmh;
        const ttca = closingSpeed > 0 ? (dist / 1000) / closingSpeed * 3600 : null;

        alerts.push({
          droneId: drone.id,
          droneName: drone.name,
          aircraft,
          distanceM: Math.round(dist),
          closingSpeedKmh: closingSpeed,
          threatLevel: threat,
          timeToClosestApproachSec: ttca ? Math.round(ttca) : null,
          message: buildAlertMessage(drone.name, aircraft, dist, threat),
        });
      }
    }
  }

  return alerts.sort((a, b) => {
    const order = { alert: 0, warning: 1, advisory: 2, none: 3 };
    return order[a.threatLevel] - order[b.threatLevel] || a.distanceM - b.distanceM;
  });
}

function buildAlertMessage(
  droneName: string,
  aircraft: AirspaceTraffic,
  distanceM: number,
  threat: ThreatLevel,
): string {
  const catLabels: Record<AircraftCategory, string> = {
    drone: "Drohne",
    helicopter: "Helikopter",
    glider: "Segelflugzeug",
    paraglider: "Gleitschirm",
    fixed_wing: "Flugzeug",
    balloon: "Ballon",
    unknown: "Unbekannt",
  };
  const label = catLabels[aircraft.category];
  const dist = distanceM < 1000 ? `${Math.round(distanceM)}m` : `${(distanceM / 1000).toFixed(1)}km`;
  const alt = `${Math.round(aircraft.altitudeM)}m`;

  if (threat === "alert") {
    return `⚠ ALARM: ${label} ${aircraft.callsign ?? ""} in ${dist} Entfernung, Höhe ${alt} — Ausweichmanöver prüfen!`;
  }
  if (threat === "warning") {
    return `${label} ${aircraft.callsign ?? ""} nähert sich: ${dist}, Höhe ${alt}`;
  }
  return `${label} ${aircraft.callsign ?? ""} in ${dist}, Höhe ${alt} — Beobachten`;
}
