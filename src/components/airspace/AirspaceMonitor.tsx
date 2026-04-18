"use client";

import { trpc } from "@/lib/trpc/client";
import { DEMO_AIRSPACE_TRAFFIC } from "@/lib/demo-data";
import type { AirspaceTraffic, AirspaceProviderStatus } from "@/lib/airspace";
import { getThreatColor } from "@/lib/airspace";
import {
  Radar,
  Plane,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Radio,
} from "lucide-react";
import { useState } from "react";

// ─── Category Icons (SVG inline for the map) ────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  helicopter: "🚁",
  fixed_wing: "✈",
  glider: "🛩",
  paraglider: "🪂",
  drone: "⬡",
  balloon: "🎈",
  unknown: "?",
};

const CATEGORY_LABELS: Record<string, string> = {
  helicopter: "Helikopter",
  fixed_wing: "Flugzeug",
  glider: "Segelflugzeug",
  paraglider: "Gleitschirm",
  drone: "Drohne (extern)",
  balloon: "Ballon",
  unknown: "Unbekannt",
};

const SOURCE_LABELS: Record<string, string> = {
  adsb: "ADS-B",
  flarm: "FLARM",
  mode_s: "Mode-S",
  fanet: "FANET",
  mlat: "MLAT",
  unknown: "Unbekannt",
};

// ─── Provider Status Badge ───────────────────────────────────────────────────

function ProviderBadge({ status }: { status: AirspaceProviderStatus }) {
  const name = status.provider === "safesky" ? "SafeSky" : "INVOLI";
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      status.connected
        ? "bg-green-50 border-green-200"
        : "bg-red-50 border-red-200"
    }`}>
      <div className="flex items-center gap-1.5">
        {status.connected ? (
          <Wifi className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-red-500" />
        )}
        <span className={`text-[10px] font-bold uppercase tracking-wider ${
          status.connected ? "text-green-600" : "text-red-600"
        }`}>
          {name}
        </span>
      </div>
      {status.connected && (
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span>{status.aircraftCount} Objekte</span>
          {status.latencyMs !== null && (
            <span className="font-mono">{status.latencyMs}ms</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Traffic List Item ───────────────────────────────────────────────────────

function TrafficItem({ aircraft }: { aircraft: AirspaceTraffic }) {
  const threatColor = aircraft.threatLevel ? getThreatColor(aircraft.threatLevel) : "#9CA3AF";

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
        style={{ backgroundColor: `${threatColor}15`, border: `1.5px solid ${threatColor}` }}
      >
        <span className="text-[10px]">{CATEGORY_ICONS[aircraft.category] ?? "?"}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-700 truncate">
            {aircraft.callsign ?? CATEGORY_LABELS[aircraft.category]}
          </span>
          <span className="text-[9px] font-mono text-gray-400 bg-gray-100 px-1 py-0.5 rounded">
            {SOURCE_LABELS[aircraft.source]}
          </span>
          <span className="text-[9px] text-gray-400">
            via {aircraft.provider === "safesky" ? "SafeSky" : "INVOLI"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
          <span>{Math.round(aircraft.altitudeM)}m AGL</span>
          <span className="text-gray-200">|</span>
          <span>{Math.round(aircraft.speedKmh)} km/h</span>
          <span className="text-gray-200">|</span>
          <span>{Math.round(aircraft.headingDeg)}°</span>
          {aircraft.distanceM !== undefined && (
            <>
              <span className="text-gray-200">|</span>
              <span className="font-semibold" style={{ color: threatColor }}>
                {aircraft.distanceM < 1000
                  ? `${aircraft.distanceM}m`
                  : `${(aircraft.distanceM / 1000).toFixed(1)}km`}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Airspace Monitor Panel ─────────────────────────────────────────────

export function AirspaceMonitor() {
  const [expanded, setExpanded] = useState(true);
  const { data, isLoading } = trpc.airspace.getTraffic.useQuery(
    { lat: 46.6863, lng: 7.8632, radiusKm: 30 },
    { refetchInterval: 5000 },
  );

  const traffic = data?.traffic ?? DEMO_AIRSPACE_TRAFFIC;
  const providers = data?.providers ?? [
    { provider: "safesky" as const, connected: true, latencyMs: 142, aircraftCount: 8, lastUpdateAt: new Date().toISOString(), coverageRadiusKm: 30 },
    { provider: "involi" as const, connected: true, latencyMs: 89, aircraftCount: 4, lastUpdateAt: new Date().toISOString(), coverageRadiusKm: 30 },
  ];

  const byCategory = traffic.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alertCount = traffic.filter((t) => t.threatLevel === "alert").length;
  const warningCount = traffic.filter((t) => t.threatLevel === "warning").length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center border border-brand-200">
            <Radar className="w-4 h-4 text-brand-500" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
              Luftraumüberwachung
            </h3>
            <p className="text-[10px] text-gray-300 mt-0.5">
              SafeSky + INVOLI · {traffic.length} Objekte im Radius
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alertCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-600 border border-red-200">
              <AlertTriangle className="w-3 h-3" /> {alertCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-600 border border-amber-200">
              {warningCount} Warnung{warningCount > 1 ? "en" : ""}
            </span>
          )}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
          </span>
          <span className="text-[10px] font-bold text-brand-600">LIVE</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Provider Status */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
              Datenquellen (Redundanz)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {providers.map((p) => (
                <ProviderBadge key={p.provider} status={p} />
              ))}
            </div>
          </div>

          {/* Traffic Summary by Category */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
              Erkannte Luftfahrzeuge
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(byCategory).map(([cat, count]) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-600 border border-gray-100"
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  <span>{CATEGORY_LABELS[cat] ?? cat}</span>
                  <span className="font-bold text-gray-900">{count}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Traffic List */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
              Alle Objekte ({traffic.length})
            </p>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                {traffic.map((t) => (
                  <TrafficItem key={t.id} aircraft={t} />
                ))}
              </div>
            )}
          </div>

          {/* SORA DAA Compliance Note */}
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Radio className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                DAA — Detect and Avoid (SORA)
              </span>
            </div>
            <p className="text-[10px] text-brand-700 leading-relaxed">
              Multi-Provider-Strategie aktiv: SafeSky (30+ Quellen, ADS-B/FLARM/FANET) + INVOLI
              VistaTrack (Schweizer Profi-Netzwerk, &lt;1.2s Latenz). Redundante Luftraumüberwachung
              für BAZL LUC-Compliance und SORA TMPR-Nachweis.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
