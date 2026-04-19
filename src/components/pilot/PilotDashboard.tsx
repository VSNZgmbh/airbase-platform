"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  DEMO_FLIGHTS,
  DEMO_MAINTENANCE,
  DEMO_DRONES,
  DEMO_BOOKINGS,
  DEMO_INCIDENTS,
} from "@/lib/demo-data";
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
  ChevronRight,
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
  User,
  Search,
  Bell,
  MessageCircle,
  Send,
  Paperclip,
  Mic,
  Phone,
  PlusCircle,
  MapPinPlus,
  Globe,
  BarChart3,
  Receipt,
  Camera,
  Download,
  Filter,
  CheckCheck,
  Activity,
} from "lucide-react";
import { ConnectionStatus } from "@/components/mission-control/ConnectionStatus";
import { SwissMap } from "@/components/mission-control";
import { ProximityWarning } from "@/components/airspace/ProximityWarning";

// ─── Types & Data ───────────────────────────────────────────────────────────

type MenuSection =
  | "mission-control"
  | "upcoming"
  | "report"
  | "airspace"
  | "add-startpoint"
  | "regulations"
  | "drone-status"
  | "incidents";

const MENU_ITEMS: {
  id: MenuSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}[] = [
  { id: "mission-control", label: "Mission Control", icon: Compass },
  { id: "upcoming", label: "Bevorstehende Missionen", icon: Calendar },
  { id: "report", label: "Missionsbericht", icon: ClipboardList },
  { id: "airspace", label: "Airspace", icon: Globe },
  { id: "add-startpoint", label: "Startpunkt hinzufügen", icon: MapPinPlus },
  { id: "regulations", label: "Bewilligungen & SORA", icon: ShieldCheck },
  { id: "drone-status", label: "Drohnen-Status", icon: Wrench },
  { id: "incidents", label: "Vorfälle & Safety", icon: AlertTriangle },
];

const FLIGHT_STATUS_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  scheduled: { label: "Geplant", color: "bg-gray-100 text-gray-500" },
  pre_flight_check: {
    label: "Vorflugcheck",
    color: "bg-amber-100 text-amber-700",
  },
  in_air: { label: "In der Luft", color: "bg-green-100 text-green-700" },
  landed: { label: "Gelandet", color: "bg-blue-100 text-blue-700" },
  completed: {
    label: "Abgeschlossen",
    color: "bg-emerald-100 text-emerald-700",
  },
  aborted: { label: "Abgebrochen", color: "bg-red-100 text-red-700" },
};

const SAFETY_CHECKLIST = [
  "Fallschirm-Selbsttest bestanden (Deployment-Check)",
  "Notlandeplatz identifiziert und kommuniziert",
  "Emergency-Descent-Briefing abgeschlossen",
  "Akku vollständig geladen (Modul A + B geprüft)",
  "Akkugesundheit beider Batteriemodule verifiziert (SoH >= 80%)",
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

// ─── Sidebar ────────────────────────────────────────────────────────────────

function PilotSidebar({
  activeSection,
  onNavigate,
  activeMissionCount,
}: {
  activeSection: MenuSection;
  onNavigate: (section: MenuSection) => void;
  activeMissionCount: number;
}) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg tracking-tight leading-none">
              AIRBASE
            </div>
            <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em]">
              Piloten-Cockpit
            </div>
          </div>
        </div>
      </div>

      {/* Pilot Info */}
      <div className="px-5 pb-4">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-3 border border-red-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Plane className="w-4 h-4 text-red-600 -rotate-45" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Hans Müller</p>
              <p className="text-[10px] text-gray-500">
                PIC · CH-RPL-2024-0142
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-2">
          Flugbetrieb
        </p>
        {MENU_ITEMS.slice(0, 3).map((item) => {
          const isActive = activeSection === item.id;
          const showBadge =
            item.id === "mission-control" && activeMissionCount > 0;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-red-50 text-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon
                className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {showBadge && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
            </button>
          );
        })}

        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-5">
          Luftraum & Navigation
        </p>
        {MENU_ITEMS.slice(3, 5).map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-red-50 text-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon
                className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`}
              />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-5">
          Safety & Wartung
        </p>
        {MENU_ITEMS.slice(5).map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-red-50 text-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon
                className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`}
              />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Drone card footer */}
      <div className="px-4 pb-6">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Plane className="w-4 h-4 text-red-500 -rotate-45" />
            <span className="text-[10px] font-bold text-gray-600">
              DJI FlyCart 100
            </span>
          </div>
          <p className="text-[10px] text-gray-400">
            100 kg Nutzlast · 12 km Reichweite
          </p>
        </div>
      </div>
    </aside>
  );
}

// ─── Top Bar ────────────────────────────────────────────────────────────────

function PilotTopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <p className="text-[10px] text-gray-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <ConnectionStatus />
        <div className="hidden md:flex items-center gap-1 bg-gray-100/80 rounded-full px-3 py-1.5 w-56">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Mission suchen..."
            className="bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none w-full ml-1.5"
          />
        </div>
        <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <Plane className="w-4 h-4 text-red-600 -rotate-45" />
        </div>
      </div>
    </div>
  );
}

// ─── Section: Mission Control ──────────────────────────────────────────────

function MissionControlSection({ flights }: { flights: any[] }) {
  const activeFlight =
    flights.find((f: any) => f.status === "in_air") ??
    flights.find((f: any) => f.status === "pre_flight_check") ??
    null;

  const booking = activeFlight?.booking;
  const statusCfg = activeFlight
    ? FLIGHT_STATUS_LABELS[activeFlight.status] ??
      FLIGHT_STATUS_LABELS.scheduled
    : null;

  const demoMessages = [
    {
      sender: "customer",
      name: "Alpine Logistics AG",
      time: "09:12",
      text: "Guten Tag! Die Ware ist am Abholort bereitgestellt. Können Sie bestätigen, wann die Drohne abhebt?",
    },
    {
      sender: "pilot",
      name: "Sie",
      time: "09:14",
      text: "Bestätigt. Pre-Flight Check läuft. Voraussichtlicher Start in 5 Minuten.",
    },
    {
      sender: "customer",
      name: "Alpine Logistics AG",
      time: "09:15",
      text: "Perfekt, danke! Wir sind bereit für die Entgegennahme.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mission Control</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Aktuelle Mission mit Live-Telemetrie
          </p>
        </div>
        {activeFlight && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-bold text-red-600">LIVE</span>
          </div>
        )}
      </div>

      {!activeFlight ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Compass className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            Keine aktive Mission
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Sobald ein Flug aktiv ist, sehen Sie hier alle Live-Daten und
            Telemetrie.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Live Status Banner */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
                <span className="font-bold text-lg">AKTIVE MISSION</span>
              </div>
              <div className="flex items-center gap-2">
                {statusCfg && (
                  <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                    {statusCfg.label}
                  </span>
                )}
                <span className="font-mono text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
                  {booking?.identifier}
                </span>
              </div>
            </div>
            <p className="text-white/80 text-sm">
              {booking?.payloadDescription}
            </p>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "Position",
                value: "46.6863°N",
                icon: MapPin,
                color: "text-blue-600",
                bg: "bg-blue-50 border-blue-100",
              },
              {
                label: "Höhe AGL",
                value: "120 m",
                icon: Navigation,
                color: "text-indigo-600",
                bg: "bg-indigo-50 border-indigo-100",
              },
              {
                label: "Geschwindigkeit",
                value: "75 km/h",
                icon: Gauge,
                color: "text-purple-600",
                bg: "bg-purple-50 border-purple-100",
              },
              {
                label: "Batterie",
                value: "92%",
                icon: Battery,
                color: "text-green-600",
                bg: "bg-green-50 border-green-100",
              },
              {
                label: "ETA",
                value: "12 Min",
                icon: Clock,
                color: "text-amber-600",
                bg: "bg-amber-50 border-amber-100",
              },
              {
                label: "C2 Link",
                value: "OK",
                icon: Signal,
                color: "text-emerald-600",
                bg: "bg-emerald-50 border-emerald-100",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`${item.bg} border rounded-xl p-3 text-center`}
              >
                <item.icon
                  className={`w-4 h-4 ${item.color} mx-auto mb-1.5`}
                />
                <p className={`text-sm font-bold ${item.color}`}>
                  {item.value}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Goods & Route Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Güter & Route
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">
                  Abflugort
                </p>
                <p className="text-xs text-gray-700 font-medium">
                  {booking?.pickupAddress}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="w-8 h-px bg-gray-300" />
                <Plane className="w-5 h-5 text-red-500 -rotate-12" />
                <div className="w-8 h-px bg-gray-300" />
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">
                  Lieferung
                </p>
                <p className="text-xs text-gray-700 font-medium">
                  {booking?.deliveryAddress}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                {
                  label: "Nutzlast",
                  value: `${booking?.payloadWeightKg} kg`,
                },
                {
                  label: "Distanz",
                  value: `${booking?.routeDistanceKm} km`,
                },
                { label: "Drohne", value: booking?.droneName },
                {
                  label: "Abholung?",
                  value: "Nein — vor Ort bereit",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-gray-50 rounded-lg p-2.5 border border-gray-100"
                >
                  <p className="text-[10px] text-gray-400">{item.label}</p>
                  <p className="text-xs font-semibold text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SORA & Airspace Rules */}
          {activeFlight.soraCategory && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                Regeln für diesen Flug
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-xs font-bold text-blue-700">
                    {activeFlight.soraCategory}
                  </span>
                  <span className="text-xs text-blue-600">
                    — Spezifische Kategorie
                  </span>
                </div>
                {[
                  "VLOS oder erweiterter VLOS mit Beobachter",
                  "Max. Höhe 120m AGL",
                  "C2 Link-Redundanz sicherstellen",
                  "Notlandeverfahren aktivieren",
                ].map((rule, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Data */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Kundendaten
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400">Kunde</p>
                <p className="text-xs font-semibold text-gray-900">
                  Alpine Logistics AG
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400">Kontakt</p>
                <p className="text-xs font-semibold text-gray-900">
                  +41 33 123 45 67
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400">Auftrag</p>
                <p className="text-xs font-semibold text-gray-900">
                  CHF {booking?.totalCHF}
                </p>
              </div>
            </div>
          </div>

          {/* Live Chat with Customer */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Live Chat — Alpine Logistics AG
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-[10px] text-green-600 font-semibold">
                      Online — {booking?.identifier}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3" style={{ maxHeight: 200, overflowY: "auto" }}>
              {demoMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "pilot" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === "pilot"
                        ? "bg-red-500 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${msg.sender === "pilot" ? "text-red-200" : "text-gray-400"}`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Nachricht an Kunden..."
                  className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                />
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Suggested Departure Point */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              Vorgeschlagener Abflugort
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm font-semibold text-gray-900">
                {booking?.pickupAddress}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Koordinaten: {booking?.pickupLat}°N, {booking?.pickupLng}°E
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Genehmigter Startpunkt · Letzte Nutzung: Heute
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Upcoming Missions (Calendar) ─────────────────────────────────

function UpcomingMissionsSection({ flights }: { flights: any[] }) {
  const upcoming = [...flights]
    .filter(
      (f: any) =>
        f.status === "scheduled" ||
        f.status === "pre_flight_check"
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledDeparture).getTime() -
        new Date(b.scheduledDeparture).getTime()
    );

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Bevorstehende Missionen
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {upcoming.length} geplante Flüge in den nächsten Tagen
          </p>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Kalender — Nächste 7 Tage
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const dayFlights = flights.filter((f: any) => {
              if (!f.scheduledDeparture) return false;
              const fd = new Date(f.scheduledDeparture);
              return (
                fd.toDateString() === day.toDateString() &&
                f.status !== "completed" &&
                f.status !== "aborted"
              );
            });
            const isToday = day.toDateString() === today.toDateString();
            return (
              <div
                key={i}
                className={`text-center rounded-xl p-3 border transition-all ${
                  isToday
                    ? "bg-red-50 border-red-200"
                    : dayFlights.length > 0
                      ? "bg-gray-50 border-gray-200"
                      : "bg-white border-gray-100"
                }`}
              >
                <p className="text-[10px] text-gray-400 font-semibold uppercase">
                  {format(day, "EEE", { locale: de })}
                </p>
                <p
                  className={`text-lg font-bold mt-0.5 ${isToday ? "text-red-600" : "text-gray-900"}`}
                >
                  {format(day, "d")}
                </p>
                {dayFlights.length > 0 && (
                  <div className="mt-1 flex justify-center gap-0.5">
                    {dayFlights.map((_, fi) => (
                      <span
                        key={fi}
                        className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-red-500" : "bg-gray-400"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Plan */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Tagesplan — {format(today, "d. MMMM yyyy", { locale: de })}
        </h3>
        {upcoming.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Keine Flüge für heute geplant
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((flight: any) => {
              const b = flight.booking;
              const sCfg =
                FLIGHT_STATUS_LABELS[flight.status] ??
                FLIGHT_STATUS_LABELS.scheduled;
              return (
                <div
                  key={flight.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-sm font-bold text-gray-900">
                          {b?.identifier}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${sCfg.color}`}
                        >
                          {sCfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {b?.payloadDescription}
                      </p>
                    </div>
                    {flight.scheduledDeparture && (
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {format(
                            new Date(flight.scheduledDeparture),
                            "HH:mm",
                            { locale: de }
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {format(
                            new Date(flight.scheduledDeparture),
                            "d. MMM",
                            { locale: de }
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">
                        Von
                      </p>
                      <p className="text-xs text-gray-700 font-medium truncate">
                        {b?.pickupAddress}
                      </p>
                    </div>
                    <Plane className="w-4 h-4 text-red-500 -rotate-12 flex-shrink-0" />
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">
                        Nach
                      </p>
                      <p className="text-xs text-gray-700 font-medium truncate">
                        {b?.deliveryAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {b?.payloadWeightKg} kg
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {b?.routeDistanceKm} km
                    </span>
                    {flight.soraCategory && (
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {flight.soraCategory}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section: Mission Report ───────────────────────────────────────────────

function MissionReportSection({
  flights,
  forms,
  getForm,
  updateForm,
  toggleChecklist,
  submitMutation,
}: {
  flights: any[];
  forms: Record<string, PostFlightForm>;
  getForm: (id: string) => PostFlightForm;
  updateForm: (id: string, patch: Partial<PostFlightForm>) => void;
  toggleChecklist: (id: string, idx: number) => void;
  submitMutation: any;
}) {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const reportableFlights = flights.filter(
    (f: any) =>
      f.status !== "completed" &&
      f.status !== "aborted" &&
      f.status !== "scheduled"
  );
  const completedFlights = flights.filter(
    (f: any) => f.status === "completed"
  );

  const selectedFlight =
    flights.find((f: any) => f.id === selectedFlightId) ?? null;
  const form = selectedFlight ? getForm(selectedFlight.id) : null;
  const allChecked = form ? form.checklistDone.every(Boolean) : false;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Missionsbericht</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Missionen abschliessen, Spesen erfassen, Vorfälle melden
        </p>
      </div>

      {/* Reportable Flights */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Offene Berichte
        </h3>
        {reportableFlights.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Keine offenen Berichte
          </p>
        ) : (
          <div className="space-y-2">
            {reportableFlights.map((flight: any) => {
              const b = flight.booking;
              const isSelected = selectedFlightId === flight.id;
              return (
                <button
                  key={flight.id}
                  onClick={() =>
                    setSelectedFlightId(isSelected ? null : flight.id)
                  }
                  className={`w-full text-left rounded-xl p-4 border transition-all ${
                    isSelected
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-900">
                        {b?.identifier}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {b?.payloadDescription}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${isSelected ? "rotate-90" : ""}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Form */}
      {selectedFlight && form && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-red-500" />
            Post-Flight Report — {selectedFlight.booking?.identifier}
          </h3>

          {/* Safety Checklist */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Sicherheits-Checkliste ({form.checklistDone.filter(Boolean).length}/{SAFETY_CHECKLIST.length})
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {SAFETY_CHECKLIST.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-2.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={form.checklistDone[idx]}
                    onChange={() =>
                      toggleChecklist(selectedFlight.id, idx)
                    }
                    className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-red-500 focus:ring-red-500/40"
                  />
                  <span
                    className={`text-xs transition-colors ${form.checklistDone[idx] ? "text-emerald-600" : "text-gray-500 group-hover:text-gray-700"}`}
                  >
                    {item}
                  </span>
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

          {/* Numeric Fields */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Gewicht (kg)",
                key: "actualWeightKg",
                placeholder: "z.B. 24.5",
              },
              {
                label: "Flugdauer (Min)",
                key: "flightDurationMinutes",
                placeholder: "z.B. 45",
              },
              {
                label: "Verbrauch (kWh)",
                key: "fuelConsumptionKwh",
                placeholder: "z.B. 8.2",
              },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">
                  {field.label}
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
                  placeholder={field.placeholder}
                  value={
                    form[field.key as keyof PostFlightForm] as string
                  }
                  onChange={(e) =>
                    updateForm(selectedFlight.id, {
                      [field.key]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>

          {/* Expenses */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">
              Spesen (CHF)
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
              placeholder="z.B. Parkgebühr 15.00, Verpflegung 22.50"
              value={form.expenses}
              onChange={(e) =>
                updateForm(selectedFlight.id, {
                  expenses: e.target.value,
                })
              }
            />
          </div>

          {/* Incident Report */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">
              Vorfall melden (optional)
            </label>
            <textarea
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 resize-none"
              placeholder="Beschreibung eines Vorfalls..."
              value={form.incidentReport}
              onChange={(e) =>
                updateForm(selectedFlight.id, {
                  incidentReport: e.target.value,
                })
              }
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">
              Notizen
            </label>
            <textarea
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 resize-none"
              placeholder="Besonderheiten..."
              value={form.notes}
              onChange={(e) =>
                updateForm(selectedFlight.id, {
                  notes: e.target.value,
                })
              }
            />
          </div>

          {/* Additional Billable Flights */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-xs font-bold text-amber-700 mb-1">
              Zusätzliche Flüge verrechnen
            </p>
            <p className="text-[10px] text-amber-600">
              Falls während dieser Mission zusätzliche Flüge nötig waren,
              erfassen Sie diese hier. Schlussprotokoll und Abschlussrechnung
              werden automatisch generiert.
            </p>
            <button className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors">
              <PlusCircle className="w-3.5 h-3.5" /> Zusatzflug erfassen
            </button>
          </div>

          {submitMutation.error && (
            <p className="text-xs text-red-500">
              {submitMutation.error.message}
            </p>
          )}

          {/* Submit */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const weight = parseFloat(form.actualWeightKg);
                const duration = parseInt(
                  form.flightDurationMinutes,
                  10
                );
                if (!allChecked || isNaN(weight) || isNaN(duration))
                  return;
                submitMutation.mutate({
                  flightId: selectedFlight.id,
                  actualWeightKg: weight,
                  flightDurationMinutes: duration,
                  notes: form.notes || undefined,
                  incidentReport: form.incidentReport || undefined,
                });
              }}
              disabled={
                !allChecked ||
                !form.actualWeightKg ||
                !form.flightDurationMinutes ||
                submitMutation.isPending
              }
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-40"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {submitMutation.isPending
                ? "Wird eingereicht..."
                : "Report einreichen + Schlussrechnung senden"}
            </button>
            <button
              onClick={() => setSelectedFlightId(null)}
              className="px-4 py-2.5 text-gray-500 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Completed Reports */}
      {completedFlights.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900">
              Abgeschlossene Berichte
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {completedFlights.map((flight: any) => {
              const b = flight.booking;
              return (
                <div
                  key={flight.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <CheckCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {b?.identifier}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {b?.payloadDescription}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Abgeschlossen
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Airspace ─────────────────────────────────────────────────────

function AirspaceSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Airspace</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Schweizer Karte mit Luftraum, Wetter und Verkehr
        </p>
      </div>

      {/* Swiss Map */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <SwissMap compact={false} showAirTraffic />
      </div>

      {/* Air Traffic */}
      <ProximityWarning />

      {/* Weather */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Wetter — Berner Oberland
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: Sun,
              label: "Sicht",
              value: "> 10 km",
              color: "text-cyan-600",
              bg: "bg-cyan-50 border-cyan-100",
            },
            {
              icon: Wind,
              label: "Wind",
              value: "12 km/h NW",
              color: "text-green-600",
              bg: "bg-green-50 border-green-100",
            },
            {
              icon: Thermometer,
              label: "Temperatur",
              value: "14°C",
              color: "text-gray-600",
              bg: "bg-gray-50 border-gray-200",
            },
            {
              icon: CloudRain,
              label: "Niederschlag",
              value: "0%",
              color: "text-gray-600",
              bg: "bg-gray-50 border-gray-200",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`${item.bg} border rounded-xl p-3`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className={`text-[10px] font-bold ${item.color}`}>
                  {item.label}
                </span>
              </div>
              <p className={`text-sm font-bold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Forecast */}
        <div className="mt-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Prognose (nächste 6h)
          </p>
          <div className="grid grid-cols-6 gap-2">
            {[
              { time: "10:00", icon: Sun, temp: "14°C", wind: "12" },
              { time: "12:00", icon: Sun, temp: "17°C", wind: "15" },
              { time: "14:00", icon: CloudRain, temp: "16°C", wind: "18" },
              { time: "16:00", icon: CloudRain, temp: "14°C", wind: "22" },
              { time: "18:00", icon: Wind, temp: "12°C", wind: "25" },
              { time: "20:00", icon: Wind, temp: "10°C", wind: "20" },
            ].map((item) => (
              <div
                key={item.time}
                className="text-center bg-gray-50 rounded-lg p-2 border border-gray-100"
              >
                <p className="text-[10px] text-gray-400 font-semibold">
                  {item.time}
                </p>
                <item.icon className="w-4 h-4 text-gray-500 mx-auto my-1" />
                <p className="text-xs font-bold text-gray-900">
                  {item.temp}
                </p>
                <p className="text-[10px] text-gray-400">
                  {item.wind} km/h
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Airspace Zones */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Luftraum-Zonen
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-xs font-semibold text-emerald-700">
              CTR Interlaken
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              FREI
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-xs font-semibold text-amber-700">
              TMA Bern Lower
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              EINGESCHRÄNKT
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-red-50 rounded-xl border border-red-100">
            <span className="text-xs font-semibold text-red-700">
              R-Area Militär Thun
            </span>
            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
              GESPERRT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Add Start Point ──────────────────────────────────────────────

function AddStartPointSection() {
  const existingPoints = [
    {
      name: "AIRBASE Hub Wilderswil",
      lat: "46.6575",
      lng: "7.8680",
      owner: "Airbase AG",
      approved: true,
    },
    {
      name: "AIRBASE Hub Interlaken",
      lat: "46.6863",
      lng: "7.8632",
      owner: "Airbase AG",
      approved: true,
    },
    {
      name: "AIRBASE Hub Lauterbrunnen",
      lat: "46.5935",
      lng: "7.9091",
      owner: "Gemeinde Lauterbrunnen",
      approved: true,
    },
    {
      name: "AIRBASE Hub Grindelwald",
      lat: "46.6243",
      lng: "8.0414",
      owner: "Gemeinde Grindelwald",
      approved: true,
    },
    {
      name: "AIRBASE Hub Stechelberg",
      lat: "46.5667",
      lng: "7.8967",
      owner: "Privat — P. Keller",
      approved: true,
    },
    {
      name: "Agrarhub Brienz",
      lat: "46.7547",
      lng: "8.0475",
      owner: "Agroswiss",
      approved: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Startpunkt hinzufügen
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Neue Startpunkte für Missionen zur Datenbank hinzufügen
        </p>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
        <p className="text-xs font-bold text-blue-700 mb-1">
          Hinweis zum Verfahren
        </p>
        <p className="text-xs text-blue-600 leading-relaxed">
          Wenn bei einer Mission ein neuer Startpunkt entdeckt wird, kann
          dieser hier erfasst werden. Das Einverständnis des
          Grundstückseigentümers ist erforderlich. Die Datenbank wird stetig
          mit genehmigten Startpunkten erweitert.
        </p>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-900">
          Neuen Startpunkt erfassen
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">
              Bezeichnung
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
              placeholder="z.B. Landeplatz Mürren Nord"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">
              Eigentümer
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
              placeholder="Name des Grundstückseigentümers"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">
              Breitengrad (Lat)
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
              placeholder="z.B. 46.5587"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">
              Längengrad (Lng)
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
              placeholder="z.B. 7.8355"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-1">
            Notizen / Besonderheiten
          </label>
          <textarea
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 resize-none"
            placeholder="Zufahrt, Hindernisse, Kontaktdaten..."
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-red-500 focus:ring-red-500/40"
          />
          <span className="text-xs text-gray-600">
            Eigentümer-Einverständnis liegt vor (mündlich/schriftlich)
          </span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-colors">
          <MapPinPlus className="w-4 h-4" /> Startpunkt einreichen
        </button>
      </div>

      {/* Existing points */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">
            Genehmigte Startpunkte ({existingPoints.filter((p) => p.approved).length})
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {existingPoints.map((point, i) => (
            <div
              key={i}
              className="px-5 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${point.approved ? "bg-emerald-50" : "bg-amber-50"}`}
                >
                  <MapPin
                    className={`w-4 h-4 ${point.approved ? "text-emerald-500" : "text-amber-500"}`}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    {point.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {point.lat}°N, {point.lng}°E · {point.owner}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  point.approved
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {point.approved ? "Genehmigt" : "Ausstehend"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Regulations & SORA ───────────────────────────────────────────

function RegulationsSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Bewilligungen & SORA
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Regulatorische Vorgaben und Bewilligungsstrategie
        </p>
      </div>

      {/* SORA Categories */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          SORA SAIL Kategorien
        </h3>
        <div className="space-y-3">
          {[
            {
              sail: "SAIL I",
              desc: "Sichtflug (VLOS), geringes Risiko",
              color: "bg-green-50 border-green-100 text-green-700",
              rules: [
                "Max. Höhe 120m AGL",
                "Sichtflug einhalten",
                "Abstand zu Menschen halten",
              ],
            },
            {
              sail: "SAIL II",
              desc: "Erweiterter VLOS, mittleres Risiko",
              color: "bg-blue-50 border-blue-100 text-blue-700",
              rules: [
                "VLOS oder erweiterter VLOS mit Beobachter",
                "Risikobewertung durchführen",
                "Notfallverfahren bereithalten",
              ],
            },
            {
              sail: "SAIL III",
              desc: "BVLOS möglich, erhöhtes Risiko",
              color: "bg-amber-50 border-amber-100 text-amber-700",
              rules: [
                "BVLOS mit Genehmigung",
                "C2 Link-Redundanz sicherstellen",
                "Notlandeverfahren aktivieren",
              ],
            },
            {
              sail: "SAIL IV",
              desc: "Höchstes Risiko, Safety Manager Freigabe",
              color: "bg-red-50 border-red-100 text-red-700",
              rules: [
                "Safety Manager Freigabe erforderlich",
                "Vollständige SORA-Dokumentation",
                "Echtzeit-Monitoring durch Bodenstelle",
              ],
            },
          ].map((item) => (
            <div
              key={item.sail}
              className={`rounded-xl p-4 border ${item.color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold">{item.sail}</span>
                <span className="text-[10px]">— {item.desc}</span>
              </div>
              <ul className="space-y-1">
                {item.rules.map((rule, i) => (
                  <li
                    key={i}
                    className="text-xs flex items-start gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Permits */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Aktive Bewilligungen
        </h3>
        <div className="space-y-2">
          {[
            {
              authority: "BAZL / FOCA",
              type: "LUC Betriebsbewilligung",
              status: "Aktiv",
              expiry: "31.12.2026",
              color: "bg-emerald-100 text-emerald-700",
            },
            {
              authority: "skyguide",
              type: "U-Space Registrierung",
              status: "Aktiv",
              expiry: "31.12.2026",
              color: "bg-emerald-100 text-emerald-700",
            },
            {
              authority: "Kanton Bern",
              type: "Gebietsfreigabe Berner Oberland",
              status: "Aktiv",
              expiry: "30.06.2026",
              color: "bg-emerald-100 text-emerald-700",
            },
            {
              authority: "Gemeinde Brienz",
              type: "Landwirtschaftliche Operationen",
              status: "Ausstehend",
              expiry: "—",
              color: "bg-amber-100 text-amber-700",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div>
                <p className="text-xs font-semibold text-gray-900">
                  {item.authority}
                </p>
                <p className="text-[10px] text-gray-500">{item.type}</p>
              </div>
              <div className="text-right">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.color}`}
                >
                  {item.status}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {item.expiry}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Drone Status ─────────────────────────────────────────────────

function DroneStatusSection() {
  const drones = DEMO_DRONES.filter((d) => d.isActive);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Drohnen-Status</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Flottenstatus, Verschleiss und Wartung
        </p>
      </div>

      {drones.map((d) => {
        const batteryPct =
          (d.batteryCyclesUsed / d.batteryCyclesMax) * 100;
        const propellerPct =
          (d.propellerHours / d.propellerMaxHours) * 100;
        const flightsToInspection =
          d.nextMotorInspectionFlights - d.totalFlights;

        return (
          <div
            key={d.id}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <Plane className="w-5 h-5 text-red-500 -rotate-45" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {d.model}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {d.serialNumber} ·{" "}
                    {d.batteryMode === "dual"
                      ? "Dual"
                      : "Einzel"}
                    -Batterie
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {d.totalFlights}
                </p>
                <p className="text-[10px] text-gray-400">Flüge total</p>
              </div>
            </div>

            {/* Battery */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-gray-400" />
                  DB2160 Batterie (41 Ah / 52 V)
                </span>
                <span
                  className={`text-[10px] font-bold ${d.batteryHealthPct >= 90 ? "text-emerald-600" : d.batteryHealthPct >= 80 ? "text-amber-600" : "text-red-600"}`}
                >
                  {d.batteryHealthPct}% SoH
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${batteryPct > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${batteryPct}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {d.batteryCyclesUsed} / {d.batteryCyclesMax} Zyklen
              </p>
            </div>

            {/* Propeller */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-gray-400" />
                  Propeller 62&quot; Carbon
                </span>
                <span
                  className={`text-[10px] font-bold ${propellerPct > 75 ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {Math.round(100 - propellerPct)}% Rest
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${propellerPct > 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${propellerPct}%` }}
                />
              </div>
            </div>

            {/* Motor + Specs */}
            <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-gray-400" />
                Nächste Motor-Inspektion
              </span>
              <span
                className={`text-[10px] font-bold ${flightsToInspection <= 10 ? "text-amber-600" : "text-emerald-600"}`}
              >
                {flightsToInspection > 0
                  ? `In ${flightsToInspection} Flügen`
                  : "FÄLLIG!"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Nutzlast", value: `${d.maxPayloadKg} kg` },
                { label: "Reichweite", value: `${d.maxRangeKm} km` },
                {
                  label: "Flugzeit",
                  value: `${d.batteryMode === "dual" ? "14" : "7"} min`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center bg-gray-50 rounded-lg p-2.5 border border-gray-100"
                >
                  <p className="text-[10px] text-gray-400">{item.label}</p>
                  <p className="text-xs font-bold text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Maintenance */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">
            Anstehende Wartungen
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {DEMO_MAINTENANCE.filter(
            (m) => m.status === "upcoming" || m.status === "in_progress"
          )
            .sort(
              (a, b) =>
                new Date(a.scheduledAt).getTime() -
                new Date(b.scheduledAt).getTime()
            )
            .map((m) => (
              <div key={m.id} className="px-5 py-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Wrench
                      className={`w-3.5 h-3.5 ${m.status === "in_progress" ? "text-amber-500" : "text-gray-400"}`}
                    />
                    <span className="text-xs font-bold text-gray-900">
                      {m.droneModel}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      m.status === "in_progress"
                        ? "bg-amber-100 text-amber-700"
                        : m.type === "repair"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {m.status === "in_progress"
                      ? "In Arbeit"
                      : m.type === "repair"
                        ? "Reparatur"
                        : "Geplant"}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mb-1">{m.task}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {format(new Date(m.scheduledAt), "d. MMM yyyy HH:mm", {
                      locale: de,
                    })}
                  </span>
                  <span>· ~{m.estimatedHours}h</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Incidents & Safety ───────────────────────────────────────────

function IncidentsSection() {
  const severityColor: Record<string, string> = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  };
  const statusColor: Record<string, string> = {
    resolved: "bg-emerald-100 text-emerald-700",
    under_review: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Vorfälle & Safety
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Gemeldete Vorfälle und Sicherheitsrelevante Ereignisse
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500 font-medium">Gesamt</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {DEMO_INCIDENTS.length}
          </p>
          <p className="text-[10px] text-blue-600 mt-1 font-semibold">
            Letzte 30 Tage
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 border-l-4 border-l-emerald-500">
          <p className="text-sm text-gray-500 font-medium">Gelöst</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {DEMO_INCIDENTS.filter((i) => i.status === "resolved").length}
          </p>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
            Abgeschlossen
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500 font-medium">Offen</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {
              DEMO_INCIDENTS.filter((i) => i.status === "under_review")
                .length
            }
          </p>
          <p className="text-[10px] text-amber-600 mt-1 font-semibold">
            In Prüfung
          </p>
        </div>
      </div>

      {/* Incident List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            Alle Vorfälle
          </h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {DEMO_INCIDENTS.map((incident) => (
            <div
              key={incident.id}
              className="px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {incident.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${severityColor[incident.severity] ?? "bg-gray-100 text-gray-500"}`}
                    >
                      {incident.severity.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor[incident.status] ?? "bg-gray-100 text-gray-500"}`}
                    >
                      {incident.status === "resolved"
                        ? "Gelöst"
                        : "In Prüfung"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {incident.category}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">
                  {format(new Date(incident.date), "d. MMM yyyy HH:mm", {
                    locale: de,
                  })}
                </p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {incident.description}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                <span>Pilot: {incident.pilot}</span>
                <span>Drohne: {incident.drone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section Title Map ──────────────────────────────────────────────────────

const SECTION_TITLES: Record<
  MenuSection,
  { title: string; subtitle: string }
> = {
  "mission-control": {
    title: "Mission Control",
    subtitle: "Aktuelle Mission mit Telemetrie, Güter-Details und Live Chat",
  },
  upcoming: {
    title: "Bevorstehende Missionen",
    subtitle: "Kalender und Tagesplan der geplanten Flüge",
  },
  report: {
    title: "Missionsbericht",
    subtitle: "Mission abschliessen, Spesen und Vorfälle erfassen",
  },
  airspace: {
    title: "Airspace",
    subtitle: "Schweizer Karte, Wetter, Luftraum und Verkehr",
  },
  "add-startpoint": {
    title: "Startpunkt hinzufügen",
    subtitle: "Neue Startpunkte zur Datenbank erfassen",
  },
  regulations: {
    title: "Bewilligungen & SORA",
    subtitle: "Regulatorische Vorgaben und aktive Bewilligungen",
  },
  "drone-status": {
    title: "Drohnen-Status",
    subtitle: "Flottenstatus, Verschleiss und Wartungsplan",
  },
  incidents: {
    title: "Vorfälle & Safety",
    subtitle: "Gemeldete Vorfälle und Sicherheitsereignisse",
  },
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export function PilotDashboard() {
  const [activeSection, setActiveSection] =
    useState<MenuSection>("mission-control");
  const [forms, setForms] = useState<Record<string, PostFlightForm>>({});

  const { data, isLoading, error, refetch } =
    trpc.pilot.myFlights.useQuery({ limit: 20, offset: 0 });
  const submitMutation = trpc.pilot.submitPostFlight.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  function getForm(flightId: string): PostFlightForm {
    return forms[flightId] ?? defaultForm();
  }
  function updateForm(
    flightId: string,
    patch: Partial<PostFlightForm>
  ) {
    setForms((prev) => ({
      ...prev,
      [flightId]: { ...getForm(flightId), ...patch },
    }));
  }
  function toggleChecklist(flightId: string, idx: number) {
    const form = getForm(flightId);
    const next = [...form.checklistDone];
    next[idx] = !next[idx];
    updateForm(flightId, { checklistDone: next });
  }

  const flights = data?.flights?.length ? data.flights : DEMO_FLIGHTS;
  const activeMissionCount = flights.filter(
    (f: any) => f.status === "in_air" || f.status === "pre_flight_check"
  ).length;
  const sectionMeta = SECTION_TITLES[activeSection];

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50/50">
        <PilotSidebar
          activeSection={activeSection}
          onNavigate={setActiveSection}
          activeMissionCount={0}
        />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <PilotTopBar title="Laden..." subtitle="" />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-48" />
              <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-32" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50/50">
        <PilotSidebar
          activeSection={activeSection}
          onNavigate={setActiveSection}
          activeMissionCount={0}
        />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <PilotTopBar title="Fehler" subtitle="" />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">
              {error.message}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <PilotSidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        activeMissionCount={activeMissionCount}
      />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <PilotTopBar
          title={sectionMeta.title}
          subtitle={sectionMeta.subtitle}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "mission-control" && (
            <MissionControlSection flights={flights} />
          )}
          {activeSection === "upcoming" && (
            <UpcomingMissionsSection flights={flights} />
          )}
          {activeSection === "report" && (
            <MissionReportSection
              flights={flights}
              forms={forms}
              getForm={getForm}
              updateForm={updateForm}
              toggleChecklist={toggleChecklist}
              submitMutation={submitMutation}
            />
          )}
          {activeSection === "airspace" && <AirspaceSection />}
          {activeSection === "add-startpoint" && (
            <AddStartPointSection />
          )}
          {activeSection === "regulations" && <RegulationsSection />}
          {activeSection === "drone-status" && <DroneStatusSection />}
          {activeSection === "incidents" && <IncidentsSection />}
        </main>
      </div>
    </div>
  );
}
