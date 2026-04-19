"use client";

import { useState, useCallback } from "react";
import {
  DEMO_FLIGHTS,
  DEMO_AIRSPACE_TRAFFIC,
} from "@/lib/demo-data";
import { classifyThreat, getThreatColor, getThreatLabel, haversineM } from "@/lib/airspace";
import type { ThreatLevel, AircraftCategory } from "@/lib/airspace";
import {
  ShieldAlert,
  Send,
  AlertTriangle,
  Radio,
  Plane,
  Shield,
  OctagonX,
  MessageCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface SafetyAlert {
  id: string;
  type: "broadcast" | "targeted" | "emergency_rtl" | "emergency_land" | "airspace_warning";
  target: string;
  message: string;
  sentAt: string;
  status: "sent" | "acknowledged" | "pending";
}

const QUICK_MESSAGES = [
  { label: "Ausweichmanöver", msg: "WARNUNG: Luftverkehr in der Nähe. Ausweichmanöver einleiten." },
  { label: "Höhe anpassen", msg: "Höhe anpassen — Konflikt mit Luftfahrzeug auf gleicher Höhe." },
  { label: "Route ändern", msg: "Route anpassen: Gesperrter Luftraum voraus. Ausweichen erforderlich." },
  { label: "Rückkehr", msg: "Mission abbrechen. Sofortige Rückkehr zum Hub angeordnet (RTL)." },
  { label: "Landebefehl", msg: "NOTFALL: Sofortige Landung am nächsten sicheren Punkt." },
];

const CATEGORY_LABELS: Record<AircraftCategory, string> = {
  helicopter: "Helikopter",
  fixed_wing: "Flugzeug",
  glider: "Segelflugzeug",
  paraglider: "Gleitschirm",
  drone: "Drohne",
  balloon: "Ballon",
  unknown: "Unbekannt",
};

// ─── Main Component ─────────────────────────────────────────────────────────

export function AdminSafetyPanel() {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [customMsg, setCustomMsg] = useState("");
  const [targetDrone, setTargetDrone] = useState<string>("all");

  const liveFlights = DEMO_FLIGHTS.filter((f) => f.status === "in_air");

  // Compute active proximity threats
  const proximityThreats = liveFlights.flatMap((flight) => {
    const droneLat = parseFloat(flight.booking.deliveryLat) * 0.6 + parseFloat(flight.booking.pickupLat) * 0.4;
    const droneLng = parseFloat(flight.booking.deliveryLng) * 0.6 + parseFloat(flight.booking.pickupLng) * 0.4;
    const droneAlt = 120;

    return DEMO_AIRSPACE_TRAFFIC.map((aircraft) => {
      const dist = haversineM(droneLat, droneLng, aircraft.lat, aircraft.lng);
      const altDiff = Math.abs(droneAlt - aircraft.altitudeM);
      const threat = classifyThreat(dist, altDiff);
      return {
        flightId: flight.id,
        flightIdentifier: flight.booking.identifier,
        aircraft,
        distanceM: dist,
        threat,
      };
    }).filter((t) => t.threat !== "none");
  }).sort((a, b) => {
    const order = { alert: 0, warning: 1, advisory: 2, none: 3 };
    return order[a.threat] - order[b.threat] || a.distanceM - b.distanceM;
  });

  const sendAlert = useCallback(
    (type: SafetyAlert["type"], message: string) => {
      const alert: SafetyAlert = {
        id: `sa-${Date.now()}`,
        type,
        target: targetDrone === "all" ? "Alle Drohnen" : targetDrone,
        message,
        sentAt: new Date().toLocaleTimeString("de-CH"),
        status: "sent",
      };
      setAlerts((prev) => [alert, ...prev.slice(0, 19)]);
    },
    [targetDrone]
  );

  const handleSendCustom = useCallback(() => {
    if (!customMsg.trim()) return;
    sendAlert("targeted", customMsg);
    setCustomMsg("");
  }, [customMsg, sendAlert]);

  const alertCount = proximityThreats.filter((t) => t.threat === "alert").length;
  const warningCount = proximityThreats.filter((t) => t.threat === "warning").length;

  return (
    <div className="space-y-4">
      {/* Active Threats Overview */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-gray-900">Aktive Luftraum-Konflikte</h3>
          </div>
          <div className="flex items-center gap-2">
            {alertCount > 0 && (
              <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full animate-pulse">
                {alertCount} ALARM
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {warningCount} WARNUNG
              </span>
            )}
            {proximityThreats.length === 0 && (
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                KLAR
              </span>
            )}
          </div>
        </div>

        {proximityThreats.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Shield className="w-8 h-8 text-green-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">Luftraum frei</p>
            <p className="text-xs text-gray-400 mt-0.5">Keine Konflikte im Überwachungsbereich</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {proximityThreats.map((t, i) => (
              <div
                key={`${t.flightId}-${t.aircraft.id}-${i}`}
                className="px-5 py-3 flex items-center gap-3"
              >
                <div
                  className="w-2 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getThreatColor(t.threat) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-900">
                      {t.flightIdentifier}
                    </span>
                    <span className="text-gray-300">&rarr;</span>
                    <span className="font-mono text-xs text-gray-600">
                      {t.aircraft.callsign ?? "Unbekannt"}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      ({CATEGORY_LABELS[t.aircraft.category]})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400">
                    <span>Distanz: {t.distanceM < 1000 ? `${Math.round(t.distanceM)}m` : `${(t.distanceM / 1000).toFixed(1)}km`}</span>
                    <span>Höhe: {Math.round(t.aircraft.altitudeM)}m</span>
                    <span>Geschw.: {Math.round(t.aircraft.speedKmh)} km/h</span>
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{
                    color: getThreatColor(t.threat),
                    backgroundColor: `${getThreatColor(t.threat)}15`,
                    border: `1px solid ${getThreatColor(t.threat)}30`,
                  }}
                >
                  {getThreatLabel(t.threat)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Command Center */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-gray-900">Sicherheitsbefehle</h3>
          </div>

          {/* Target selector */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500 font-medium">Ziel:</span>
            <select
              value={targetDrone}
              onChange={(e) => setTargetDrone(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:border-red-400"
            >
              <option value="all">Alle Drohnen (Broadcast)</option>
              {liveFlights.map((f) => (
                <option key={f.id} value={f.booking.identifier}>
                  {f.booking.identifier} — {f.booking.pilotName}
                </option>
              ))}
            </select>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_MESSAGES.map((qm) => (
              <button
                key={qm.label}
                onClick={() => sendAlert("targeted", qm.msg)}
                className="text-[11px] font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                {qm.label}
              </button>
            ))}
          </div>

          {/* Emergency buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => sendAlert("emergency_rtl", `NOTFALL RTL: ${targetDrone === "all" ? "Alle Drohnen" : targetDrone} — Sofortige Rückkehr zum Hub!`)}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              <Plane className="w-4 h-4" />
              Return-to-Launch (RTL)
            </button>
            <button
              onClick={() => sendAlert("emergency_land", `NOTFALL LANDUNG: ${targetDrone === "all" ? "Alle Drohnen" : targetDrone} — Sofortige Notlandung!`)}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <OctagonX className="w-4 h-4" />
              Notlandung
            </button>
          </div>

          {/* Custom message */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="Eigene Sicherheitsnachricht..."
              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-400"
              onKeyDown={(e) => e.key === "Enter" && handleSendCustom()}
            />
            <button
              onClick={handleSendCustom}
              disabled={!customMsg.trim()}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Log */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">Sicherheitsprotokoll</h3>
            <span className="text-[10px] text-gray-400 ml-auto">{alerts.length} Einträge</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {alerts.map((a) => (
              <div key={a.id} className="px-5 py-2.5 flex items-start gap-3">
                <div className="mt-0.5">
                  {a.type === "emergency_land" ? (
                    <OctagonX className="w-3.5 h-3.5 text-red-500" />
                  ) : a.type === "emergency_rtl" ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-gray-700">{a.target}</span>
                    <span className="text-[9px] text-gray-300 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {a.sentAt}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">{a.message}</p>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
