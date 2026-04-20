"use client";

import { useState } from "react";
import { DEMO_BOOKINGS, DEMO_INVOICES, DEMO_EMISSIONS } from "@/lib/demo-data";
import { ConnectionStatus } from "@/components/mission-control/ConnectionStatus";
import {
  CalendarClock,
  History,
  Radar,
  MessageCircle,
  Receipt,
  PlusCircle,
  Leaf,
  FileText,
  HelpCircle,
  MapPin,
  Clock,
  Package,
  Plane,
  CheckCircle2,
  Send,
  CheckCheck,
  Eye,
  Bell,
  User,
  Search,
  ChevronRight,
  Navigation,
  Battery,
  Gauge,
  Radio,
  Activity,
  Zap,
  Fuel,
  TreePine,
  ArrowUpRight,
  Download,
  Filter,
  MoreHorizontal,
  Phone,
  Send as SendIcon,
  Paperclip,
  Mic,
  Truck,
  Wheat,
  Sparkles,
  HardHat,
  Siren,
  Sun,
} from "lucide-react";

// ─── Types & Data ───────────────────────────────────────────────────────────

type MenuSection =
  | "upcoming"
  | "past"
  | "live"
  | "chat"
  | "billing"
  | "book"
  | "emissions"
  | "documents"
  | "support";

const MENU_ITEMS: { id: MenuSection; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
  { id: "upcoming", label: "Anstehende Missionen", icon: CalendarClock },
  { id: "past", label: "Vergangene Missionen", icon: History },
  { id: "live", label: "Aktueller Flug", icon: Radar },
  { id: "chat", label: "Chat mit Pilot", icon: MessageCircle },
  { id: "billing", label: "Buchhaltung", icon: Receipt },
  { id: "book", label: "Neue Buchung", icon: PlusCircle },
  { id: "emissions", label: "Emissionsbericht", icon: Leaf },
  { id: "documents", label: "Dokumente", icon: FileText },
  { id: "support", label: "Support & FAQ", icon: HelpCircle },
];

const BOOKING_STATUS: Record<string, { label: string; color: string; step: number }> = {
  draft: { label: "Entwurf", color: "bg-gray-100 text-gray-500", step: 0 },
  pending: { label: "Angefragt", color: "bg-amber-100 text-amber-700", step: 1 },
  quoted: { label: "Angebot", color: "bg-blue-100 text-blue-700", step: 2 },
  confirmed: { label: "Bestätigt", color: "bg-green-100 text-green-700", step: 3 },
  in_progress: { label: "In Zustellung", color: "bg-indigo-100 text-indigo-700", step: 4 },
  completed: { label: "Geliefert", color: "bg-emerald-100 text-emerald-700", step: 5 },
};

const STEPS = [
  { icon: Send, label: "Angefragt" },
  { icon: FileText, label: "Angebot" },
  { icon: CheckCircle2, label: "Bestätigt" },
  { icon: Plane, label: "In Zustellung" },
  { icon: CheckCheck, label: "Geliefert" },
];

const SERVICES = [
  { id: "transport", label: "Transport", desc: "Lasten bis 100 kg per Drohne", icon: Truck, color: "from-red-500 to-red-600", available: true },
  { id: "construction", label: "Bau & Vermessung", desc: "Inspektion & Materiallieferung", icon: HardHat, color: "from-amber-500 to-amber-600", available: true },
  { id: "agriculture", label: "Landwirtschaft", desc: "Präzisionslandwirtschaft & Sprühen", icon: Wheat, color: "from-green-500 to-green-600", available: false },
  { id: "cleaning", label: "Reinigung", desc: "Solar- & Fassadenreinigung", icon: Sparkles, color: "from-cyan-500 to-cyan-600", available: false },
  { id: "solar", label: "Solar & Inspektion", desc: "PV-Anlagen & Infrastruktur", icon: Sun, color: "from-orange-500 to-orange-600", available: false },
  { id: "emergency", label: "Notfall", desc: "Medizinische & Rettungseinsätze", icon: Siren, color: "from-purple-500 to-purple-600", available: false },
];

// ─── Workflow Stepper ───────────────────────────────────────────────────────

function OrderStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0.5 w-full">
      {STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
              </div>
              <span className={`text-[9px] mt-1 font-medium ${done ? "text-emerald-600" : active ? "text-red-600" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${done ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────

function CustomerSidebar({
  activeSection,
  onNavigate,
  liveMissionCount,
}: {
  activeSection: MenuSection;
  onNavigate: (section: MenuSection) => void;
  liveMissionCount: number;
}) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <img src="/airbase-logo.png" alt="airBASE" className="h-10 w-auto" />
          <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Kundenportal</div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-5 pb-4">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-3 border border-red-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Alpine Logistics AG</p>
              <p className="text-[10px] text-gray-500">Kunde seit 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-2">Meine Missionen</p>
        {MENU_ITEMS.slice(0, 4).map((item) => {
          const isActive = activeSection === item.id;
          const showBadge = item.id === "live" && liveMissionCount > 0;
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
              <item.icon className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`} />
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

        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-5">Finanzen & Services</p>
        {MENU_ITEMS.slice(4, 6).map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? "bg-red-50 text-red-700 font-semibold" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`} />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-5">Informationen</p>
        {MENU_ITEMS.slice(6).map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? "bg-red-50 text-red-700 font-semibold" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`} />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Support footer */}
      <div className="px-4 pb-6">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-600">Hilfe benötigt?</p>
          <p className="text-[10px] text-gray-400 mt-0.5">+41 33 123 45 67</p>
          <p className="text-[10px] text-gray-400">support@airbase.one</p>
        </div>
      </div>
    </aside>
  );
}

// ─── Top Bar ────────────────────────────────────────────────────────────────

function CustomerTopBar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <p className="text-[10px] text-gray-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <ConnectionStatus />
        <div className="hidden md:flex items-center gap-1 bg-gray-100/80 rounded-full px-3 py-1.5 w-64">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="Buchung suchen..." className="bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none w-full ml-1.5" />
        </div>
        <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-red-600" />
        </div>
      </div>
    </div>
  );
}

// ─── Section: Upcoming Missions ─────────────────────────────────────────────

