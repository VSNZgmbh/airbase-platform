"use client";

import { useState } from "react";
import Link from "next/link";
import { DEMO_BOOKINGS, DEMO_INVOICES, DEMO_EMISSIONS } from "@/lib/demo-data";
import {
  Truck,
  Wheat,
  Sparkles,
  HardHat,
  Siren,
  Sun,
  MapPin,
  Clock,
  Package,
  ArrowRight,
  ChevronRight,
  Search,
  Bell,
  User,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Send,
  FileText,
  Plane,
  CheckCheck,
  Receipt,
  Leaf,
  TreePine,
  Zap,
  Fuel,
  Eye,
} from "lucide-react";

// ─── Service Types ──────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "transport",
    label: "Transport",
    desc: "Lasten bis 100 kg per Drohne liefern",
    icon: Truck,
    color: "from-red-500 to-red-600",
    bgLight: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
    available: true,
  },
  {
    id: "agriculture",
    label: "Landwirtschaft",
    desc: "Präzisionslandwirtschaft & Sprühen",
    icon: Wheat,
    color: "from-green-500 to-green-600",
    bgLight: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200",
    available: true,
  },
  {
    id: "cleaning",
    label: "Reinigung",
    desc: "Solar- & Fassadenreinigung",
    icon: Sparkles,
    color: "from-cyan-500 to-cyan-600",
    bgLight: "bg-cyan-50",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-200",
    available: true,
  },
  {
    id: "construction",
    label: "Bau",
    desc: "Vermessung & Materiallieferung",
    icon: HardHat,
    color: "from-amber-500 to-amber-600",
    bgLight: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    available: true,
  },
  {
    id: "emergency",
    label: "Notfall",
    desc: "Medizinische & Rettungseinsätze",
    icon: Siren,
    color: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
    available: false,
  },
  {
    id: "solar",
    label: "Solar",
    desc: "Inspektion & Wartung von PV-Anlagen",
    icon: Sun,
    color: "from-orange-500 to-orange-600",
    bgLight: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
    available: true,
  },
];

// ─── Booking Status ─────────────────────────────────────────────────────────

const BOOKING_STATUS: Record<string, { label: string; color: string; step: number }> = {
  draft: { label: "Entwurf", color: "bg-gray-100 text-gray-500", step: 0 },
  pending: { label: "Angefragt", color: "bg-amber-100 text-amber-700", step: 1 },
  quoted: { label: "Angebot", color: "bg-blue-100 text-blue-700", step: 2 },
  confirmed: { label: "Bestätigt", color: "bg-green-100 text-green-700", step: 3 },
  in_progress: { label: "In Zustellung", color: "bg-indigo-100 text-indigo-700", step: 4 },
  completed: { label: "Geliefert", color: "bg-gray-100 text-gray-600", step: 5 },
};

// ─── Workflow Stepper ───────────────────────────────────────────────────────

const STEPS = [
  { icon: Send, label: "Angefragt" },
  { icon: FileText, label: "Angebot" },
  { icon: CheckCircle2, label: "Bestätigt" },
  { icon: Plane, label: "In Zustellung" },
  { icon: CheckCheck, label: "Geliefert" },
];

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
                    ? "bg-green-500 text-white"
                    : active
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <step.icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span
                className={`text-[9px] mt-1 font-medium ${
                  done ? "text-green-600" : active ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${
                  done ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Customer Top Nav ───────────────────────────────────────────────────────

function CustomerNav() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">AIRBASE</span>
            <span className="text-[10px] text-gray-400 ml-1.5 font-medium">Kundenportal</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-gray-100/80 rounded-full px-4 py-2 w-96">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buchung suchen..."
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full ml-2"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Service Card ───────────────────────────────────────────────────────────

function ServiceCard({
  service,
  onSelect,
}: {
  service: (typeof SERVICES)[0];
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={!service.available}
      className={`group relative text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
        service.available
          ? `${service.bgLight} ${service.borderColor} hover:shadow-lg hover:-translate-y-1 cursor-pointer`
          : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
      >
        <service.icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-gray-900 text-base mb-1">{service.label}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{service.desc}</p>
      {!service.available && (
        <span className="absolute top-4 right-4 text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
          BALD
        </span>
      )}
      {service.available && (
        <div className="mt-4 flex items-center gap-1 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={service.textColor}>Jetzt buchen</span>
          <ChevronRight className={`w-4 h-4 ${service.textColor}`} />
        </div>
      )}
    </button>
  );
}

// ─── Active Order Card ──────────────────────────────────────────────────────

