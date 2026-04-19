"use client";

import { useState, useEffect } from "react";
import { DEMO_AUTHORIZATIONS, DEMO_AREA_DATA, DEMO_INCIDENTS, DEMO_FLIGHTS, DEMO_BOOKINGS } from "@/lib/demo-data";
import { AirspaceMonitor } from "@/components/airspace/AirspaceMonitor";
import { trpc } from "@/lib/trpc/client";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  Eye,
  FileText,
  AlertCircle,
  Activity,
  Timer,
  CircleDot,
  Radio,
  Radar,
  MapPin,
  Gauge,
  Battery,
  Navigation,
  Plane,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(dt: Date | string | null) {
  if (!dt) return "\u2014";
  return new Date(dt).toLocaleString("de-CH", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Compliance Header ──────────────────────────────────────────────────────

function ComplianceHeader() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-[1600px] mx-auto px-6">
        {/* Top bar */}
        <div className="h-10 flex items-center justify-between border-b border-slate-700/50 text-[10px]">
          <div className="flex items-center gap-4 text-slate-400">
            <span>BAZL-Betriebsgenehmigung (SPECIFIC)</span>
            <span className="text-slate-600">|</span>
            <span>LFG SR 748.0</span>
            <span className="text-slate-600">|</span>
            <span>EASA Art. 12 AMC1</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="font-mono">{time} UTC+2</span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              SYSTEM AKTIV
            </span>
          </div>
        </div>
        {/* Main header */}
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">COMPLIANCE & SAFETY</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">VSNZ GmbH — Drohnen-Betriebsüberwachung</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {[
              { href: "/dashboard", label: "Kunden" },
              { href: "/pilot", label: "Pilot" },
              { href: "/safety", label: "Compliance", active: true },
              { href: "/admin", label: "Analytics" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  item.active
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

// ─── Status Board (hero area) ───────────────────────────────────────────────

function StatusBoard() {
  const total = DEMO_AUTHORIZATIONS.length;
  const approved = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "approved").length;
  const rejected = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "rejected").length;
  const escalated = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "escalated").length;
  const openIncidents = DEMO_INCIDENTS.filter((i) => i.status !== "resolved").length;
  const activeFlights = DEMO_FLIGHTS.filter((f) => f.status === "in_air" || f.status === "pre_flight_check").length;

  return (
    <div className="grid grid-cols-6 gap-3">
      {[
        { label: "Aktive Flüge", value: activeFlights, color: "border-blue-500", bg: "bg-blue-950/50", text: "text-blue-400", icon: Plane },
        { label: "Genehmigt", value: approved, color: "border-emerald-500", bg: "bg-emerald-950/50", text: "text-emerald-400", icon: CheckCircle2 },
        { label: "Abgelehnt", value: rejected, color: "border-red-500", bg: "bg-red-950/50", text: "text-red-400", icon: XCircle },
        { label: "Eskaliert", value: escalated, color: "border-amber-500", bg: "bg-amber-950/50", text: "text-amber-400", icon: AlertTriangle },
        { label: "Offene Vorfälle", value: openIncidents, color: openIncidents > 0 ? "border-red-500" : "border-slate-600", bg: openIncidents > 0 ? "bg-red-950/50" : "bg-slate-800/50", text: openIncidents > 0 ? "text-red-400" : "text-slate-400", icon: AlertCircle },
        { label: "Genehmigungsrate", value: `${Math.round((approved / total) * 100)}%`, color: "border-emerald-500", bg: "bg-emerald-950/50", text: "text-emerald-400", icon: Activity },
      ].map((item) => (
        <div key={item.label} className={`${item.bg} border-l-4 ${item.color} rounded-r-lg px-4 py-3`}>
          <div className="flex items-center gap-2 mb-1">
            <item.icon className={`w-4 h-4 ${item.text}`} />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
          </div>
          <p className={`text-2xl font-bold ${item.text} font-mono`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Live Flight Telemetry ──────────────────────────────────────────────────

function LiveFlightTelemetry() {
  const liveFlights = DEMO_FLIGHTS.filter((f) => f.status === "in_air");

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Live-Flugüberwachung</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-[10px] font-bold text-blue-600">LIVE TELEMETRIE</span>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {liveFlights.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">Keine aktiven Flüge — Luftraum frei</div>
        ) : (
          liveFlights.map((flight) => (
            <div key={flight.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900">{flight.booking.identifier}</span>
                  <span className="text-xs text-slate-500">{flight.booking.pilotName}</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  IN DER LUFT
                </span>
              </div>

              {/* Telemetry strip */}
              <div className="grid grid-cols-6 gap-2">
                {[
                  { label: "Position", value: `${parseFloat(flight.booking.deliveryLat).toFixed(4)}°N`, icon: MapPin },
                  { label: "Höhe AGL", value: "120 m", icon: Navigation },
                  { label: "Geschw.", value: "75 km/h", icon: Gauge },
                  { label: "Batterie", value: "92%", icon: Battery },
                  { label: "C2 Link", value: "STARK", icon: Radio },
                  { label: "Distanz", value: `${flight.booking.routeDistanceKm} km`, icon: Activity },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-center">
                    <item.icon className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-900 font-mono">{item.value}</p>
                    <p className="text-[9px] text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Route */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{flight.booking.pickupAddress}</span>
                <span className="text-slate-300">→</span>
                <span className="font-medium text-slate-700">{flight.booking.deliveryAddress}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── AI Risk Traffic Light ──────────────────────────────────────────────────

function AIRiskTrafficLight() {
  const riskFlights = DEMO_FLIGHTS.map((f) => {
    const auth = DEMO_AUTHORIZATIONS.find((a) =>
      a.pickupLat === f.booking.pickupLat && a.pickupLng === f.booking.pickupLng
    );
    const risk = auth?.overallRisk ?? "LOW";
    return { ...f, risk, sailLevel: auth?.sailLevel ?? "I" };
  });

  const greenCount = riskFlights.filter((f) => f.risk === "LOW").length;
  const yellowCount = riskFlights.filter((f) => f.risk === "MEDIUM").length;
  const redCount = riskFlights.filter((f) => f.risk === "HIGH" || f.risk === "CRITICAL").length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">KI-Risikoanalyse</h3>
        </div>
        <span className="text-[10px] font-bold text-blue-600">AMPELSYSTEM</span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          {/* Traffic light */}
          <div className="flex flex-col items-center gap-1.5 bg-slate-900 rounded-2xl px-4 py-3">
            <div className={`w-8 h-8 rounded-full ${greenCount > 0 ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-green-900"}`} />
            <div className={`w-8 h-8 rounded-full ${yellowCount > 0 ? "bg-amber-400 shadow-lg shadow-amber-400/50" : "bg-amber-900"}`} />
            <div className={`w-8 h-8 rounded-full ${redCount > 0 ? "bg-red-500 shadow-lg shadow-red-500/50" : "bg-red-900"}`} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 border border-green-200">
              <span className="text-xs font-semibold text-green-700">Niedriges Risiko</span>
              <span className="text-sm font-bold text-green-700 font-mono">{greenCount}</span>
            </div>
            <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
              <span className="text-xs font-semibold text-amber-700">Mittleres Risiko</span>
              <span className="text-sm font-bold text-amber-700 font-mono">{yellowCount}</span>
            </div>
            <div className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2 border border-red-200">
              <span className="text-xs font-semibold text-red-700">Hohes Risiko</span>
              <span className="text-sm font-bold text-red-700 font-mono">{redCount}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          {riskFlights.map((f) => (
            <div key={f.id} className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              <CircleDot className={`w-3.5 h-3.5 flex-shrink-0 ${
                f.risk === "LOW" ? "text-green-500" : f.risk === "MEDIUM" ? "text-amber-500" : "text-red-500"
              }`} />
              <span className="font-mono font-bold text-slate-700">{f.booking.identifier}</span>
              <span className="text-slate-400 truncate flex-1">{f.booking.deliveryAddress.split(",")[0]}</span>
              <span className="font-bold text-slate-500 font-mono">SAIL {f.sailLevel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Approval Workflow ──────────────────────────────────────────────────────

function ApprovalWorkflow() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900">Flugfreigabe-Workflow (LUC)</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Dreistufig: KI → Safety Manager → Accountable Manager</p>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
          {[
            { icon: Zap, label: "KI-System", bg: "bg-blue-100 border-blue-200", iconColor: "text-blue-600" },
            { icon: Eye, label: "Safety Mgr", bg: "bg-amber-100 border-amber-200", iconColor: "text-amber-600" },
            { icon: ShieldCheck, label: "Acc. Mgr", bg: "bg-purple-100 border-purple-200", iconColor: "text-purple-600" },
            { icon: CheckCircle2, label: "Freigabe", bg: "bg-green-100 border-green-200", iconColor: "text-green-600" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-10 h-10 ${step.bg} rounded-xl flex items-center justify-center border`}>
                  <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                </div>
                <span className="text-[9px] font-bold text-slate-500">{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="w-8 h-px bg-slate-300 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">SAIL Entscheidungsregeln (EASA Art. 12 AMC1)</p>
          {[
            { label: "SAIL ≤ III", action: "Auto-Freigabe durch KI", style: "bg-green-50 text-green-700 border-green-200", icon: Zap },
            { label: "SAIL IV", action: "Safety Mgr → Accountable Mgr", style: "bg-purple-50 text-purple-600 border-purple-200", icon: ShieldCheck },
            { label: "SAIL V", action: "Safety Mgr + BAZL-Vorabklärung", style: "bg-amber-50 text-amber-600 border-amber-200", icon: ShieldAlert },
            { label: "SAIL VI", action: "Manueller BAZL-Antrag erforderlich", style: "bg-red-50 text-red-600 border-red-200", icon: AlertTriangle },
          ].map((item) => (
            <div key={item.label} className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border ${item.style}`}>
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              <span className="text-slate-400 mx-1">→</span>
              <span>{item.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Incident Register ──────────────────────────────────────────────────────

function IncidentRegister() {
  const severityColors: Record<string, string> = {
    low: "bg-slate-100 text-slate-600",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  };
  const statusColors: Record<string, string> = {
    resolved: "bg-green-100 text-green-700",
    under_review: "bg-amber-100 text-amber-700",
    open: "bg-red-100 text-red-700",
  };
  const statusLabels: Record<string, string> = {
    resolved: "Behoben", under_review: "In Prüfung", open: "Offen",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">Incident-Register & Near-Miss</h3>
        </div>
        <span className="text-[10px] text-slate-500">{DEMO_INCIDENTS.length} Einträge</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Datum", "Vorfall", "Schweregrad", "Status", "Pilot", "Drohne"].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {DEMO_INCIDENTS.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-slate-500 text-xs font-mono whitespace-nowrap">{formatDateTime(inc.date)}</td>
                <td className="px-5 py-3">
                  <p className="text-slate-900 font-medium text-xs">{inc.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{inc.description}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${severityColors[inc.severity] ?? ""}`}>
                    {inc.severity === "low" ? "Gering" : inc.severity === "medium" ? "Mittel" : "Hoch"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[inc.status] ?? ""}`}>
                    {statusLabels[inc.status] ?? inc.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">{inc.pilot}</td>
                <td className="px-5 py-3 text-xs text-slate-500 font-mono">{inc.drone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Authorizations Table ───────────────────────────────────────────────────

function AuthorizationsTable() {
  const [filter, setFilter] = useState<"approved" | "rejected" | "escalated" | undefined>(undefined);
  const { data, isLoading } = trpc.safety.listAuthorizations.useQuery({ limit: 50, decision: filter });

  const displayData = data && data.length > 0 ? data :
    filter ? DEMO_AUTHORIZATIONS.filter((a) => a.decision === filter) : DEMO_AUTHORIZATIONS;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">Autorisierungs-Audit-Trail (LUC)</h3>
        </div>
        <div className="flex gap-1.5">
          {(["approved", "rejected", "escalated"] as const).map((d) => (
            <button key={d} onClick={() => setFilter(filter === d ? undefined : d)}
              className={`px-3 py-1 rounded text-[10px] font-semibold transition-all ${
                filter === d ?
                  d === "approved" ? "bg-green-100 text-green-800 border border-green-300" :
                  d === "rejected" ? "bg-red-100 text-red-700 border border-red-300" :
                  "bg-amber-100 text-amber-700 border border-amber-300"
                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
              }`}>
              {d === "approved" ? "Freigegeben" : d === "rejected" ? "Abgelehnt" : "Eskaliert"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="px-5 py-10 text-center">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Zeitpunkt", "Route", "SAIL", "GRC", "Risiko", "Entscheid", "Quelle"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayData.map((auth) => (
                <tr key={auth.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap text-xs font-mono">{formatDateTime(auth.decidedAt)}</td>
                  <td className="px-5 py-3 text-slate-700 font-mono text-[11px]">
                    {parseFloat(auth.pickupLat).toFixed(4)},{parseFloat(auth.pickupLng).toFixed(4)}
                    <span className="text-slate-300 mx-1">→</span>
                    {parseFloat(auth.deliveryLat).toFixed(4)},{parseFloat(auth.deliveryLng).toFixed(4)}
                  </td>
                  <td className="px-5 py-3"><span className="font-bold text-slate-900 font-mono">{auth.sailLevel ?? "—"}</span></td>
                  <td className="px-5 py-3"><span className="text-slate-500 font-mono">{"grc" in auth ? (auth as (typeof DEMO_AUTHORIZATIONS)[0]).grc : "—"}</span></td>
                  <td className="px-5 py-3">
                    {auth.overallRisk ? (
                      <span className={`text-xs font-bold font-mono ${
                        auth.overallRisk === "LOW" ? "text-green-600" :
                        auth.overallRisk === "MEDIUM" ? "text-amber-600" : "text-red-600"
                      }`}>{auth.overallRisk}</span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    {auth.decision === "approved" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" /> Freigegeben
                      </span>
                    ) : auth.decision === "rejected" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" /> Abgelehnt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
                        <AlertTriangle className="w-3 h-3" /> Eskaliert
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      {auth.decisionBy === "system" ? (
                        <><Zap className="w-3 h-3 text-blue-500" /><span className="text-blue-600">System KI</span></>
                      ) : auth.decisionBy === "accountable_manager" ? (
                        <><ShieldCheck className="w-3 h-3 text-purple-500" /><span className="text-purple-600">Acc. Mgr</span></>
                      ) : (
                        <><Eye className="w-3 h-3 text-amber-500" /><span className="text-amber-600">Safety Mgr</span></>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Risk Distribution ──────────────────────────────────────────────────────

function RiskDistributionPanel() {
  const { data } = trpc.safety.listAuthorizations.useQuery({ limit: 100 });
  const sourceData = data && data.length > 0 ? data : DEMO_AUTHORIZATIONS;

  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  for (const a of sourceData) {
    const risk = a.overallRisk as keyof typeof counts;
    if (risk in counts) counts[risk]++;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const pieData = [
    { name: "Niedrig", value: counts.LOW, color: "#22c55e" },
    { name: "Mittel", value: counts.MEDIUM, color: "#f59e0b" },
    { name: "Hoch", value: counts.HIGH, color: "#ef4444" },
    { name: "Kritisch", value: counts.CRITICAL, color: "#991b1b" },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900">Risiko-Verteilung</h3>
      </div>
      <div className="p-5">
        {total > 0 && (
          <div className="flex items-center gap-6">
            <div className="w-[140px] h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px", border: "1px solid #e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { level: "LOW", label: "Niedrig", color: "#22c55e" },
                { level: "MEDIUM", label: "Mittel", color: "#f59e0b" },
                { level: "HIGH", label: "Hoch", color: "#ef4444" },
                { level: "CRITICAL", label: "Kritisch", color: "#991b1b" },
              ].map(({ level, label, color }) => {
                const count = counts[level as keyof typeof counts];
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-xs text-slate-600">{label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 mt-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Flüge pro Gebiet</p>
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_AREA_DATA} barSize={16}>
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px", border: "1px solid #e2e8f0" }} />
                <Bar dataKey="flights" fill="url(#barGradientSafety2)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradientSafety2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NOTAM Status ───────────────────────────────────────────────────────────

function NotamStatusPanel() {
  const { data, isLoading, error } = trpc.notam.checkLocation.useQuery(
    { lat: 46.6863, lng: 7.8632, radiusKm: 30 },
  );

  const severityStyles: Record<string, { bg: string; border: string; text: string; label: string }> = {
    clear: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", label: "Luftraum frei" },
    info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", label: "Hinweise vorhanden" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "Warnungen aktiv" },
    critical: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "Luftraum gesperrt" },
  };

  const style = data ? severityStyles[data.overallSeverity] ?? severityStyles.clear : severityStyles.clear;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">NOTAM-Status (Skyguide)</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-[10px] font-bold text-blue-600">LIVE</span>
        </div>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-[10px] text-red-600">NOTAM-Abfrage fehlgeschlagen</p>
          </div>
        ) : data ? (
          <>
            <div className={`${style.bg} ${style.border} border rounded-xl p-3 mb-3`}>
              <div className="flex items-center gap-2">
                {data.overallSeverity === "clear" ? (
                  <ShieldCheck className={`w-5 h-5 ${style.text}`} />
                ) : data.overallSeverity === "critical" ? (
                  <ShieldX className={`w-5 h-5 ${style.text}`} />
                ) : (
                  <ShieldAlert className={`w-5 h-5 ${style.text}`} />
                )}
                <div>
                  <p className={`text-sm font-bold ${style.text}`}>{style.label}</p>
                  <p className="text-[10px] text-slate-500">{data.affectedAreas.join(", ")}</p>
                </div>
              </div>
            </div>

            {data.alerts.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {data.alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                    <AlertCircle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                      alert.severity === "critical" ? "text-red-500" :
                      alert.severity === "warning" ? "text-amber-500" : "text-blue-500"
                    }`} />
                    <div>
                      <span className="font-mono font-bold text-slate-700">{alert.icaoId}</span>
                      <span className="text-slate-400 mx-1">—</span>
                      <span className="text-slate-600">{alert.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <a href={data.manualCheckUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] text-blue-500 hover:text-blue-700 font-medium">
              <ExternalLink className="w-3 h-3" /> Skyguide AIM Briefing
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── Authorization Tester ───────────────────────────────────────────────────

function AuthorizationTester() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    pickupLat: "46.6863", pickupLng: "7.8632",
    deliveryLat: "46.7237", deliveryLng: "8.0325",
    altitudeAgl: "120",
    requestedForDatetime: new Date(Date.now() + 3600_000).toISOString().slice(0, 16),
  });
  const [result, setResult] = useState<null | {
    decision: string; reason: string;
    soraResult: { sail: string; grc: number; arc: string; overallRisk: string; riskFactors: string[] };
    weatherResult: { overallCondition: string; allWarnings: string[] };
    notamResult: { overallSeverity: string; alerts: Array<{ icaoId: string; areaName: string; severity: string; message: string; sourceUrl: string }>; affectedAreas: string[]; manualCheckUrl: string };
  }>(null);

  const authorize = trpc.safety.authorize.useMutation({ onSuccess: (data) => setResult(data as typeof result) });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    authorize.mutate({
      pickupLat: parseFloat(form.pickupLat), pickupLng: parseFloat(form.pickupLng),
      deliveryLat: parseFloat(form.deliveryLat), deliveryLng: parseFloat(form.deliveryLng),
      altitudeAgl: parseInt(form.altitudeAgl),
      requestedForDatetime: new Date(form.requestedForDatetime).toISOString(),
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Flugfreigabe Beantragen</h3>
            <p className="text-[10px] text-slate-500">LUC Selbst-Autorisierung testen</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-5 py-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Abflug Lat", key: "pickupLat", step: "0.0001" },
                { label: "Abflug Lng", key: "pickupLng", step: "0.0001" },
                { label: "Ziel Lat", key: "deliveryLat", step: "0.0001" },
                { label: "Ziel Lng", key: "deliveryLng", step: "0.0001" },
                { label: "Höhe AGL (m)", key: "altitudeAgl", step: "1" },
              ].map(({ label, key, step }) => (
                <div key={key}>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">{label}</label>
                  <input type="number" step={step} value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono" />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Geplanter Zeitpunkt</label>
                <input type="datetime-local" value={form.requestedForDatetime}
                  onChange={(e) => setForm((f) => ({ ...f, requestedForDatetime: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
              </div>
            </div>
            <button type="submit" disabled={authorize.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg transition-all text-sm">
              {authorize.isPending ? "Prüfung läuft..." : "Freigabe beantragen"}
            </button>
          </form>

          {authorize.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">Fehler: {authorize.error.message}</div>
          )}

          {result && (
            <div className="mt-4 space-y-3">
              <div className={`p-4 rounded-xl border-2 ${
                result.decision === "approved" ? "border-green-300 bg-green-50" :
                result.decision === "rejected" ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {result.decision === "approved" && <ShieldCheck className="w-5 h-5 text-green-700" />}
                  {result.decision === "rejected" && <ShieldX className="w-5 h-5 text-red-600" />}
                  {result.decision === "escalated" && <ShieldAlert className="w-5 h-5 text-amber-600" />}
                  <span className={`font-bold text-sm ${
                    result.decision === "approved" ? "text-green-800" :
                    result.decision === "rejected" ? "text-red-600" : "text-amber-600"
                  }`}>
                    {result.decision === "approved" ? "FLUG FREIGEGEBEN" :
                     result.decision === "rejected" ? "FLUG ABGELEHNT" :
                     result.soraResult.sail === "IV" ? "ESKALIERT — Safety + Accountable Mgr erforderlich" :
                     "ESKALIERT — Safety Manager erforderlich"}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{result.reason}</p>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: "SAIL", value: result.soraResult.sail },
                  { label: "GRC", value: result.soraResult.grc },
                  { label: "ARC", value: result.soraResult.arc.toUpperCase() },
                  { label: "Wetter", value: result.weatherResult.overallCondition === "safe" ? "OK" :
                    result.weatherResult.overallCondition === "marginal" ? "MARGINAL" : "UNSAFE",
                    color: result.weatherResult.overallCondition === "safe" ? "text-green-700" :
                    result.weatherResult.overallCondition === "marginal" ? "text-amber-600" : "text-red-600" },
                  { label: "NOTAM", value: result.notamResult.overallSeverity === "clear" ? "FREI" :
                    result.notamResult.overallSeverity === "info" ? "INFO" :
                    result.notamResult.overallSeverity === "warning" ? "WARNUNG" : "KRITISCH",
                    color: result.notamResult.overallSeverity === "clear" ? "text-green-700" :
                    result.notamResult.overallSeverity === "info" ? "text-blue-600" :
                    result.notamResult.overallSeverity === "warning" ? "text-amber-600" : "text-red-600" },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase">{item.label}</p>
                    <p className={`text-base font-bold mt-0.5 font-mono ${"color" in item && item.color ? item.color : "text-slate-900"}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {result.notamResult.alerts.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-blue-600 mb-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> NOTAM ({result.notamResult.affectedAreas.join(", ")})
                  </p>
                  <ul className="space-y-0.5">
                    {result.notamResult.alerts.map((alert, i) => (
                      <li key={i} className="text-[11px] text-blue-700 flex items-start gap-1">
                        <span className="mt-0.5">•</span>
                        <span><strong>{alert.icaoId}</strong>: {alert.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(result.soraResult.riskFactors.length > 0 || result.weatherResult.allWarnings.length > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-amber-600 mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Risikofaktoren
                  </p>
                  <ul className="space-y-0.5">
                    {result.soraResult.riskFactors.map((f, i) => (
                      <li key={i} className="text-[11px] text-amber-700">• {f}</li>
                    ))}
                    {result.weatherResult.allWarnings.map((w, i) => (
                      <li key={`w-${i}`} className="text-[11px] text-amber-700">• {w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SOR Panel ──────────────────────────────────────────────────────────────

function SORPanel() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    category: "operational" as "operational" | "weather" | "airspace" | "technical" | "human",
  });

  const { data: occurrences, isLoading, refetch } = trpc.safety.listOccurrences.useQuery({ limit: 25 });
  const report = trpc.safety.reportOccurrence.useMutation({
    onSuccess: () => { setShowForm(false); setForm({ title: "", description: "", severity: "medium", category: "operational" }); refetch(); },
  });

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); report.mutate(form); }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">Safety Occurrence Reports</h3>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all ${
            showForm ? "bg-slate-100 text-slate-500 border border-slate-200" : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
          }`}>
          {showForm ? "Abbrechen" : "+ Vorfall melden"}
        </button>
      </div>

      {showForm && (
        <div className="px-5 py-5 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Titel</label>
              <input type="text" required minLength={5} value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Kurze Beschreibung"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Beschreibung</label>
              <textarea required minLength={10} rows={3} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Detaillierte Beschreibung..."
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Schweregrad</label>
                <select value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as typeof form.severity }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500">
                  <option value="low">Gering</option>
                  <option value="medium">Mittel</option>
                  <option value="high">Hoch</option>
                  <option value="critical">Kritisch</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Kategorie</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof form.category }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500">
                  <option value="operational">Operationell</option>
                  <option value="weather">Wetter</option>
                  <option value="airspace">Luftraum</option>
                  <option value="technical">Technisch</option>
                  <option value="human">Human Factors</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={report.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg transition-all text-sm">
              {report.isPending ? "Wird gemeldet..." : "Vorfall einreichen"}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="px-5 py-8 text-center">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !occurrences || occurrences.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-xs">Keine gemeldeten Vorfälle</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Datum", "Titel", "Kategorie", "Schweregrad", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {occurrences.map((occ) => (
                <tr key={occ.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap text-xs font-mono">{formatDateTime(occ.reportedAt)}</td>
                  <td className="px-5 py-3 text-slate-900 font-medium max-w-xs truncate text-xs">{occ.title}</td>
                  <td className="px-5 py-3 text-slate-500 capitalize text-xs">{occ.category}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                      occ.severity === "low" ? "bg-slate-100 text-slate-600" :
                      occ.severity === "medium" ? "bg-amber-100 text-amber-700" :
                      occ.severity === "high" ? "bg-red-100 text-red-700" : "bg-red-200 text-red-800"
                    }`}>
                      {occ.severity === "low" ? "Gering" : occ.severity === "medium" ? "Mittel" : occ.severity === "high" ? "Hoch" : "Kritisch"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                      occ.status === "open" ? "bg-red-100 text-red-700" :
                      occ.status === "under_review" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    }`}>
                      {occ.status === "open" ? "Offen" : occ.status === "under_review" ? "In Prüfung" : "Abgeschlossen"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export function SafetyDashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
      <ComplianceHeader />

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Status Board */}
        <StatusBoard />

        {/* Top row: Live Telemetry + Traffic Light + Workflow */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <LiveFlightTelemetry />
          </div>
          <div className="flex flex-col gap-6">
            <AIRiskTrafficLight />
          </div>
        </div>

        {/* Middle: Approval Workflow + NOTAM + Risk + Airspace */}
        <div className="grid grid-cols-3 gap-6">
          <ApprovalWorkflow />
          <NotamStatusPanel />
          <RiskDistributionPanel />
        </div>

        {/* Bottom: Tables */}
        <IncidentRegister />
        <AuthorizationsTable />

        {/* Tools */}
        <div className="grid grid-cols-2 gap-6">
          <AuthorizationTester />
          <SORPanel />
        </div>
      </main>
    </div>
  );
}
