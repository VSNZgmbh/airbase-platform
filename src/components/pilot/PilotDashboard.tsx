"use client";

import { useState, useEffect } from "react";
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
  Radio,
  Compass,
  Signal,
  Zap,
} from "lucide-react";
import { WeatherBadge } from "./WeatherBadge";
import { SwissMap } from "@/components/mission-control";
import { ProximityWarning } from "@/components/airspace/ProximityWarning";

// ─── Constants ────────────────────────────────────────────────────────────────

const FLIGHT_STATUS_LABELS: Record<string, { label: string; color: string; glow: string }> = {
  scheduled: { label: "Geplant", color: "bg-gray-700 text-gray-300 border-gray-600", glow: "" },
  pre_flight_check: { label: "Vorflugcheck", color: "bg-amber-900/60 text-amber-400 border-amber-700", glow: "" },
  in_air: { label: "In der Luft", color: "bg-green-900/60 text-green-400 border-green-700", glow: "shadow-green-500/20 shadow-lg" },
  landed: { label: "Gelandet", color: "bg-gray-700 text-gray-300 border-gray-600", glow: "" },
  completed: { label: "Abgeschlossen", color: "bg-gray-800 text-gray-500 border-gray-700", glow: "" },
  aborted: { label: "Abgebrochen", color: "bg-red-900/60 text-red-400 border-red-700", glow: "" },
};

const SAFETY_CHECKLIST = [
  "Fallschirm-Selbsttest bestanden (Deployment-Check)",
  "Notlandeplatz identifiziert und kommuniziert",
  "Emergency-Descent-Briefing abgeschlossen",
  "Akku vollständig geladen (Modul A + B geprüft)",
  "Akkugesundheit beider Batteriemodule verifiziert (SoH ≥ 80%)",
  "Propeller auf Schäden geprüft (Sichtprüfung)",
  "Propeller-Drehmoment-Check nach letztem Wechsel bestätigt",
  "INS/GPS-Ausrichtung verifiziert (Gyro-Offset < Grenzwert)",
  "GPS-Signal stabil (min. 12 Satelliten)",
  "LiDAR-Hinderniserkennung aktiviert und Selbsttest bestanden",
  "mmWave-Radar kalibriert (Front + Heck)",
  "C2-Link-Stärke geprüft (SafeSky RSSI + INVOLI RSSI > Schwellenwert)",
  "Kommunikation mit Bodenstelle hergestellt",
  "Wetterdaten aktuell (max. 30 Minuten alt)",
  "Wetterkonditionen innerhalb der Betriebsgrenzen",
  "Luftraum-Freigabe bestätigt (NOTAM geprüft)",
  "Nutzlast korrekt gesichert und gewogen",
  "Nutzlastgewicht gegen zertifiziertes Limit verifiziert",
  "Crew-Rest-Nachweis erbracht (min. 8h vor Einsatz)",
];

const MISSION_TYPES: Record<string, { label: string; color: string }> = {
  LASTENFLUG: { label: "Lastenflug", color: "text-green-400" },
  EINMALIGE_LIEFERUNG: { label: "Einmalige Lieferung", color: "text-green-400" },
  LANGZEIT_EINSATZ: { label: "Langzeit-Einsatz", color: "text-cyan-400" },
};

// ─── Cockpit Top Bar ────────────────────────────────────────────────────────

function CockpitTopBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(now.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-14 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight">MISSION CONTROL</span>
            <span className="text-[9px] text-gray-500 ml-2 font-mono">PIC COCKPIT</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* System status indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[10px] font-mono text-green-400">C2 LINK OK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[10px] font-mono text-green-400">GPS 14SAT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Battery className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[10px] font-mono text-green-400">95%</span>
          </div>
        </div>
        <div className="border-l border-gray-800 pl-4">
          <span className="font-mono text-xl font-bold text-green-400 tracking-wider">{time}</span>
          <span className="text-[10px] text-gray-600 ml-2 font-mono">UTC+2</span>
        </div>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs font-bold text-green-400 font-mono">LIVE</span>
        </div>
      </div>
    </div>
  );
}

// ─── Cockpit Sidebar ────────────────────────────────────────────────────────