function UpcomingMissions() {
  const upcoming = [...DEMO_BOOKINGS]
    .filter((b) => b.status === "pending" || b.status === "quoted" || b.status === "confirmed")
    .sort((a, b) => new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Anstehende Missionen</h2>
          <p className="text-sm text-gray-500 mt-0.5">{upcoming.length} geplante Aufträge</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors">
          <PlusCircle className="w-4 h-4" /> Neue Buchung
        </button>
      </div>

      {upcoming.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <CalendarClock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Keine anstehenden Missionen</p>
          <p className="text-sm text-gray-400 mt-1">Buchen Sie Ihren nächsten Drohnenflug jetzt.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((booking) => {
            const statusCfg = BOOKING_STATUS[booking.status] ?? BOOKING_STATUS.draft;
            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-gray-900">{booking.identifier}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{booking.payloadDescription}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">CHF {booking.totalCHF}</p>
                    <p className="text-[10px] text-gray-400">{new Date(booking.requestedDate).toLocaleDateString("de-CH")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Abholung</p>
                    <p className="text-xs text-gray-700 font-medium truncate">{booking.pickupAddress}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="w-6 h-px bg-gray-300" />
                    <Plane className="w-4 h-4 text-red-500 -rotate-12" />
                    <div className="w-6 h-px bg-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Lieferung</p>
                    <p className="text-xs text-gray-700 font-medium truncate">{booking.deliveryAddress}</p>
                  </div>
                </div>

                <OrderStepper currentStep={statusCfg.step} />

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{booking.payloadWeightKg} kg</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{booking.routeDistanceKm} km</span>
                  </div>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(booking.requestedDate).toLocaleDateString("de-CH")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Section: Past Missions ─────────────────────────────────────────────────

function PastMissions() {
  const past = [...DEMO_BOOKINGS]
    .filter((b) => b.status === "completed")
    .sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vergangene Missionen</h2>
          <p className="text-sm text-gray-500 mt-0.5">{past.length} abgeschlossene Aufträge</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-3.5 h-3.5" /> Exportieren
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Auftrag", "Service", "Route", "Datum", "Gewicht", "Betrag", "Status"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {past.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-5 py-3 font-mono text-xs font-bold text-gray-900">{booking.identifier}</td>
                <td className="px-5 py-3 text-xs text-gray-500">{booking.serviceType}</td>
                <td className="px-5 py-3">
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">{booking.pickupAddress.split(",")[0]} → {booking.deliveryAddress.split(",")[0]}</div>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">{new Date(booking.requestedDate).toLocaleDateString("de-CH")}</td>
                <td className="px-5 py-3 text-xs text-gray-500">{booking.payloadWeightKg} kg</td>
                <td className="px-5 py-3 text-xs font-bold text-gray-900">CHF {booking.totalCHF}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Geliefert
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {past.length === 0 && (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">Noch keine abgeschlossenen Missionen</div>
        )}
      </div>
    </div>
  );
}

// ─── Section: Live Flight Tracking ──────────────────────────────────────────

function LiveFlightTracking() {
  const liveBookings = DEMO_BOOKINGS.filter((b) => b.status === "in_progress");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Aktueller Flug</h2>
        <p className="text-sm text-gray-500 mt-0.5">Live-Tracking Ihrer aktiven Drohnenflüge</p>
      </div>

      {liveBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Radar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Keine aktiven Flüge</p>
          <p className="text-sm text-gray-400 mt-1">Sobald ein Flug aktiv ist, sehen Sie hier alle Live-Daten.</p>
        </div>
      ) : (
        liveBookings.map((booking) => (
          <div key={booking.id} className="space-y-4">
            {/* Live Status Banner */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                  </span>
                  <span className="font-bold text-lg">LIVE TRACKING</span>
                </div>
                <span className="font-mono text-sm font-bold bg-white/20 px-3 py-1 rounded-full">{booking.identifier}</span>
              </div>
              <p className="text-white/80 text-sm">{booking.payloadDescription}</p>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Position", value: "46.6863°N", icon: MapPin, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
                { label: "Höhe AGL", value: "120 m", icon: Navigation, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
                { label: "Geschwindigkeit", value: "75 km/h", icon: Gauge, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
                { label: "Batterie", value: "92%", icon: Battery, color: "text-green-600", bg: "bg-green-50 border-green-100" },
                { label: "ETA", value: "12 Min", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
                { label: "Distanz", value: `${booking.routeDistanceKm} km`, icon: Activity, color: "text-red-600", bg: "bg-red-50 border-red-100" },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} border rounded-xl p-3 text-center`}>
                  <item.icon className={`w-4 h-4 ${item.color} mx-auto mb-1.5`} />
                  <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Route Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Routeninformationen</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Abholung</p>
                  <p className="text-xs text-gray-700 font-medium">{booking.pickupAddress}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-8 h-px bg-gray-300" />
                  <Plane className="w-5 h-5 text-red-500 -rotate-12" />
                  <div className="w-8 h-px bg-gray-300" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Lieferung</p>
                  <p className="text-xs text-gray-700 font-medium">{booking.deliveryAddress}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                  <p className="text-[10px] text-gray-400">Pilot</p>
                  <p className="text-xs font-semibold text-gray-900">{booking.pilotName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                  <p className="text-[10px] text-gray-400">Drohne</p>
                  <p className="text-xs font-semibold text-gray-900">{booking.droneName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                  <p className="text-[10px] text-gray-400">Nutzlast</p>
                  <p className="text-xs font-semibold text-gray-900">{booking.payloadWeightKg} kg</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                  <p className="text-[10px] text-gray-400">Distanz</p>
                  <p className="text-xs font-semibold text-gray-900">{booking.routeDistanceKm} km</p>
                </div>
              </div>

              <div className="mt-4">
                <OrderStepper currentStep={4} />
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-red-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-sm font-semibold text-gray-600">Live-Karte</p>
                  <p className="text-xs text-gray-400">Echtzeit-Position Ihrer Drohne</p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Section: Chat with Pilot ───────────────────────────────────────────────

function PilotChat() {
  const liveBooking = DEMO_BOOKINGS.find((b) => b.status === "in_progress");

  const demoMessages = [
    { sender: "pilot", name: liveBooking?.pilotName ?? "Pilot", time: "14:32", text: "Guten Tag! Ich bin auf dem Weg zum Abholort. Voraussichtliche Ankunft in 5 Minuten." },
    { sender: "customer", name: "Sie", time: "14:33", text: "Danke für die Info. Die Ware steht bereit." },
    { sender: "pilot", name: liveBooking?.pilotName ?? "Pilot", time: "14:35", text: "Perfekt. Ich melde mich sobald die Drohne geladen ist und abhebt." },
    { sender: "pilot", name: liveBooking?.pilotName ?? "Pilot", time: "14:42", text: "Drohne ist beladen und gestartet. Flugzeit ca. 12 Minuten. Sie können den Flug unter 'Aktueller Flug' live verfolgen." },
    { sender: "customer", name: "Sie", time: "14:43", text: "Super, danke! Ich sehe es im Live-Tracking." },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Chat mit Pilot</h2>
        <p className="text-sm text-gray-500 mt-0.5">Direkte Kommunikation während des Einsatzes</p>
      </div>

      {!liveBooking ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Kein aktiver Einsatz</p>
          <p className="text-sm text-gray-400 mt-1">Der Chat ist verfügbar sobald ein Flug aktiv ist.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
          {/* Chat header */}
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{liveBooking.pilotName}</p>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-[10px] text-green-600 font-semibold">Online — {liveBooking.identifier}</span>
                </div>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {demoMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === "customer"
                    ? "bg-red-500 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === "customer" ? "text-red-200" : "text-gray-400"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600"><Paperclip className="w-4 h-4" /></button>
              <input type="text" placeholder="Nachricht schreiben..." className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
              <button className="p-2 text-gray-400 hover:text-gray-600"><Mic className="w-4 h-4" /></button>
              <button className="w-9 h-9 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Billing ───────────────────────────────────────────────────────

function BillingSection() {
  const invoiceStatusLabel: Record<string, { label: string; color: string }> = {
    paid: { label: "Bezahlt", color: "bg-emerald-100 text-emerald-700" },
    pending: { label: "Offen", color: "bg-amber-100 text-amber-700" },
    draft: { label: "Entwurf", color: "bg-gray-100 text-gray-500" },
    overdue: { label: "Überfällig", color: "bg-red-100 text-red-700" },
  };

  const totalPaid = DEMO_INVOICES.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
  const totalOpen = DEMO_INVOICES.filter((i) => i.status === "pending" || i.status === "overdue").reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Buchhaltung</h2>
        <p className="text-sm text-gray-500 mt-0.5">Rechnungen, Zahlungen und Kostenübersicht</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 border-l-4 border-l-emerald-500">
          <p className="text-sm text-gray-500 font-medium">Bezahlt</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">CHF {totalPaid.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">{DEMO_INVOICES.filter((i) => i.status === "paid").length} Rechnungen</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500 font-medium">Offen</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">CHF {totalOpen.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-amber-600 mt-1 font-semibold">{DEMO_INVOICES.filter((i) => i.status === "pending" || i.status === "overdue").length} Rechnungen</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500 font-medium">Gesamt</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">CHF {(totalPaid + totalOpen).toLocaleString("de-CH", { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-blue-600 mt-1 font-semibold">{DEMO_INVOICES.length} Rechnungen total</p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Alle Rechnungen</h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="w-3.5 h-3.5" /> PDF Export
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Rechnung", "Datum", "Fällig", "Betrag", "Status", ""].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DEMO_INVOICES.map((inv) => {
              const status = invoiceStatusLabel[inv.status] ?? invoiceStatusLabel.draft;
              return (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-gray-900">{inv.identifier}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{new Date(inv.issuedAt).toLocaleDateString("de-CH")}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{new Date(inv.dueAt).toLocaleDateString("de-CH")}</td>
                  <td className="px-5 py-3 text-xs font-bold text-gray-900">CHF {inv.amount.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.color}`}>{status.label}</span>
                  </td>
                  <td className="px-5 py-3">
                    <button className="text-gray-400 hover:text-gray-600"><Download className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section: New Booking ───────────────────────────────────────────────────

function NewBookingSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Neue Buchung</h2>
        <p className="text-sm text-gray-500 mt-0.5">Wählen Sie einen Service und erhalten Sie sofort eine Offerte</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            className={`group relative text-left p-6 rounded-2xl border-2 transition-all duration-300 bg-white ${
              service.available
                ? "border-gray-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer hover:border-red-200"
                : "border-gray-100 opacity-60 cursor-not-allowed"
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <service.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">{service.label}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{service.desc}</p>
            {!service.available && (
              <span className="absolute top-4 right-4 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">COMING SOON</span>
            )}
            {service.available && (
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Jetzt buchen <ChevronRight className="w-4 h-4" />
              </div>
            )}
            {/* Coming Soon hover tooltip */}
            {!service.available && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" style={{ background: "rgba(15,23,42,0.08)" }}>
                <div className="rounded-lg px-4 py-2 text-sm font-bold text-white shadow-lg" style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)" }}>
                  Coming Soon
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Emissions Report ──────────────────────────────────────────────

function EmissionsReport() {
  const data = DEMO_EMISSIONS;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Emissionsbericht</h2>
        <p className="text-sm text-gray-500 mt-0.5">Ihr ökologischer Fussabdruck mit AIRBASE</p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="w-6 h-6" />
          <h3 className="text-lg font-bold">Swiss Green Flight — Ihr Beitrag</h3>
        </div>
        <p className="text-white/80 text-sm mb-6">Durch die Nutzung von AIRBASE-Drohnen statt konventioneller Transportmittel haben Sie aktiv zur Reduktion von CO2-Emissionen beigetragen.</p>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Leaf, label: "CO2 gespart", value: `${data.totalKgCO2Saved} kg` },
            { icon: Zap, label: "Elektrisch", value: `${data.electricKwh} kWh` },
            { icon: Fuel, label: "Diesel ersetzt", value: `${data.equivalentDieselLiters} L` },
            { icon: TreePine, label: "Bäume-Äquivalent", value: `${data.treesEquivalent}` },
          ].map((item) => (
            <div key={item.label} className="bg-white/15 rounded-xl p-4 text-center backdrop-blur-sm">
              <item.icon className="w-5 h-5 text-white mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-[10px] text-white/70 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Vergleich zu konventionellem Transport</h3>
        <div className="space-y-3">
          {[
            { label: "CO2-Einsparung vs. LKW", value: "100%", pct: 100, color: "bg-emerald-500" },
            { label: "Lärm-Reduktion vs. Helikopter", value: "85%", pct: 85, color: "bg-blue-500" },
            { label: "Zeitersparnis vs. Bodenweg", value: "70%", pct: 70, color: "bg-purple-500" },
            { label: "Kostenersparnis vs. Helikopter", value: "60%", pct: 60, color: "bg-amber-500" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{item.label}</span>
                <span className="text-xs font-bold text-gray-900">{item.value}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
          <Download className="w-4 h-4" /> Bericht als PDF herunterladen
        </button>
      </div>
    </div>
  );
}

// ─── Section: Documents ─────────────────────────────────────────────────────

function DocumentsSection() {
  const documents = [
    { name: "Flugbericht — AB-2024-001", type: "PDF", date: "15.04.2026", size: "1.2 MB", category: "Flugberichte" },
    { name: "Flugbericht — AB-2024-002", type: "PDF", date: "14.04.2026", size: "0.9 MB", category: "Flugberichte" },
    { name: "BAZL Genehmigung — Berner Oberland", type: "PDF", date: "01.03.2026", size: "2.4 MB", category: "Genehmigungen" },
    { name: "Versicherungsnachweis 2026", type: "PDF", date: "01.01.2026", size: "0.5 MB", category: "Versicherung" },
    { name: "AGB — Drohnenlogistik Services", type: "PDF", date: "15.12.2025", size: "0.3 MB", category: "Vertrag" },
    { name: "Sicherheitsdatenblatt — Gefahrgut", type: "PDF", date: "10.12.2025", size: "1.8 MB", category: "Sicherheit" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dokumente</h2>
        <p className="text-sm text-gray-500 mt-0.5">Genehmigungen, Flugberichte und Vertragsunterlagen</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {documents.map((doc, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                  <p className="text-[10px] text-gray-400">{doc.category} · {doc.size} · {doc.date}</p>
                </div>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Support ───────────────────────────────────────────────────────

function SupportSection() {
  const faqs = [
    { q: "Wie schwer darf meine Ladung maximal sein?", a: "Die DJI FlyCart 100 kann bis zu 100 kg Nutzlast transportieren (Einzelbatterie, 6 km Reichweite) oder bis 85 kg mit Doppelbatterie (12 km Reichweite)." },
    { q: "Wie lange dauert ein typischer Flug?", a: "Die Flugzeit beträgt je nach Ladung und Distanz zwischen 7-14 Minuten. Die genaue Dauer sehen Sie bei der Buchung." },
    { q: "Was passiert bei schlechtem Wetter?", a: "Unsere Safety-Abteilung prüft die Wetterbedingungen vor jedem Flug. Bei ungeeigneten Bedingungen wird der Flug verschoben. Sie werden sofort benachrichtigt." },
    { q: "Kann ich den Flug in Echtzeit verfolgen?", a: "Ja! Unter 'Aktueller Flug' sehen Sie die Live-Position, Höhe, Geschwindigkeit und weitere Telemetrie-Daten Ihrer Drohne." },
    { q: "Wie kann ich eine Rechnung reklamieren?", a: "Kontaktieren Sie uns unter support@airbase.one oder +41 33 123 45 67. Wir kümmern uns innert 24 Stunden um Ihr Anliegen." },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Support & FAQ</h2>
        <p className="text-sm text-gray-500 mt-0.5">Häufig gestellte Fragen und Kontaktmöglichkeiten</p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <Phone className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-900">Telefon</p>
          <p className="text-xs text-gray-500 mt-1">+41 33 123 45 67</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Mo-Fr 08:00-18:00</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <SendIcon className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-900">E-Mail</p>
          <p className="text-xs text-gray-500 mt-1">support@airbase.one</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Antwort innert 24h</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <MessageCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-900">Live Chat</p>
          <p className="text-xs text-gray-500 mt-1">Direkt im Dashboard</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Während Ihres Fluges</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Häufig gestellte Fragen</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {faqs.map((faq, i) => (
            <details key={i} className="group">
              <summary className="px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-5 pb-3 text-sm text-gray-500 leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section Title Map ──────────────────────────────────────────────────────

const SECTION_TITLES: Record<MenuSection, { title: string; subtitle: string }> = {
  upcoming: { title: "Anstehende Missionen", subtitle: "Ihre geplanten und bestätigten Drohnenflüge" },
  past: { title: "Vergangene Missionen", subtitle: "Historie aller abgeschlossenen Aufträge" },
  live: { title: "Aktueller Flug", subtitle: "Live-Tracking mit Echtzeit-Telemetrie" },
  chat: { title: "Chat mit Pilot", subtitle: "Direkte Kommunikation während des Einsatzes" },
  billing: { title: "Buchhaltung", subtitle: "Rechnungen, Zahlungen und Kostenübersicht" },
  book: { title: "Neue Buchung", subtitle: "Service wählen und sofort Offerte erhalten" },
  emissions: { title: "Emissionsbericht", subtitle: "Ihr ökologischer Beitrag mit AIRBASE" },
  documents: { title: "Dokumente", subtitle: "Genehmigungen, Berichte und Verträge" },
  support: { title: "Support & FAQ", subtitle: "Hilfe und häufig gestellte Fragen" },
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export function CustomerDashboard() {
  const [activeSection, setActiveSection] = useState<MenuSection>("upcoming");

  const liveMissionCount = DEMO_BOOKINGS.filter((b) => b.status === "in_progress").length;
  const sectionMeta = SECTION_TITLES[activeSection];

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <CustomerSidebar activeSection={activeSection} onNavigate={setActiveSection} liveMissionCount={liveMissionCount} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <CustomerTopBar title={sectionMeta.title} subtitle={sectionMeta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "upcoming" && <UpcomingMissions />}
          {activeSection === "past" && <PastMissions />}
          {activeSection === "live" && <LiveFlightTracking />}
          {activeSection === "chat" && <PilotChat />}
          {activeSection === "billing" && <BillingSection />}
          {activeSection === "book" && <NewBookingSection />}
          {activeSection === "emissions" && <EmissionsReport />}
          {activeSection === "documents" && <DocumentsSection />}
          {activeSection === "support" && <SupportSection />}
        </main>
      </div>
    </div>
  );
}
