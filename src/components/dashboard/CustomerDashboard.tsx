"use client";

import { MissionControlLayout, SwissMap, KeyMetrics } from "@/components/mission-control";
import { DEMO_BOOKINGS, DEMO_DRONES, DEMO_INVOICES, DEMO_EMISSIONS } from "@/lib/demo-data";
import {
  CheckCircle2,
  Circle,
  Send,
  FileText,
  Plane,
  CheckCheck,
  Receipt,
  MapPin,
  Clock,
  Package,
  ArrowRight,
  Leaf,
  TreePine,
  Zap,
  Fuel,
  TrendingUp,
} from "lucide-react";

// ─── Booking Status Config ──────────────────────────────────────────────────

const BOOKING_STATUS: Record<string, { label: string; color: string; step: number }> = {
  draft: { label: "Entwurf", color: "bg-gray-50 text-gray-500 border-gray-200", step: 0 },
  pending: { label: "Angefragt", color: "bg-amber-50 text-amber-600 border-amber-200", step: 1 },
  quoted: { label: "Angebot", color: "bg-blue-50 text-blue-600 border-blue-200", step: 2 },
  confirmed: { label: "Genehmigt", color: "bg-green-50 text-green-600 border-green-200", step: 3 },
  in_progress: { label: "In Durchführung", color: "bg-brand-50 text-brand-600 border-brand-200", step: 4 },
  completed: { label: "Abgeschlossen", color: "bg-gray-50 text-gray-700 border-gray-200", step: 5 },
};

const WORKFLOW_ICONS = [Send, FileText, CheckCircle2, Plane, CheckCheck, Receipt];
const WORKFLOW_LABELS = ["Angefragt", "Angebot", "Genehmigt", "Flug", "Fertig", "Rechnung"];

// ─── Workflow Progress Bar ──────────────────────────────────────────────────

function WorkflowProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1">
      {WORKFLOW_LABELS.map((label, i) => {
        const Icon = WORKFLOW_ICONS[i];
        const isActive = i <= currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={label} className="flex items-center">
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold ${
              isCurrent ? "bg-brand-50 text-brand-600" : isActive ? "text-gray-600" : "text-gray-300"
            }`}>
              <Icon className="w-2.5 h-2.5" />
              <span className="hidden xl:inline">{label}</span>
            </div>
            {i < WORKFLOW_LABELS.length - 1 && (
              <ArrowRight className={`w-2.5 h-2.5 mx-0.5 ${isActive ? "text-brand-300" : "text-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Booking List with Status ───────────────────────────────────────────────

function BookingList() {
  const sortedBookings = [...DEMO_BOOKINGS].sort((a, b) =>
    new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime()
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Meine Buchungen</h3>
          <p className="text-[10px] text-gray-300 mt-0.5">{DEMO_BOOKINGS.length} Aufträge</p>
        </div>
        <a href="/book" className="text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors px-3 py-1.5 bg-brand-50 rounded-lg border border-brand-200">
          + Neue Buchung
        </a>
      </div>
      <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
        {sortedBookings.map((booking) => {
          const statusCfg = BOOKING_STATUS[booking.status] ?? BOOKING_STATUS.draft;
          const invoiceStatus = booking.status === "completed" ? "invoiced" : null;
          const step = invoiceStatus ? 5 : statusCfg.step;
          return (
            <div key={booking.id} className="px-5 py-3 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-gray-700">{booking.identifier}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{booking.payloadDescription}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 flex-shrink-0">CHF {booking.totalCHF}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(booking.requestedDate).toLocaleDateString("de-CH")}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {booking.payloadWeightKg} kg
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {booking.deliveryAddress.split(",")[0]}
                </span>
              </div>
              <WorkflowProgress currentStep={step} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Invoice History ────────────────────────────────────────────────────────

function InvoiceHistory() {
  const invoiceStatusColor: Record<string, string> = {
    paid: "bg-green-50 text-green-600 border-green-200",
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    draft: "bg-gray-50 text-gray-500 border-gray-200",
    overdue: "bg-red-50 text-red-600 border-red-200",
  };
  const invoiceStatusLabel: Record<string, string> = {
    paid: "Bezahlt",
    pending: "Ausstehend",
    draft: "Entwurf",
    overdue: "Überfällig",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Rechnungshistorie</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {DEMO_INVOICES.map((inv) => (
          <div key={inv.id} className="px-5 py-3 flex items-center gap-3">
            <Receipt className="w-4 h-4 text-gray-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-gray-700">{inv.identifier}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${invoiceStatusColor[inv.status] ?? invoiceStatusColor.draft}`}>
                  {invoiceStatusLabel[inv.status] ?? inv.status}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{inv.customerName}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-gray-900">CHF {inv.amount.toFixed(2)}</p>
              <p className="text-[10px] text-gray-400">
                {new Date(inv.issuedAt).toLocaleDateString("de-CH")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Emissions Report ───────────────────────────────────────────────────────

function EmissionsReport() {
  const data = DEMO_EMISSIONS;
  const maxSaved = Math.max(...data.monthly.map((m) => m.kgSaved));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Emissionsbericht</h3>
        <p className="text-[10px] text-gray-300 mt-0.5">Zero-Emission Drohnenlogistik</p>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Leaf className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[10px] font-bold text-green-600 uppercase">CO2 gespart</span>
            </div>
            <p className="text-lg font-bold text-green-700">{data.totalKgCO2Saved.toLocaleString("de-CH")} kg</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-bold text-blue-600 uppercase">Elektrisch</span>
            </div>
            <p className="text-lg font-bold text-blue-700">{data.electricKwh.toLocaleString("de-CH")} kWh</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Fuel className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold text-amber-600 uppercase">Diesel ersetzt</span>
            </div>
            <p className="text-lg font-bold text-amber-700">{data.equivalentDieselLiters.toLocaleString("de-CH")} L</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center gap-1.5 mb-1">
              <TreePine className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Bäume-Äquiv.</span>
            </div>
            <p className="text-lg font-bold text-emerald-700">{data.treesEquivalent}</p>
          </div>
        </div>
        {/* Mini bar chart */}
        <div className="flex items-end gap-1.5 h-16">
          {data.monthly.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-green-400 rounded-t-sm transition-all duration-700"
                style={{ height: `${(m.kgSaved / maxSaved) * 100}%` }}
              />
              <span className="text-[8px] text-gray-400">{m.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Active Flights Panel ───────────────────────────────────────────────────

function ActiveFlightsPanel() {
  const activeFlights = DEMO_BOOKINGS.filter((b) => b.status === "in_progress");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Live-Tracking</h3>
        <p className="text-[10px] text-gray-300 mt-0.5">{activeFlights.length} aktive Flüge</p>
      </div>
      <div className="divide-y divide-gray-50">
        {activeFlights.length === 0 ? (
          <div className="px-5 py-6 text-center text-gray-400 text-xs">Keine aktiven Flüge</div>
        ) : (
          activeFlights.map((flight) => (
            <div key={flight.id} className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-700">{flight.identifier}</span>
                </div>
                <span className="text-[9px] font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                  IN DER LUFT
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{flight.pickupAddress}</span>
                <ArrowRight className="w-3 h-3 text-brand-300 flex-shrink-0" />
                <span className="truncate">{flight.deliveryAddress.split(",")[0]}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                <span>{flight.droneName}</span>
                <span className="text-gray-200">|</span>
                <span>Pilot: {flight.pilotName}</span>
                <span className="text-gray-200">|</span>
                <span>{flight.routeDistanceKm} km</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Customer Dashboard ─────────────────────────────────────────────────────

export function CustomerDashboard() {
  const activeDrones = DEMO_DRONES.filter((d) => d.isActive).length;
  const totalBookings = DEMO_BOOKINGS.length;
  const inProgress = DEMO_BOOKINGS.filter((b) => b.status === "in_progress").length;
  const completed = DEMO_BOOKINGS.filter((b) => b.status === "completed").length;
  const totalRevenue = DEMO_BOOKINGS.reduce((sum, b) => sum + parseFloat(b.totalCHF), 0);

  return (
    <MissionControlLayout>
      <div className="p-5 h-full overflow-y-auto">
        <div className="grid grid-cols-[1fr_360px] gap-5">
          {/* Left: Map + Metrics + Booking List */}
          <div className="flex flex-col gap-5">
            <SwissMap />
            <KeyMetrics
              items={[
                { label: "Buchungen", value: totalBookings, animate: true },
                { label: "Aktive Flüge", value: inProgress, animate: true },
                { label: "Abgeschlossen", value: completed, animate: true },
                { label: "Gesamtvolumen", value: `CHF ${Math.round(totalRevenue).toLocaleString("de-CH")}`, highlight: true },
              ]}
            />
            <BookingList />
          </div>

          {/* Right: Live Tracking + Invoices + Emissions */}
          <div className="flex flex-col gap-5">
            <ActiveFlightsPanel />
            <InvoiceHistory />
            <EmissionsReport />
          </div>
        </div>
      </div>
    </MissionControlLayout>
  );
}