function ActiveOrderCard({ booking }: { booking: (typeof DEMO_BOOKINGS)[0] }) {
  const statusCfg = BOOKING_STATUS[booking.status] ?? BOOKING_STATUS.draft;
  const step = statusCfg.step;
  const isLive = booking.status === "in_progress";

  return (
    <div
      className={`bg-white rounded-2xl border transition-all ${
        isLive ? "border-indigo-200 shadow-lg shadow-indigo-500/10" : "border-gray-200"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-gray-900">{booking.identifier}</span>
              {isLive && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{booking.payloadDescription}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 mb-4 bg-gray-50 rounded-xl px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Abholung</p>
            <p className="text-xs text-gray-700 font-medium truncate">{booking.pickupAddress}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-8 h-px bg-gray-300" />
            <Plane className="w-4 h-4 text-indigo-500 -rotate-12" />
            <div className="w-8 h-px bg-gray-300" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Lieferung</p>
            <p className="text-xs text-gray-700 font-medium truncate">{booking.deliveryAddress}</p>
          </div>
        </div>

        {/* Stepper */}
        <OrderStepper currentStep={step} />

        {/* Meta */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(booking.requestedDate).toLocaleDateString("de-CH")}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              {booking.payloadWeightKg} kg
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {booking.routeDistanceKm} km
            </span>
          </div>
          <span className="text-base font-bold text-gray-900">CHF {booking.totalCHF}</span>
        </div>
      </div>

      {/* Live tracking bar */}
      {isLive && (
        <div className="px-5 pb-4">
          <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-700">Live-Tracking aktiv</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-600">
              <span>Pilot: {booking.pilotName}</span>
              <span className="text-indigo-300">|</span>
              <span>{booking.droneName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Emissions Summary (compact) ────────────────────────────────────────────

function EmissionsSummary() {
  const data = DEMO_EMISSIONS;
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-green-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="w-5 h-5 text-green-600" />
        <h3 className="font-bold text-green-800">Ihr Umweltbeitrag</h3>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Leaf, label: "CO2 gespart", value: `${data.totalKgCO2Saved} kg`, color: "text-green-700" },
          { icon: Zap, label: "Elektrisch", value: `${data.electricKwh} kWh`, color: "text-blue-700" },
          { icon: Fuel, label: "Diesel ersetzt", value: `${data.equivalentDieselLiters} L`, color: "text-amber-700" },
          { icon: TreePine, label: "Bäume-Äquiv.", value: `${data.treesEquivalent}`, color: "text-emerald-700" },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1`} />
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            <p className="text-[10px] text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Invoice List (compact) ─────────────────────────────────────────────────

function RecentInvoices() {
  const invoiceStatusLabel: Record<string, { label: string; color: string }> = {
    paid: { label: "Bezahlt", color: "bg-green-100 text-green-700" },
    pending: { label: "Offen", color: "bg-amber-100 text-amber-700" },
    draft: { label: "Entwurf", color: "bg-gray-100 text-gray-500" },
    overdue: { label: "Überfällig", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Rechnungen</h3>
        <Receipt className="w-4 h-4 text-gray-400" />
      </div>
      <div className="divide-y divide-gray-100">
        {DEMO_INVOICES.slice(0, 4).map((inv) => {
          const status = invoiceStatusLabel[inv.status] ?? invoiceStatusLabel.draft;
          return (
            <div key={inv.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <span className="font-mono text-sm font-semibold text-gray-700">{inv.identifier}</span>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(inv.issuedAt).toLocaleDateString("de-CH")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.color}`}>
                  {status.label}
                </span>
                <span className="text-sm font-bold text-gray-900">CHF {inv.amount.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Customer Dashboard ─────────────────────────────────────────────────────

export function CustomerDashboard() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const sortedBookings = [...DEMO_BOOKINGS].sort(
    (a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime()
  );
  const activeBookings = sortedBookings.filter((b) => b.status === "in_progress" || b.status === "confirmed");
  const pastBookings = sortedBookings.filter((b) => b.status === "completed");
  const totalRevenue = DEMO_BOOKINGS.reduce((sum, b) => sum + parseFloat(b.totalCHF), 0);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <CustomerNav />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero: Welcome + Quick Stats */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Willkommen zurück
            </h1>
            <p className="text-gray-500 mt-1">
              Wählen Sie einen Service oder verfolgen Sie Ihre Aufträge.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{DEMO_BOOKINGS.length}</p>
              <p className="text-xs text-gray-400">Buchungen</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                CHF {Math.round(totalRevenue).toLocaleString("de-CH")}
              </p>
              <p className="text-xs text-gray-400">Gesamtvolumen</p>
            </div>
          </div>
        </div>

        {/* Step 1: Service Selection */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Welchen Service benötigen Sie?</h2>
            <Link
              href="/book"
              className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              Alle Services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={() => {
                  setSelectedService(service.id);
                  window.location.href = "/book";
                }}
              />
            ))}
          </div>
        </section>

        {/* Active Orders */}
        {activeBookings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Aktive Aufträge
                <span className="ml-2 text-sm font-normal text-gray-400">({activeBookings.length})</span>
              </h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              {activeBookings.map((booking) => (
                <ActiveOrderCard key={booking.id} booking={booking} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom Grid: Past Orders + Invoices + Emissions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Past Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Vergangene Aufträge</h3>
              <span className="text-xs text-gray-400">{pastBookings.length} abgeschlossen</span>
            </div>
            <div className="divide-y divide-gray-100">
              {pastBookings.map((booking) => (
                <div key={booking.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-sm font-bold text-gray-700">{booking.identifier}</span>
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {booking.serviceType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{booking.payloadDescription}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">CHF {booking.totalCHF}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(booking.requestedDate).toLocaleDateString("de-CH")}
                    </p>
                  </div>
                </div>
              ))}
              {pastBookings.length === 0 && (
                <div className="px-6 py-10 text-center text-gray-400 text-sm">Noch keine abgeschlossenen Aufträge</div>
              )}
            </div>
          </div>

          {/* Right sidebar: Invoices + Emissions */}
          <div className="flex flex-col gap-6">
            <RecentInvoices />
            <EmissionsSummary />
          </div>
        </div>
      </main>
    </div>
  );
}