function CockpitSidebar({ flights, activeCount, completedCount }: { flights: any[]; activeCount: number; completedCount: number }) {
  return (
    <aside className="w-56 bg-gray-950 border-r border-gray-800 flex flex-col min-h-screen">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div>
            <div className="font-bold text-white text-lg tracking-tight leading-none">AIRBASE</div>
            <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-[0.2em]">Pilot OS</div>
          </div>
        </div>

        {/* Flight Stats */}
        <div className="space-y-2">
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-1">Zugewiesene Flüge</p>
            <p className="text-2xl font-bold text-white font-mono">{flights.length}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
              <p className="text-[9px] font-mono text-gray-500 uppercase">Aktiv</p>
              <p className="text-xl font-bold text-green-400 font-mono">{activeCount}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
              <p className="text-[9px] font-mono text-gray-500 uppercase">Fertig</p>
              <p className="text-xl font-bold text-gray-400 font-mono">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 flex-1">
        {[
          { href: "/dashboard", icon: MapPin, label: "Kunden" },
          { href: "/pilot", icon: Compass, label: "Cockpit", active: true },
          { href: "/admin", icon: ShieldCheck, label: "Admin & Safety" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
              item.active
                ? "bg-green-500/10 text-green-400 font-semibold"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-900"
            }`}
          >
            <item.icon className={`w-4 h-4 ${item.active ? "text-green-400" : "text-gray-600"}`} />
            {item.label}
          </a>
        ))}
      </nav>

      {/* Drone card */}
      <div className="px-4 pb-6">
        <div className="bg-gray-900 rounded-xl p-4 flex flex-col items-center border border-gray-800">
          <Plane className="w-10 h-10 text-green-400 mb-2 -rotate-45" />
          <span className="text-[10px] font-bold text-green-400 tracking-wider font-mono">FLYCART 100</span>
          <span className="text-[9px] text-gray-600 mt-0.5">DJI · 100 kg Nutzlast</span>
        </div>
      </div>
    </aside>
  );
}

// ─── Telemetry Gauge ────────────────────────────────────────────────────────

function TelemetryGauge({ label, value, unit, max, icon: Icon, warning }: {
  label: string; value: number; unit: string; max: number;
  icon: React.ComponentType<{ className?: string }>;
  warning?: boolean;
}) {
  const size = 64;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);
  const color = warning ? "#F59E0B" : "#22C55E";

  return (
    <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${warning ? "text-amber-400" : "text-green-400"}`} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-white leading-none font-mono">
          {value}<span className="text-[10px] text-gray-500 ml-0.5">{unit}</span>
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{label}</p>
      </div>
    </div>
  );
}

// ─── SORA Guidelines ────────────────────────────────────────────────────────

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
    <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-green-400" />
        <span className="text-xs font-bold text-green-400 uppercase tracking-wider font-mono">SORA SAIL {sail}</span>
      </div>
      <ul className="space-y-1.5">
        {rules.map((rule, i) => (
          <li key={i} className="text-xs text-green-300/80 flex items-start gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Weather & Airspace ─────────────────────────────────────────────────────

function WeatherAirspacePanel() {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-800">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] font-mono">Wetter & Luftraum</h3>
        <p className="text-[10px] text-gray-600 mt-0.5 font-mono">Berner Oberland — Jetzt</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Sun, label: "Sicht", value: "> 10 km", color: "text-cyan-400", bg: "bg-cyan-950/50 border-cyan-900" },
            { icon: Wind, label: "Wind", value: "12 km/h NW", color: "text-green-400", bg: "bg-green-950/50 border-green-900" },
            { icon: Thermometer, label: "Temp", value: "14°C", color: "text-gray-300", bg: "bg-gray-800 border-gray-700" },
            { icon: CloudRain, label: "Niederschlag", value: "0%", color: "text-gray-300", bg: "bg-gray-800 border-gray-700" },
          ].map((item) => (
            <div key={item.label} className={`rounded-lg p-2.5 border ${item.bg}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className={`text-[10px] font-bold ${item.color} font-mono`}>{item.label}</span>
              </div>
              <p className={`text-sm font-bold ${item.color} font-mono`}>{item.value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-mono">Luftraum-Restriktionen</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs bg-green-950/50 rounded-lg px-3 py-2 border border-green-900">
              <span className="font-medium text-green-400 font-mono">CTR Interlaken</span>
              <span className="text-[9px] font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full border border-green-800">FREI</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-amber-950/50 rounded-lg px-3 py-2 border border-amber-900">
              <span className="font-medium text-amber-400 font-mono">TMA Bern Lower</span>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-900/50 px-2 py-0.5 rounded-full border border-amber-800">EINGESCHRÄNKT</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-red-950/50 rounded-lg px-3 py-2 border border-red-900">
              <span className="font-medium text-red-400 font-mono">R-Area Militär Thun</span>
              <span className="text-[9px] font-bold text-red-400 bg-red-900/50 px-2 py-0.5 rounded-full border border-red-800">GESPERRT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Drone Status ───────────────────────────────────────────────────────────

function DroneStatusPanel({ drone }: { drone: any }) {
  if (!drone) return null;
  const hasBatteryData = "batteryCyclesUsed" in drone;
  if (!hasBatteryData) return null;
  const d = drone as (typeof DEMO_DRONES)[0];

  const batteryPct = (d.batteryCyclesUsed / d.batteryCyclesMax) * 100;
  const propellerPct = (d.propellerHours / d.propellerMaxHours) * 100;
  const flightsToInspection = d.nextMotorInspectionFlights - d.totalFlights;

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-800">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] font-mono">Drohnen-Verschleiss — DJI FlyCart 100</h3>
        <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{d.serialNumber} · {d.batteryMode === "dual" ? "Dual" : "Einzel"}-Batterie</p>
      </div>
      <div className="p-4 space-y-3">
        {/* Battery */}
        <div className="bg-gray-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 font-mono">
              <Battery className="w-3.5 h-3.5 text-gray-500" />
              DB2160 Batterie (41 Ah / 52 V)
            </span>
            <span className={`text-[10px] font-bold font-mono ${d.batteryHealthPct >= 90 ? "text-green-400" : d.batteryHealthPct >= 80 ? "text-amber-400" : "text-red-400"}`}>
              {d.batteryHealthPct}% SoH
            </span>
          </div>
          <div className="flex items-center justify-between text-[9px] text-gray-500 mb-1 font-mono">
            <span>{d.batteryCyclesUsed} / {d.batteryCyclesMax} Zyklen</span>
            <span>Max. 1&apos;500 Zyklen</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${batteryPct > 70 ? "bg-amber-500" : "bg-green-500"}`}
              style={{ width: `${batteryPct}%` }} />
          </div>
        </div>

        {/* Propeller */}
        <div className="bg-gray-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 font-mono">
              <Navigation className="w-3.5 h-3.5 text-gray-500" />
              Propeller 62&quot; Carbon
            </span>
            <span className={`text-[10px] font-bold font-mono ${propellerPct > 75 ? "text-amber-400" : "text-green-400"}`}>
              {Math.round(100 - propellerPct)}% Rest
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${propellerPct > 75 ? "bg-amber-500" : "bg-green-500"}`}
              style={{ width: `${propellerPct}%` }} />
          </div>
        </div>

        {/* Motor */}
        <div className="bg-gray-800 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 font-mono">
              <Wrench className="w-3.5 h-3.5 text-gray-500" />
              8x Motoren (155×16mm)
            </span>
            <span className={`text-[10px] font-bold font-mono ${flightsToInspection <= 10 ? "text-amber-400" : "text-green-400"}`}>
              {flightsToInspection > 0 ? `${flightsToInspection} Flüge` : "FÄLLIG!"}
            </span>
          </div>
        </div>

        {/* Quick specs */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { label: "Nutzlast", value: `${d.maxPayloadKg} kg` },
            { label: "Reichweite", value: `${d.maxRangeKm} km` },
            { label: "Flugzeit", value: `${d.batteryMode === "dual" ? "14" : "7"} min` },
          ].map((item) => (
            <div key={item.label} className="text-center bg-gray-800 rounded-lg p-2 border border-gray-700">
              <p className="text-[9px] text-gray-500 font-mono">{item.label}</p>
              <p className="text-xs font-bold text-white font-mono">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Maintenance ────────────────────────────────────────────────────────────

function MaintenancePanel() {
  const upcoming = DEMO_MAINTENANCE.filter((m) => m.status === "upcoming" || m.status === "in_progress")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-800">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] font-mono">Nächste Wartung</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {upcoming.map((m) => (
          <div key={m.id} className="px-5 py-3">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <Wrench className={`w-3.5 h-3.5 ${m.status === "in_progress" ? "text-amber-400" : "text-gray-500"}`} />
                <span className="text-xs font-bold text-white font-mono">{m.droneModel}</span>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                m.status === "in_progress" ? "bg-amber-900/50 text-amber-400 border-amber-800" :
                m.type === "repair" ? "bg-red-900/50 text-red-400 border-red-800" :
                "bg-gray-800 text-gray-400 border-gray-700"
              }`}>
                {m.status === "in_progress" ? "In Arbeit" : m.type === "repair" ? "Reparatur" : "Geplant"}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mb-1">{m.task}</p>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(m.scheduledAt), "d. MMM yyyy HH:mm", { locale: de })}</span>
              <span>· ~{m.estimatedHours}h</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Post-Flight Form ───────────────────────────────────────────────────────

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

// ─── Active Mission Detail ──────────────────────────────────────────────────

function ActiveMissionDetail({ flight }: { flight: any }) {
  if (!flight) return null;
  const booking = flight.booking;
  const statusCfg = FLIGHT_STATUS_LABELS[flight.status] ?? FLIGHT_STATUS_LABELS.scheduled;
  const missionType = MISSION_TYPES[booking?.serviceSubtype ?? ""] ?? MISSION_TYPES.LASTENFLUG;

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] font-mono">Aktive Mission</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-white">{booking?.identifier ?? flight.id.slice(0, 8)}</span>
          <span className={`text-xs font-semibold font-mono ${missionType.color}`}>{missionType.label}</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Telemetry */}
        <div className="grid grid-cols-4 gap-3">
          <TelemetryGauge label="Nutzlast" value={parseFloat(booking?.payloadWeightKg ?? "0")} unit="kg" max={100} icon={Package} />
          <TelemetryGauge label="Batterie" value={92} unit="%" max={100} icon={Battery} />
          <TelemetryGauge label="Geschw." value={75} unit="km/h" max={120} icon={Gauge} />
          <TelemetryGauge label="Höhe" value={120} unit="m" max={300} icon={Navigation} />
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-3">
          {booking?.pickupAddress && (
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Abflugort</span>
              </div>
              <p className="text-xs font-semibold text-white">{booking.pickupAddress}</p>
            </div>
          )}
          <div className="bg-gray-800 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3 h-3 text-green-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Lieferadresse</span>
            </div>
            <p className="text-xs font-semibold text-white">{booking?.deliveryAddress ?? "—"}</p>
          </div>
        </div>

        {/* Route info */}
        <div className="flex items-center gap-4 text-[10px] text-gray-400 bg-gray-800 rounded-lg px-3 py-2 font-mono">
          <span>Distanz: <span className="text-white font-semibold">{booking?.routeDistanceKm ?? "—"} km</span></span>
          <span>Pilot: <span className="text-white font-semibold">{booking?.pilotName ?? "—"}</span></span>
          <span>Drohne: <span className="text-white font-semibold">{flight.drone?.model ?? "—"}</span></span>
        </div>

        <SORAGuidelines soraCategory={flight.soraCategory} />
      </div>
    </div>
  );
}

// ─── Mission List ───────────────────────────────────────────────────────────

function MissionList({
  flights, expandedId, setExpandedId, showPostFlight, setShowPostFlight,
  forms, getForm, updateForm, toggleChecklist, submitMutation,
}: {
  flights: any[]; expandedId: string | null; setExpandedId: (id: string | null) => void;
  showPostFlight: string | null; setShowPostFlight: (id: string | null) => void;
  forms: Record<string, PostFlightForm>; getForm: (id: string) => PostFlightForm;
  updateForm: (id: string, patch: Partial<PostFlightForm>) => void;
  toggleChecklist: (id: string, idx: number) => void; submitMutation: any;
}) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 140px)" }}>
      <div className="px-5 py-3 border-b border-gray-800 flex-shrink-0">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] font-mono">Heutige Missionen</h3>
        <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{flights.length} Flüge — {format(new Date(), "d. MMMM yyyy", { locale: de })}</p>
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
            <div key={flight.id} className={`border-b border-gray-800 last:border-b-0 ${statusCfg.glow}`}>
              <div
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : flight.id)}
              >
                <div className="flex-shrink-0">
                  {flight.status === "in_air" ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                    </span>
                  ) : flight.status === "pre_flight_check" ? (
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                  ) : (
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-gray-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs font-bold text-white truncate">{booking?.identifier ?? flight.id.slice(0, 8)}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border font-mono ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                    {flight.scheduledDeparture && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(flight.scheduledDeparture), "d. MMM HH:mm", { locale: de })}
                      </span>
                    )}
                    {booking?.payloadWeightKg && (
                      <><span className="text-gray-700">|</span><span>{booking.payloadWeightKg} kg</span></>
                    )}
                    {booking?.routeDistanceKm && (
                      <><span className="text-gray-700">|</span><span>{booking.routeDistanceKm} km</span></>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-4 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold font-mono ${missionType.color}`}>{missionType.label}</span>
                    {flight.soraCategory && (
                      <span className="text-[10px] font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded-md border border-gray-700">
                        {flight.soraCategory}
                      </span>
                    )}
                  </div>

                  {flight.status !== "completed" && flight.status !== "aborted" && booking?.deliveryLat && booking?.deliveryLng && (
                    <WeatherBadge
                      lat={parseFloat(booking.deliveryLat)}
                      lng={parseFloat(booking.deliveryLng)}
                      datetime={flight.scheduledDeparture ? new Date(flight.scheduledDeparture).toISOString() : undefined}
                    />
                  )}

                  <div className="space-y-2 text-xs">
                    {booking?.pickupAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] text-gray-600 uppercase tracking-wider font-mono">Abflug</span>
                          <p className="text-gray-300 font-medium">{booking.pickupAddress}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-600 uppercase tracking-wider font-mono">Lieferung</span>
                        <p className="text-gray-300 font-medium">{booking?.deliveryAddress ?? "—"}</p>
                      </div>
                    </div>
                  </div>

                  {flight.drone && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 font-mono">
                      <Plane className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-medium text-white">{flight.drone.model}</span>
                      <span className="text-gray-700">|</span>
                      <span className="text-[10px]">{flight.drone.serialNumber}</span>
                    </div>
                  )}

                  {flight.permits.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                        <FileText className="w-3 h-3" />
                        Bewilligungen
                      </p>
                      <div className="space-y-1.5">
                        {flight.permits.map((permit: any) => (
                          <div key={permit.id} className="flex items-center justify-between text-xs bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 font-mono">
                            <span className="font-medium text-gray-300">{permit.authority}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              permit.status === "approved" ? "bg-green-900/50 text-green-400 border-green-800" :
                              permit.status === "rejected" ? "bg-red-900/50 text-red-400 border-red-800" :
                              "bg-amber-900/50 text-amber-400 border-amber-800"
                            }`}>
                              {permit.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking?.isDangerousGoods && (
                    <p className="text-red-400 text-xs font-bold flex items-center gap-1 font-mono">
                      <AlertTriangle className="w-3 h-3" />
                      GEFAHRGUT
                    </p>
                  )}

                  {flight.status !== "completed" && flight.status !== "aborted" && (
                    <button
                      onClick={() => setShowPostFlight(isPostFlightOpen ? null : flight.id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-green-500/20 w-full justify-center font-mono"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      Post-Flight Report
                    </button>
                  )}

                  {isPostFlightOpen && (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2 font-mono">
                        <ClipboardList className="w-4 h-4 text-green-400" />
                        Post-Flight Report
                      </h4>

                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">Sicherheits-Checkliste</p>
                        <div className="space-y-1.5">
                          {SAFETY_CHECKLIST.map((item, idx) => (
                            <label key={idx} className="flex items-start gap-2.5 cursor-pointer group">
                              <input type="checkbox" checked={form.checklistDone[idx]} onChange={() => toggleChecklist(flight.id, idx)}
                                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500/40" />
                              <span className={`text-xs transition-colors ${form.checklistDone[idx] ? "text-green-400" : "text-gray-400 group-hover:text-gray-300"}`}>{item}</span>
                            </label>
                          ))}
                        </div>
                        {!allChecked && (
                          <p className="text-[10px] text-amber-400 mt-2 flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-3 h-3" />
                            Alle Checkpunkte müssen bestätigt sein.
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Gewicht (kg)", key: "actualWeightKg", placeholder: "z.B. 24.5" },
                          { label: "Flugdauer (Min)", key: "flightDurationMinutes", placeholder: "z.B. 45" },
                          { label: "Verbrauch (kWh)", key: "fuelConsumptionKwh", placeholder: "z.B. 8.2" },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="block text-[10px] font-medium text-gray-500 mb-1 font-mono">{field.label}</label>
                            <input type="number"
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all font-mono"
                              placeholder={field.placeholder} value={form[field.key as keyof PostFlightForm] as string}
                              onChange={(e) => updateForm(flight.id, { [field.key]: e.target.value })} />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1 font-mono">Notizen</label>
                        <textarea rows={2}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all resize-none"
                          placeholder="Besonderheiten..." value={form.notes}
                          onChange={(e) => updateForm(flight.id, { notes: e.target.value })} />
                      </div>

                      {submitMutation.error && <p className="text-xs text-red-400 font-mono">{submitMutation.error.message}</p>}

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const weight = parseFloat(form.actualWeightKg);
                            const duration = parseInt(form.flightDurationMinutes, 10);
                            if (!allChecked || isNaN(weight) || isNaN(duration)) return;
                            submitMutation.mutate({
                              flightId: flight.id, actualWeightKg: weight,
                              flightDurationMinutes: duration, notes: form.notes || undefined,
                              incidentReport: form.incidentReport || undefined,
                            });
                          }}
                          disabled={!allChecked || !form.actualWeightKg || !form.flightDurationMinutes || submitMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-green-500/20 font-mono"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {submitMutation.isPending ? "Wird eingereicht..." : "Report einreichen"}
                        </button>
                        <button onClick={() => setShowPostFlight(null)}
                          className="px-4 py-2.5 text-gray-400 text-xs font-semibold rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors font-mono">
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  )}

                  {flight.status === "completed" && (
                    <div className="flex items-center gap-2 text-green-400 text-xs font-semibold bg-green-900/30 border border-green-800/50 rounded-xl px-4 py-2.5 font-mono">
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

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export function PilotDashboard() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPostFlight, setShowPostFlight] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, PostFlightForm>>({});

  const { data, isLoading, error, refetch } = trpc.pilot.myFlights.useQuery({ limit: 20, offset: 0 });
  const submitMutation = trpc.pilot.submitPostFlight.useMutation({
    onSuccess: () => { setShowPostFlight(null); refetch(); },
  });

  function getForm(flightId: string): PostFlightForm { return forms[flightId] ?? defaultForm(); }
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
      <div className="flex min-h-screen bg-gray-950">
        <CockpitSidebar flights={[]} activeCount={0} completedCount={0} />
        <div className="flex-1 flex flex-col">
          <CockpitTopBar />
          <div className="p-5">
            <div className="grid grid-cols-[1fr_380px] gap-5">
              <div className="flex flex-col gap-5">
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 animate-pulse h-48" />
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 animate-pulse h-20" />
              </div>
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 animate-pulse h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <CockpitSidebar flights={[]} activeCount={0} completedCount={0} />
        <div className="flex-1 flex flex-col">
          <CockpitTopBar />
          <div className="p-5">
            <div className="bg-red-900/50 border border-red-800 rounded-2xl p-6 text-center text-red-400 font-mono">{error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <CockpitSidebar flights={flights} activeCount={activeCount} completedCount={completedCount} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <CockpitTopBar />
        <main className="flex-1 overflow-y-auto p-5" style={{ maxHeight: "calc(100vh - 56px)" }}>
          <div className="grid grid-cols-[1fr_380px] gap-5">
            {/* Left: Map + Mission + Instruments */}
            <div className="flex flex-col gap-5">
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <SwissMap compact showAirTraffic />
              </div>
              <ActiveMissionDetail flight={activeFlightOrFirst} />
              <DroneStatusPanel drone={activeFlightOrFirst?.drone ?? DEMO_DRONES[0]} />
              <ProximityWarning />
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
        </main>
      </div>
    </div>
  );
}
