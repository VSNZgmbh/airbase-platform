"use client";

import { trpc } from "@/lib/trpc/client";
import { DEMO_BOOKINGS, DEMO_AIRSPACE_TRAFFIC } from "@/lib/demo-data";
import {
  classifyThreat,
  computeProximityAlerts,
  getThreatColor,
  getThreatLabel,
  haversineM,
  type ProximityAlert,
} from "@/lib/airspace";
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Volume2,
} from "lucide-react";
import { useState, useMemo } from "react";

// ─── Alert Item ──────────────────────────────────────────────────────────────

function AlertItem({ alert }: { alert: ProximityAlert }) {
  const color = getThreatColor(alert.threatLevel);
  const label = getThreatLabel(alert.threatLevel);

  return (
    <div
      className="rounded-xl p-3 border-2"
      style={{
        borderColor: `${color}40`,
        backgroundColor: `${color}08`,
      }}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${color}15` }}
        >
          {alert.threatLevel === "alert" ? (
            <ShieldAlert className="w-4 h-4" style={{ color }} />
          ) : alert.threatLevel === "warning" ? (
            <AlertTriangle className="w-4 h-4" style={{ color }} />
          ) : (
            <AlertCircle className="w-4 h-4" style={{ color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
            >
              {label}
            </span>
            <span className="text-[10px] font-bold text-gray-600">
              {alert.aircraft.callsign ?? alert.aircraft.category}
            </span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">{alert.message}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
            <span className="font-semibold" style={{ color }}>
              {alert.distanceM < 1000
                ? `${alert.distanceM}m`
                : `${(alert.distanceM / 1000).toFixed(1)}km`}
            </span>
            <span>{Math.round(alert.aircraft.altitudeM)}m AGL</span>
            <span>{Math.round(alert.closingSpeedKmh)} km/h</span>
            {alert.timeToClosestApproachSec !== null && (
              <span className="font-semibold">
                ~{alert.timeToClosestApproachSec}s TCA
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Proximity Warning Panel ─────────────────────────────────────────────────

export function ProximityWarning() {
  const [expanded, setExpanded] = useState(true);

  // Build drone positions from active flights
  const activeDrones = useMemo(() => {
    const inAir = DEMO_BOOKINGS.filter((b) => b.status === "in_progress");
    return inAir.map((b) => ({
      id: b.id,
      name: `${b.droneName} (${b.identifier})`,
      lat: parseFloat(b.deliveryLat) * 0.6 + parseFloat(b.pickupLat) * 0.4,
      lng: parseFloat(b.deliveryLng) * 0.6 + parseFloat(b.pickupLng) * 0.4,
      altitudeM: 120,
    }));
  }, []);

  // Compute alerts from demo traffic
  const alerts = useMemo(() => {
    const trafficWithDistances = DEMO_AIRSPACE_TRAFFIC.map((t) => {
      const closest = activeDrones.reduce(
        (min, d) => {
          const dist = haversineM(d.lat, d.lng, t.lat, t.lng);
          return dist < min ? dist : min;
        },
        Infinity,
      );
      return {
        ...t,
        distanceM: Math.round(closest),
        threatLevel: classifyThreat(closest, Math.abs(120 - t.altitudeM)),
      };
    });

    return computeProximityAlerts(activeDrones, trafficWithDistances);
  }, [activeDrones]);

  const criticalAlerts = alerts.filter((a) => a.threatLevel === "alert");
  const warningAlerts = alerts.filter((a) => a.threatLevel === "warning");
  const advisoryAlerts = alerts.filter((a) => a.threatLevel === "advisory");

  const hasCritical = criticalAlerts.length > 0;

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden ${
        hasCritical
          ? "bg-red-50/30 border-red-200"
          : "bg-white border-gray-100"
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              hasCritical
                ? "bg-red-100 border-red-300"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <ShieldAlert
              className={`w-4 h-4 ${hasCritical ? "text-red-600" : "text-amber-500"}`}
            />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
              Proximity Alerts — DAA
            </h3>
            <p className="text-[10px] text-gray-300 mt-0.5">
              Detect and Avoid · {alerts.length} Meldung{alerts.length !== 1 ? "en" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalAlerts.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-600 border border-red-200 animate-pulse">
              <Volume2 className="w-3 h-3" /> {criticalAlerts.length} ALARM
            </span>
          )}
          {warningAlerts.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-600 border border-amber-200">
              {warningAlerts.length}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-green-200">
                <ShieldAlert className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xs font-semibold text-green-700">Luftraum frei</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Keine Annäherungen erkannt
              </p>
            </div>
          ) : (
            <>
              {criticalAlerts.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-[0.15em] mb-2">
                    Alarme ({criticalAlerts.length})
                  </p>
                  <div className="space-y-2">
                    {criticalAlerts.map((a, i) => (
                      <AlertItem key={`alert-${i}`} alert={a} />
                    ))}
                  </div>
                </div>
              )}
              {warningAlerts.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.15em] mb-2">
                    Warnungen ({warningAlerts.length})
                  </p>
                  <div className="space-y-2">
                    {warningAlerts.map((a, i) => (
                      <AlertItem key={`warn-${i}`} alert={a} />
                    ))}
                  </div>
                </div>
              )}
              {advisoryAlerts.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.15em] mb-2">
                    Hinweise ({advisoryAlerts.length})
                  </p>
                  <div className="space-y-2">
                    {advisoryAlerts.map((a, i) => (
                      <AlertItem key={`adv-${i}`} alert={a} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
