"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { DEMO_FLIGHTS, DEMO_MAINTENANCE, DEMO_DRONES } from "@/lib/demo-data";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Plane,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Battery,
  Gauge,
  ShieldCheck,
  Navigation,
  FileText,
  Wrench,
  Wind,
  Thermometer,
  Eye,
  CloudRain,
  Sun,
  Calendar,
} from "lucide-react";
import { WeatherBadge } from "./WeatherBadge";
import { MissionControlLayout, SwissMap, KeyMetrics } from "@/components/mission-control";

// ─── Constants ────────────────────────────────────────────────────────────────

const FLIGHT_STATUS_LABELS: Record<string, { label: string; color: string; glow: string }> = {
  scheduled: { label: "Geplant", color: "bg-gray-50 text-gray-600 border-gray-200", glow: "" },
  pre_flight_check: { label: "Vorflugcheck", color: "bg-amber-50 text-amber-600 border-amber-200", glow: "" },
  in_air: { label: "In der Luft", color: "bg-brand-50 text-brand-600 border-brand-200", glow: "shadow-brand-500/10 shadow-lg" },
  landed: { label: "Gelandet", color: "bg-gray-50 text-gray-600 border-gray-200", glow: "" },
  completed: { label: "Abgeschlossen", color: "bg-gray-50 text-gray-500 border-gray-200", glow: "" },
  aborted: { label: "Abgebrochen", color: "bg-red-50 text-red-600 border-red-200", glow: "" },
};

const SAFETY_CHECKLIST = [
  "Akku vollständig geladen und geprüft",
  "Propeller auf Schäden geprüft",
  "GPS-Signal stabil (min. 8 Satelliten)",
  "Hinderniserkennungs-Sensoren kalibriert",
  "Wetterkonditionen innerhalb der Betriebsgrenzen",
  "Luftraum-Freigabe bestätigt (NOTAM geprüft)",
  "Kommunikation mit Bodenstelle hergestellt",
  "Nutzlast korrekt gesichert und gewogen",
];

const MISSION_TYPES: Record<string, { label: string; color: string }> = {
  LASTENFLUG: { label: "Lastenflug", color: "text-brand-500" },
  EINMALIGE_LIEFERUNG: { label: "Einmalige Lieferung", color: "text-brand-600" },
  LANGZEIT_EINSATZ: { label: "Langzeit-Einsatz", color: "text-brand-700" },
};

// ─── Telemetry Gauge (SVG ring) ──────────────────────────────────────────────

function TelemetryGauge({ label, value, unit, max, icon: Icon, warning }: {
  label: string; value: number; unit: string; max: number;
  icon: React.ComponentType<{ className?: string }>;
  warning?: boolean;
}) {
  const size = 56;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);
  const color = warning ? "#F59E0B" : "#D32F2F";

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${warning ? "text-amber-500" : "text-brand-500"}`} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-gray-900 leading-none">
          {value}<span className="text-[10px] text-gray-400 ml-0.5">{unit}</span>
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── SORA Guidelines ──────────────────────────────────────────────────────────

function SORAGuidelines({ soraCategory }: { soraCategory?: string | null }) {
  if (!soraCategory) return null;
  const sailMatch = soraCategory.match(/SAIL\s*(\w+)/i);
  const sail = sailMatch ? sailMatch[1] : soraCategory;

  const guidelines: Record<string, string[]> = {
    I: ["Sichtflug (VLOS) einhalten", "Max. Höhe 120m AGL", "Abstand zu Menschen halten"],
    II: ["VLOS oder erweiterter VLOS mit Beobachter", "Risikobewertung durchführen", "Notfallverfahren bereithalten"],
    III: ["BVLOS möglich mit Genehmigung", "Erweiterte Risikobewertung erforderlich", "C2 Link-Redundanz sicherstellen", "Notlandeverfahren aktivieren"],
    IV: ["Safety Manager Freigabe erforderlich", "Vollständige SORA-Dokumentation", "Betriebssicherheitsplan aktiv", "Echtzeit-Monitoring durch Bodenstelle"],
  };

  const rules = guidelines[sail] ?? guidelines["I"] ?? [];

  return (
    <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-brand-500" />
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">SORA SAIL {sail} — Richtlinien</span>
      </div>
      <ul className="space-y-1.5">
        {rules.map((rule, i) => (
          <li key={i} className="text-xs text-brand-700 flex items-start gap-2">
            <CheckCircle2 className="w-3 h-3 text-brand-500 mt-0.5 flex-shrink-0" />
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Weather & Airspace Overview ─────────────────────────────────────────────

function WeatherAirspacePanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Wetter & Luftraum</h3>
        <p className="text-[10px] text-gray-300 mt-0.5">Berner Oberland — Jetzt</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Sun className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-bold text-blue-600">Sicht</span>
            </div>
            <p className="text-sm font-bold text-blue-700">&gt; 10 km</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5 border border-green-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Wind className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[10px] font-bold text-green-600">Wind</span>
            </div>
            <p className="text-sm font-bold text-green-700">12 km/h NW</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Thermometer className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[10px] font-bold text-gray-500">Temp</span>
            </div>
            <p className="text-sm font-bold text-gray-700">14°C</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <CloudRain className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[10px] font-bold text-gray-500">Niederschlag</span>
            </div>
            <p className="text-sm font-bold text-gray-700">0%</p>
          </div>
        </div>
        {/* Airspace zones */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Aktive Luftraum-Restriktionen</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs bg-green-50 rounded-lg px-3 py-2 border border-green-100">
              <span className="font-medium text-green-700">CTR Interlaken</span>
              <span className="text-[9px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">FREI</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
              <span className="font-medium text-amber-700">TMA Bern Lower</span>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">EINGESCHRÄNKT</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-red-50 rounded-lg px-3 py-2 border border-red-100">
              <span className="font-medium text-red-700">R-Area Militär Thun</span>
              <span className="text-[9px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">GESPERRT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Drone Status / Wear Tracking (DJI FlyCart 30 real specs) ────────────────

function DroneStatusPanel({ drone }: { drone: any }) {
  if (!drone) return null;
  const hasBatteryData = "batteryCyclesUsed" in drone;
  if (!hasBatteryData) return null;
  const d = drone as (typeof DEMO_DRONES)[0];

  const batteryPct = (d.batteryCyclesUsed / d.batteryCyclesMax) * 100;
  const propellerPct = (d.propellerHours / d.propellerMaxHours) * 100;
  const flightsToInspection = d.nextMotorInspectionFlights - d.totalFlights;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Drohnen-Verschleiss — DJI FlyCart 30</h3>
        <p className="text-[10px] text-gray-300 mt-0.5">{d.serialNumber} · {d.batteryMode === "dual" ? "Dual" : "Einzel"}-Batterie</p>
      </div>
      <div className="p-4 space-y-3">
        {/* Battery DB2000 */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-gray-400" />
              DB2000 Batterie (38&apos;000 mAh)
            </span>
            <span className={`text-[10px] font-bold ${d.batteryHealthPct >= 90 ? "text-emerald-600" : d.batteryHealthPct >= 80 ? "text-amber-600" : "text-red-600"}`}>
              {d.batteryHealthPct}% Gesundheit
            </span>
          </div>
          <div className="flex items-center justify-between text-[9px] text-gray-400 mb-1">
            <span>{d.batteryCyclesUsed} / {d.batteryCyclesMax} Ladezyklen</span>
            <span>Max. 12 Monate / 1&apos;500 Zyklen</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${batteryPct > 70 ? "bg-amber-400" : "bg-emerald-400"}`}
              style={{ width: `${batteryPct}%` }} />
          </div>
          <p className="text-[9px] text-gray-400 mt-1">
            Installiert: {new Date(d.batteryInstalledDate).toLocaleDateString("de-CH")} · Ladedauer: {d.batteryMode === "dual" ? "2.5h" : "2.0h"}
          </p>
        </div>

        {/* Propeller 54" Carbon */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-gray-400" />
              Propeller 54&quot; Carbon-Composite
            </span>
            <span className={`text-[10px] font-bold ${propellerPct > 75 ? "text-amber-600" : "text-emerald-600"}`}>
              {Math.round(100 - propellerPct)}% Restleben
            </span>
          </div>
          <div className="flex items-center justify-between text-[9px] text-gray-400 mb-1">
            <span>{d.propellerHours}h / {d.propellerMaxHours}h bis Austausch</span>
            <span>Oder alle 36 Monate</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${propellerPct > 75 ? "bg-amber-400" : "bg-emerald-400"}`}
              style={{ width: `${propellerPct}%` }} />
          </div>
          <p className="text-[9px] text-gray-400 mt-1">
            Installiert: {new Date(d.propellerInstalledDate).toLocaleDateString("de-CH")} · Tägliche Sichtprüfung auf Verschleisslinien
          </p>
        </div>

        {/* Motor Inspection */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-gray-400" />
              8x Motoren (100x33mm, 4kW)
            </span>
            <span className={`text-[10px] font-bold ${flightsToInspection <= 10 ? "text-amber-600" : "text-emerald-600"}`}>
              {flightsToInspection > 0 ? `${flightsToInspection} Flüge bis Inspektion` : "Inspektion fällig!"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[9px] text-gray-400">
            <span>Letzte Inspektion: {new Date(d.lastMotorInspectionDate).toLocaleDateString("de-CH")}</span>
            <span>Intervall: alle 50h / 100 Flüge</span>
          </div>
        </div>

        {/* Quick specs */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="text-center bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-400">Nutzlast</p>
            <p className="text-xs font-bold text-gray-700">{d.maxPayloadKg} kg</p>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-400">Reichweite</p>
            <p className="text-xs font-bold text-gray-700">{d.maxRangeKm} km</p>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-400">Flugzeit ({d.batteryMode === "dual" ? "30 kg" : "leer"})</p>
            <p className="text-xs font-bold text-gray-700">{d.batteryMode === "dual" ? "18" : "15"} min</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Maintenance Schedule ────────────────────────────────────────────────────

function MaintenancePanel() {
  const upcoming = DEMO_MAINTENANCE.filter((m) => m.status === "upcoming" || m.status === "in_progress")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Nächste Wartungstermine</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {upcoming.map((m) => (
          <div key={m.id} className="px-5 py-3">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <Wrench className={`w-3.5 h-3.5 ${m.status === "in_progress" ? "text-amber-500" : "text-gray-400"}`} />
                <span className="text-xs font-bold text-gray-900">{m.droneModel}</span>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                m.status === "in_progress" ? "bg-amber-50 text-amber-600 border-amber-200" :
                m.type === "repair" ? "bg-red-50 text-red-600 border-red-200" :
                "bg-gray-50 text-gray-500 border-gray-200"
              }`}>
                {m.status === "in_progress" ? "In Arbeit" : m.type === "repair" ? "Reparatur" : "Geplant"}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mb-1">{m.task}</p>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(m.scheduledAt), "d. MMM yyyy HH:mm", { locale: de })}</span>
              <span className="text-gray-200">|</span>
              <span>~{m.estimatedHours}h</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Post-Flight Form ─────────────────────────────────────────────────────────

interface PostFlightForm {
  actualWeightKg: string;
  flightDurationMinutes: string;
  fuelConsumptionKwh: string;
  notes: string;
  incidentReport: string;
  expenses: string;
  checklistDone: boolean[];
}

const defaultForm = (): PostFlightForm => ({
  actualWeightKg: "",
  flightDurationMinutes: "",
  fuelConsumptionKwh: "",
  notes: "",
  incidentReport: "",
  expenses: "",
  checklistDone: SAFETY_CHECKLIST.map(() => false),
});

// ─── Active Mission Detail ───────────────────────────────────────────────────

function ActiveMissionDetail({ flight }: { flight: any }) {
  if (!flight) return null;
  const booking = flight.booking;
  const statusCfg = FLIGHT_STATUS_LABELS[flight.status] ?? FLIGHT_STATUS_LABELS.scheduled;
  const missionType = MISSION_TYPES[booking?.serviceSubtype ?? ""] ?? MISSION_TYPES.LASTENFLUG;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Aktive Mission</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-gray-900">{booking?.identifier ?? flight.id.slice(0, 8)}</span>
          <span className={`text-xs font-semibold ${missionType.color}`}>{missionType.label}</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Telemetry Grid */}
        <div className="grid grid-cols-4 gap-3">
          <TelemetryGauge label="Nutzlast" value={parseFloat(booking?.payloadWeightKg ?? "0")} unit="kg" max={100} icon={Package} />
          <TelemetryGauge label="Batterie" value={92} unit="%" max={100} icon={Battery} />
          <TelemetryGauge label="Geschw." value={75} unit="km/h" max={120} icon={Gauge} />
          <TelemetryGauge label="Höhe" value={120} unit="m" max={300} icon={Navigation} />
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-3">
          {booking?.pickupAddress && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Abflugort</span>
              </div>
              <p className="text-xs font-semibold text-gray-900">{booking.pickupAddress}</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3 h-3 text-brand-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lieferadresse</span>
            </div>
            <p className="text-xs font-semibold text-gray-900">{booking?.deliveryAddress ?? "—"}</p>
          </div>
        </div>

        {/* Route info */}
        <div className="flex items-center gap-4 text-[10px] text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
          <span>Distanz: <span className="text-gray-700 font-semibold">{booking?.routeDistanceKm ?? "—"} km</span></span>
          <span>Pilot: <span className="text-gray-700 font-semibold">{booking?.pilotName ?? "—"}</span></span>
          <span>Drohne: <span className="text-gray-700 font-semibold">{flight.drone?.model ?? "—"}</span></span>
        </div>

        {/* SORA category */}
        <SORAGuidelines soraCategory={flight.soraCategory} />

        {/* Pre-flight Checklist (read-only summary) */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Vorflug-Checkliste (SORA)</p>
          <div className="grid grid-cols-2 gap-1.5">
            {SAFETY_CHECKLIST.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${flight.status === "completed" || flight.status === "in_air" ? "text-brand-500" : "text-gray-300"}`} />
                <span className="text-[10px] text-gray-500">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mission List ─────────────────────────────────────────────────────────────

function MissionList({
  flights,
  expandedId,
  setExpandedId,
  showPostFlight,
  setShowPostFlight,
  forms,
  getForm,
  updateForm,
  toggleChecklist,
  submitMutation,
}: {
  flights: any[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  showPostFlight: string | null;
  setShowPostFlight: (id: string | null) => void;
  forms: Record<string, PostFlightForm>;
  getForm: (id: string) => PostFlightForm;
  updateForm: (id: string, patch: Partial<PostFlightForm>) => void;
  toggleChecklist: (id: string, idx: number) => void;
  submitMutation: any;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 140px)" }}>
      <div className="px-5 py-3 border-b border-gray-50 flex-shrink-0">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Heutige Missionen</h3>
        <p className="text-[10px] text-gray-300 mt-0.5">{flights.length} Flüge — {format(new Date(), "d. MMMM yyyy", { locale: de })}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {flights.map((flight: any) => {
          const isExpanded = expandedId === flight.id;
          const isPostFlightOpen = showPostFlight === flight.id;
          const statusCfg = FLIGHT_STATUS_LABELS[flight.status] ?? FLIGHT_STATUS_LABELS.scheduled;
          const booking = flight.booking;
          const form = getForm(flight.id);
          const allChecked = form.checklistDone.every(Boolean);
          const missionType = MISSION_TYPES[booking?.serviceSubtype ?? ""] ?? MISSION_TYPES.LASTENFLUG;

          return (
            <div key={flight.id} className={`border-b border-gray-50 last:border-b-0 ${statusCfg.glow}`}>
              {/* Row header */}
              <div
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : flight.id)}
              >
                <div className="flex-shrink-0">
                  {flight.status === "in_air" ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
                    </span>
                  ) : flight.status === "pre_flight_check" ? (
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                  ) : (
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs font-bold text-gray-700 truncate">
                      {booking?.identifier ?? flight.id.slice(0, 8)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    {flight.scheduledDeparture && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(flight.scheduledDeparture), "d. MMM HH:mm", { locale: de })}
                      </span>
                    )}
                    {booking?.payloadWeightKg && (
                      <>
                        <span className="text-gray-200">|</span>
                        <span>{booking.payloadWeightKg} kg</span>
                      </>
                    )}
                    {booking?.routeDistanceKm && (
                      <>
                        <span className="text-gray-200">|</span>
                        <span>{booking.routeDistanceKm} km</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 pb-4 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold ${missionType.color}`}>{missionType.label}</span>
                    {flight.soraCategory && (
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        {flight.soraCategory}
                      </span>
                    )}
                  </div>

                  {/* Weather badge */}
                  {flight.status !== "completed" && flight.status !== "aborted" && booking?.deliveryLat && booking?.deliveryLng && (
                    <WeatherBadge
                      lat={parseFloat(booking.deliveryLat)}
                      lng={parseFloat(booking.deliveryLng)}
                      datetime={flight.scheduledDeparture ? new Date(flight.scheduledDeparture).toISOString() : undefined}
                    />
                  )}

                  {/* Flight details */}
                  <div className="space-y-2 text-xs">
                    {booking?.pickupAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-300 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Abflug</span>
                          <p className="text-gray-700 font-medium">{booking.pickupAddress}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Lieferung</span>
                        <p className="text-gray-700 font-medium">{booking?.deliveryAddress ?? "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Drone info */}
                  {flight.drone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      <Plane className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium text-gray-700">{flight.drone.model}</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-mono text-[10px]">{flight.drone.serialNumber}</span>
                    </div>
                  )}

                  {/* Permits */}
                  {flight.permits.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        Bewilligungen
                      </p>
                      <div className="space-y-1.5">
                        {flight.permits.map((permit: any) => (
                          <div key={permit.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                            <span className="font-medium text-gray-700">{permit.authority}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              permit.status === "approved" ? "bg-gray-50 text-gray-600 border-gray-200" :
                              permit.status === "rejected" ? "bg-red-50 text-red-600 border-red-200" :
                              "bg-amber-50 text-amber-600 border-amber-200"
                            }`}>
                              {permit.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking?.isDangerousGoods && (
                    <p className="text-red-600 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      GEFAHRGUT
                    </p>
                  )}

                  {/* Post-flight button */}
                  {flight.status !== "completed" && flight.status !== "aborted" && (
                    <button
                      onClick={() => setShowPostFlight(isPostFlightOpen ? null : flight.id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 w-full justify-center"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      Post-Flight Report erstellen
                    </button>
                  )}

                  {/* Post-flight form */}
                  {isPostFlightOpen && (
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 space-y-4">
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-brand-500" />
                        Post-Flight Report
                      </h4>

                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Sicherheits-Checkliste (Pflicht)</p>
                        <div className="space-y-1.5">
                          {SAFETY_CHECKLIST.map((item, idx) => (
                            <label key={idx} className="flex items-start gap-2.5 cursor-pointer group">
                              <input type="checkbox" checked={form.checklistDone[idx]} onChange={() => toggleChecklist(flight.id, idx)}
                                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 bg-white text-brand-500 focus:ring-brand-500/40" />
                              <span className={`text-xs transition-colors ${form.checklistDone[idx] ? "text-brand-600" : "text-gray-500 group-hover:text-gray-700"}`}>{item}</span>
                            </label>
                          ))}
                        </div>
                        {!allChecked && (
                          <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Alle Checkpunkte müssen bestätigt sein.
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-1">Gewicht (kg)</label>
                          <input type="number" min="0" max="100" step="0.1"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-300 transition-all"
                            placeholder="z.B. 24.5" value={form.actualWeightKg}
                            onChange={(e) => updateForm(flight.id, { actualWeightKg: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-1">Flugdauer (Min)</label>
                          <input type="number" min="1" max="480"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-300 transition-all"
                            placeholder="z.B. 45" value={form.flightDurationMinutes}
                            onChange={(e) => updateForm(flight.id, { flightDurationMinutes: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-1">Verbrauch (kWh)</label>
                          <input type="number" min="0" step="0.1"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-300 transition-all"
                            placeholder="z.B. 8.2" value={form.fuelConsumptionKwh}
                            onChange={(e) => updateForm(flight.id, { fuelConsumptionKwh: e.target.value })} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Notizen / Besonderheiten</label>
                        <textarea rows={2}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-300 transition-all resize-none"
                          placeholder="Besonderheiten, Abweichungen, Wetter..." value={form.notes}
                          onChange={(e) => updateForm(flight.id, { notes: e.target.value })} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-1">Zwischenfall-Bericht</label>
                          <textarea rows={2}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-300 transition-all resize-none"
                            placeholder="Falls zutreffend..." value={form.incidentReport}
                            onChange={(e) => updateForm(flight.id, { incidentReport: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-1">Spesen (CHF)</label>
                          <input type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-300 transition-all"
                            placeholder="z.B. Landeplatzgebühr 15.00" value={form.expenses}
                            onChange={(e) => updateForm(flight.id, { expenses: e.target.value })} />
                        </div>
                      </div>

                      {submitMutation.error && <p className="text-xs text-red-600">{submitMutation.error.message}</p>}

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const weight = parseFloat(form.actualWeightKg);
                            const duration = parseInt(form.flightDurationMinutes, 10);
                            if (!allChecked || isNaN(weight) || isNaN(duration)) return;
                            submitMutation.mutate({
                              flightId: flight.id,
                              actualWeightKg: weight,
                              flightDurationMinutes: duration,
                              notes: form.notes || undefined,
                              incidentReport: form.incidentReport || undefined,
                            });
                          }}
                          disabled={!allChecked || !form.actualWeightKg || !form.flightDurationMinutes || submitMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-brand-500/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {submitMutation.isPending ? "Wird eingereicht..." : "Report einreichen"}
                        </button>
                        <button onClick={() => setShowPostFlight(null)}
                          className="px-4 py-2.5 text-gray-500 text-xs font-semibold rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  )}

                  {flight.status === "completed" && (
                    <div className="flex items-center gap-2 text-brand-600 text-xs font-semibold bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Flug abgeschlossen — Post-Flight Report eingereicht
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function PilotDashboard() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPostFlight, setShowPostFlight] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, PostFlightForm>>({});

  const { data, isLoading, error, refetch } = trpc.pilot.myFlights.useQuery({ limit: 20, offset: 0 });
  const submitMutation = trpc.pilot.submitPostFlight.useMutation({
    onSuccess: () => { setShowPostFlight(null); refetch(); },
  });

  function getForm(flightId: string): PostFlightForm {
    return forms[flightId] ?? defaultForm();
  }
  function updateForm(flightId: string, patch: Partial<PostFlightForm>) {
    setForms((prev) => ({ ...prev, [flightId]: { ...getForm(flightId), ...patch } }));
  }
  function toggleChecklist(flightId: string, idx: number) {
    const form = getForm(flightId);
    const next = [...form.checklistDone];
    next[idx] = !next[idx];
    updateForm(flightId, { checklistDone: next });
  }

  const flights = data?.flights?.length ? data.flights : DEMO_FLIGHTS;
  const activeCount = flights.filter((f: any) => f.status === "in_air" || f.status === "pre_flight_check").length;
  const completedCount = flights.filter((f: any) => f.status === "completed").length;
  const activeFlightOrFirst =
    flights.find((f: any) => f.status === "in_air") ??
    flights.find((f: any) => f.status === "pre_flight_check") ??
    flights[0] ?? null;

  if (isLoading) {
    return (
      <MissionControlLayout>
        <div className="p-5">
          <div className="grid grid-cols-[1fr_380px] gap-5">
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse h-48" />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse h-20" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse h-96" />
          </div>
        </div>
      </MissionControlLayout>
    );
  }

  if (error) {
    return (
      <MissionControlLayout>
        <div className="p-5">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">{error.message}</div>
        </div>
      </MissionControlLayout>
    );
  }

  return (
    <MissionControlLayout>
      <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 48px)" }}>
        <div className="grid grid-cols-[1fr_380px] gap-5">
          {/* Left: Map + Metrics + Current Mission + Weather */}
          <div className="flex flex-col gap-5">
            <SwissMap compact />
            <KeyMetrics items={[
              { label: "Zugewiesene Flüge", value: flights.length, animate: true },
              { label: "Aktiv", value: activeCount, animate: true },
              { label: "Abgeschlossen", value: completedCount, animate: true },
              { label: "Status", value: "BEREIT", highlight: false },
            ]} />
            <ActiveMissionDetail flight={activeFlightOrFirst} />
            <DroneStatusPanel drone={activeFlightOrFirst?.drone ?? DEMO_DRONES[0]} />
            <WeatherAirspacePanel />
            <MaintenancePanel />
          </div>

          {/* Right: Mission list */}
          <div className="flex flex-col gap-5">
            <MissionList
              flights={flights}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              showPostFlight={showPostFlight}
              setShowPostFlight={setShowPostFlight}
              forms={forms}
              getForm={getForm}
              updateForm={updateForm}
              toggleChecklist={toggleChecklist}
              submitMutation={submitMutation}
            />
          </div>
        </div>
      </div>
    </MissionControlLayout>
  );
}
