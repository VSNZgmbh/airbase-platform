"use client";

import { useState } from "react";
import { MissionControlLayout, SwissMap, KeyMetrics } from "@/components/mission-control";
import { DEMO_AUTHORIZATIONS, DEMO_AREA_DATA, DEMO_INCIDENTS, DEMO_FLIGHTS } from "@/lib/demo-data";
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
  TrendingDown,
  CircleDot,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dt: Date | string | null) {
  if (!dt) return "\u2014";
  return new Date(dt).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function DecisionBadge({ decision }: { decision: string }) {
  if (decision === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Freigegeben
      </span>
    );
  }
  if (decision === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        <XCircle className="w-3.5 h-3.5" /> Abgelehnt
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
      <AlertTriangle className="w-3.5 h-3.5" /> Eskaliert
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    low: "bg-gray-50 text-gray-500 border-gray-200",
    medium: "bg-amber-50 text-amber-600 border-amber-200",
    high: "bg-brand-50 text-brand-500 border-brand-200",
    critical: "bg-brand-100 text-brand-700 border-brand-200",
  };
  const labels: Record<string, string> = {
    low: "Gering",
    medium: "Mittel",
    high: "Hoch",
    critical: "Kritisch",
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${map[severity] ?? "bg-gray-50 text-gray-400 border-gray-200"}`}>
      {labels[severity] ?? severity}
    </span>
  );
}

function OccurrenceStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-red-50 text-red-600 border-red-200",
    under_review: "bg-amber-50 text-amber-600 border-amber-200",
    resolved: "bg-gray-50 text-gray-700 border-gray-200",
  };
  const labels: Record<string, string> = {
    open: "Offen",
    under_review: "In Pr\u00fcfung",
    resolved: "Abgeschlossen",
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${map[status] ?? "bg-gray-50 text-gray-400 border-gray-200"}`}>
      {labels[status] ?? status}
    </span>
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">AI-Risikoanalyse</h3>
          <p className="text-[10px] text-gray-300 mt-0.5">Ampelsystem pro Flug</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
          </span>
          <span className="text-[10px] font-bold text-brand-600">KI</span>
        </div>
      </div>

      {/* Traffic light display */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex flex-col items-center gap-1 bg-gray-900 rounded-2xl px-4 py-3">
          <div className={`w-8 h-8 rounded-full ${greenCount > 0 ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-green-900"}`} />
          <div className={`w-8 h-8 rounded-full ${yellowCount > 0 ? "bg-amber-400 shadow-lg shadow-amber-400/50" : "bg-amber-900"}`} />
          <div className={`w-8 h-8 rounded-full ${redCount > 0 ? "bg-red-500 shadow-lg shadow-red-500/50" : "bg-red-900"}`} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 border border-green-100">
            <span className="text-xs font-semibold text-green-700">Grün — Niedriges Risiko</span>
            <span className="text-sm font-bold text-green-700">{greenCount}</span>
          </div>
          <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
            <span className="text-xs font-semibold text-amber-700">Gelb — Mittleres Risiko</span>
            <span className="text-sm font-bold text-amber-700">{yellowCount}</span>
          </div>
          <div className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2 border border-red-100">
            <span className="text-xs font-semibold text-red-700">Rot — Hohes/Kritisches Risiko</span>
            <span className="text-sm font-bold text-red-700">{redCount}</span>
          </div>
        </div>
      </div>

      {/* Per-flight risk list */}
      <div className="space-y-1.5">
        {riskFlights.map((f) => (
          <div key={f.id} className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
            <CircleDot className={`w-3.5 h-3.5 flex-shrink-0 ${
              f.risk === "LOW" ? "text-green-500" : f.risk === "MEDIUM" ? "text-amber-500" : "text-red-500"
            }`} />
            <span className="font-mono font-bold text-gray-700">{f.booking.identifier}</span>
            <span className="text-gray-400 truncate flex-1">{f.booking.deliveryAddress.split(",")[0]}</span>
            <span className="font-bold text-gray-500">SAIL {f.sailLevel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Flight Approval Workflow ────────────────────────────────────────────────

function ApprovalWorkflow() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Flugfreigabe-Workflow</h3>
        <p className="text-[10px] text-gray-300 mt-0.5">BAZL LUC Dreistufig: KI → Safety Manager → Accountable Manager</p>
      </div>

      {/* Three-tier workflow diagram */}
      <div className="flex items-center gap-1.5 mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center border border-brand-200">
            <Zap className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-[7px] font-bold text-gray-400">KI-System</span>
        </div>
        <div className="flex-1 h-px bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[7px] text-gray-400 bg-gray-50 px-1">SORA</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-200">
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[7px] font-bold text-gray-400">Safety Mgr</span>
        </div>
        <div className="flex-1 h-px bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[7px] text-gray-400 bg-gray-50 px-1">SAIL IV</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-200">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-[7px] font-bold text-gray-400">Acc. Mgr</span>
        </div>
        <div className="flex-1 h-px bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[7px] text-gray-400 bg-gray-50 px-1">Final</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center border border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <span className="text-[7px] font-bold text-gray-400">Freigabe</span>
        </div>
      </div>

      {/* SAIL decision rules — three-tier */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">SAIL Entscheidungsregeln (EASA Art. 12 AMC1)</p>
        {[
          { label: "SAIL \u2264 III", action: "Auto-Freigabe durch KI", style: "bg-green-50 text-green-700 border-green-200", icon: Zap },
          { label: "SAIL IV", action: "Safety Mgr → Accountable Mgr", style: "bg-purple-50 text-purple-600 border-purple-200", icon: ShieldCheck },
          { label: "SAIL V", action: "Eskalation: Safety Mgr + BAZL-Vorabklärung", style: "bg-amber-50 text-amber-600 border-amber-200", icon: ShieldAlert },
          { label: "SAIL VI", action: "Manueller BAZL-Antrag erforderlich", style: "bg-red-50 text-red-600 border-red-200", icon: AlertTriangle },
        ].map((item) => (
          <div key={item.label} className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border ${item.style}`}>
            <item.icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
            <span className="text-gray-400 mx-1">{"\u2192"}</span>
            <span>{item.action}</span>
          </div>
        ))}
      </div>

      {/* BAZL compliance note */}
      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
        <p className="text-[9px] text-blue-600 font-medium">BAZL LUC-konform: Dreistufige Signaturkette gem. EASA Art. 12 AMC1</p>
      </div>
    </div>
  );
}

// ─── LUC Protocol Panel ─────────────────────────────────────────────────────

function LUCProtocol() {
  const checks = [
    { label: "Luftraumkarten aktuell", status: "ok" },
    { label: "Wetterdaten verifiziert", status: "ok" },
    { label: "Piloten-Zertifizierung gültig", status: "ok" },
    { label: "SORA-Bewertung durchgeführt", status: "ok" },
    { label: "BAZL-Genehmigung erteilt", status: "ok" },
    { label: "Versicherungsnachweis aktuell", status: "ok" },
    { label: "DAA aktiv (SafeSky + INVOLI)", status: "ok" },
    { label: "Luftraumüberwachung redundant", status: "ok" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Betriebsprüfung</h3>
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-[0.12em] mt-1">BAZL-Betriebsgenehmigung (SPECIFIC)</p>
      </div>

      <div className="space-y-2 mb-4">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 font-medium">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <FileText className="w-3 h-3" />
          <span>BAZL-Betriebsgenehmigung (SPECIFIC) | Gültig gemäss LFG SR 748.0</span>
        </div>
      </div>
    </div>
  );
}

// ─── Incident Register ──────────────────────────────────────────────────────

function IncidentRegister() {
  const severityColors: Record<string, string> = {
    low: "bg-gray-50 text-gray-500 border-gray-200",
    medium: "bg-amber-50 text-amber-600 border-amber-200",
    high: "bg-red-50 text-red-600 border-red-200",
  };
  const statusColors: Record<string, string> = {
    resolved: "bg-green-50 text-green-600 border-green-200",
    under_review: "bg-amber-50 text-amber-600 border-amber-200",
    open: "bg-red-50 text-red-600 border-red-200",
  };
  const statusLabels: Record<string, string> = {
    resolved: "Behoben",
    under_review: "In Pr\u00fcfung",
    open: "Offen",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Incident-Register & Near-Miss</h3>
          <p className="text-[10px] text-gray-300 mt-0.5">{DEMO_INCIDENTS.length} Einträge</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {DEMO_INCIDENTS.map((inc) => (
          <div key={inc.id} className="px-5 py-3">
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-xs font-bold text-gray-900 flex-1">{inc.title}</h4>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ml-2 flex-shrink-0 ${statusColors[inc.status] ?? ""}`}>
                {statusLabels[inc.status] ?? inc.status}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mb-2">{inc.description}</p>
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span>{formatDateTime(inc.date)}</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${severityColors[inc.severity] ?? ""}`}>
                {inc.severity === "low" ? "Gering" : inc.severity === "medium" ? "Mittel" : "Hoch"}
              </span>
              <span>{inc.category}</span>
              <span className="text-gray-300">|</span>
              <span>Pilot: {inc.pilot}</span>
              <span className="text-gray-300">|</span>
              <span>{inc.drone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Safety KPI Panel ───────────────────────────────────────────────────────

function SafetyKPIs() {
  const total = DEMO_AUTHORIZATIONS.length;
  const approved = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "approved").length;
  const rejected = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "rejected").length;
  const escalated = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "escalated").length;
  const approvalRate = Math.round((approved / total) * 100);
  const escalationRate = Math.round((escalated / total) * 100);
  const avgProcessTimeMin = 4.2;

  const openIncidents = DEMO_INCIDENTS.filter((i) => i.status !== "resolved").length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Safety KPIs</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] font-bold text-green-600 uppercase">Genehmigungsrate</span>
          </div>
          <p className="text-xl font-bold text-green-700">{approvalRate}%</p>
          <p className="text-[9px] text-green-500">{approved}/{total} Flüge</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold text-amber-600 uppercase">Eskalationsrate</span>
          </div>
          <p className="text-xl font-bold text-amber-700">{escalationRate}%</p>
          <p className="text-[9px] text-amber-500">{escalated} eskaliert</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Timer className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-bold text-blue-600 uppercase">Ø Bearbeitungszeit</span>
          </div>
          <p className="text-xl font-bold text-blue-700">{avgProcessTimeMin} min</p>
          <p className="text-[9px] text-blue-500">Durchschnitt</p>
        </div>
        <div className={`rounded-xl p-3 border ${openIncidents > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className={`w-3.5 h-3.5 ${openIncidents > 0 ? "text-red-500" : "text-gray-400"}`} />
            <span className={`text-[10px] font-bold uppercase ${openIncidents > 0 ? "text-red-600" : "text-gray-500"}`}>Offene Vorfälle</span>
          </div>
          <p className={`text-xl font-bold ${openIncidents > 0 ? "text-red-700" : "text-gray-700"}`}>{openIncidents}</p>
          <p className={`text-[9px] ${openIncidents > 0 ? "text-red-500" : "text-gray-400"}`}>Near-Misses & Incidents</p>
        </div>
      </div>
    </div>
  );
}

// ─── NOTAM Status Panel ──────────────────────────────────────────────────────

function NotamStatusPanel() {
  // Default check location: Interlaken (central Swiss drone ops area)
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">NOTAM-Status</h3>
          <p className="text-[10px] text-gray-300 mt-0.5">Skyguide Luftraum-Meldungen</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-[10px] font-bold text-blue-600">LIVE</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-[10px] text-red-600 font-medium">NOTAM-Abfrage fehlgeschlagen</p>
        </div>
      ) : data ? (
        <>
          {/* Overall severity indicator */}
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
                <p className="text-[10px] text-gray-500">{data.affectedAreas.join(", ")}</p>
              </div>
            </div>
          </div>

          {/* Alert list */}
          {data.alerts.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {data.alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  <AlertCircle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                    alert.severity === "critical" ? "text-red-500" :
                    alert.severity === "warning" ? "text-amber-500" : "text-blue-500"
                  }`} />
                  <div>
                    <span className="font-mono font-bold text-gray-700">{alert.icaoId}</span>
                    <span className="text-gray-400 mx-1">—</span>
                    <span className="text-gray-600">{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Manual check link */}
          <a href={data.manualCheckUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] text-blue-500 hover:text-blue-700 font-medium">
            <ExternalLink className="w-3 h-3" /> Skyguide AIM Briefing öffnen
          </a>

          <div className="border-t border-gray-100 pt-2 mt-3">
            <p className="text-[9px] text-gray-400">Letzte Prüfung: {new Date(data.checkTimestamp).toLocaleString("de-CH")}</p>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Risk Distribution Panel ──────────────────────────────────────────────────

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
    { name: "Niedrig", value: counts.LOW, color: "#4ade80" },
    { name: "Mittel", value: counts.MEDIUM, color: "#fbbf24" },
    { name: "Hoch", value: counts.HIGH, color: "#D32F2F" },
    { name: "Kritisch", value: counts.CRITICAL, color: "#B71C1C" },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Risiko-Verteilung</h3>
        <span className="text-[10px] text-gray-400 font-mono">{total} Fl\u00fcge</span>
      </div>

      {total > 0 ? (
        <div className="mb-4">
          <div className="w-full h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "11px", color: "#1f2937", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-3">
            {[
              { level: "LOW", label: "Niedrig", color: "#4ade80" },
              { level: "MEDIUM", label: "Mittel", color: "#fbbf24" },
              { level: "HIGH", label: "Hoch", color: "#D32F2F" },
              { level: "CRITICAL", label: "Kritisch", color: "#B71C1C" },
            ].map(({ level, label, color }) => {
              const count = counts[level as keyof typeof counts];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[11px] text-gray-500">{label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-700">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-[130px] flex items-center justify-center text-gray-400 text-sm">Noch keine Risikodaten vorhanden</div>
      )}

      <div className="border-t border-gray-100 pt-4 mt-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Fl\u00fcge pro Gebiet</p>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEMO_AREA_DATA} barSize={16}>
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "11px", color: "#1f2937", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="flights" fill="url(#barGradientSafety)" radius={[5, 5, 0, 0]} />
              <defs>
                <linearGradient id="barGradientSafety" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D32F2F" />
                  <stop offset="100%" stopColor="#B71C1C" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Authorization Tester ─────────────────────────────────────────────────────

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Flugfreigabe Beantragen</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">LUC Selbst-Autorisierung testen</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
          </span>
          <span className="text-[10px] font-bold text-brand-600">LIVE</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Abflug Lat", key: "pickupLat", step: "0.0001" },
                { label: "Abflug Lng", key: "pickupLng", step: "0.0001" },
                { label: "Ziel Lat", key: "deliveryLat", step: "0.0001" },
                { label: "Ziel Lng", key: "deliveryLng", step: "0.0001" },
                { label: "H\u00f6he AGL (m)", key: "altitudeAgl", step: "1" },
              ].map(({ label, key, step }) => (
                <div key={key}>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">{label}</label>
                  <input type="number" step={step} value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Geplanter Zeitpunkt</label>
                <input type="datetime-local" value={form.requestedForDatetime}
                  onChange={(e) => setForm((f) => ({ ...f, requestedForDatetime: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all" />
              </div>
            </div>
            <button type="submit" disabled={authorize.isPending}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-500/20">
              {authorize.isPending ? "Pr\u00fcfung l\u00e4uft\u2026" : "Freigabe beantragen"}
            </button>
          </form>

          {authorize.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">Fehler: {authorize.error.message}</div>
          )}

          {result && (
            <div className="mt-4 space-y-3">
              <div className={`p-4 rounded-2xl border-2 ${
                result.decision === "approved" ? "border-green-200 bg-green-50" :
                result.decision === "rejected" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {result.decision === "approved" && <ShieldCheck className="w-5 h-5 text-green-700" />}
                  {result.decision === "rejected" && <ShieldX className="w-5 h-5 text-red-600" />}
                  {result.decision === "escalated" && <ShieldAlert className="w-5 h-5 text-amber-600" />}
                  <span className={`font-bold text-sm tracking-wide ${
                    result.decision === "approved" ? "text-green-800" :
                    result.decision === "rejected" ? "text-red-600" : "text-amber-600"
                  }`}>
                    {result.decision === "approved" ? "FLUG FREIGEGEBEN" :
                     result.decision === "rejected" ? "FLUG ABGELEHNT" :
                     result.soraResult.sail === "IV" ? "ESKALIERT \u2014 Safety Manager + Accountable Manager erforderlich" :
                     "ESKALIERT \u2014 Safety Manager erforderlich"}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{result.reason}</p>
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
                  <div key={item.label} className="bg-white border border-gray-100 shadow-sm rounded-xl p-2.5 text-center">
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                    <p className={`text-base font-bold mt-0.5 ${"color" in item && item.color ? item.color : "text-gray-900"}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* NOTAM Alerts */}
              {result.notamResult.alerts.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-blue-600 mb-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> NOTAM-Meldungen ({result.notamResult.affectedAreas.join(", ")})
                  </p>
                  <ul className="space-y-0.5">
                    {result.notamResult.alerts.map((alert, i) => (
                      <li key={i} className="text-[11px] text-blue-700 flex items-start gap-1">
                        <span className={`mt-0.5 ${alert.severity === "critical" ? "text-red-500" : alert.severity === "warning" ? "text-amber-500" : "text-blue-500"}`}>{"\u2022"}</span>
                        <span><strong>{alert.icaoId}</strong>: {alert.message}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={result.notamResult.manualCheckUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 mt-2 font-medium">
                    <ExternalLink className="w-3 h-3" /> Skyguide AIM Briefing
                  </a>
                </div>
              )}

              {(result.soraResult.riskFactors.length > 0 || result.weatherResult.allWarnings.length > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-amber-600 mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Risikofaktoren
                  </p>
                  <ul className="space-y-0.5">
                    {result.soraResult.riskFactors.map((f, i) => (
                      <li key={i} className="text-[11px] text-amber-700 flex items-start gap-1">
                        <span className="mt-0.5 text-amber-500">{"\u2022"}</span> {f}
                      </li>
                    ))}
                    {result.weatherResult.allWarnings.map((w, i) => (
                      <li key={`w-${i}`} className="text-[11px] text-amber-700 flex items-start gap-1">
                        <span className="mt-0.5 text-amber-500">{"\u2022"}</span> {w}
                      </li>
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

// ─── Authorizations Table ─────────────────────────────────────────────────────

function AuthorizationsTable() {
  const [filter, setFilter] = useState<"approved" | "rejected" | "escalated" | undefined>(undefined);
  const { data, isLoading } = trpc.safety.listAuthorizations.useQuery({ limit: 50, decision: filter });

  const displayData = data && data.length > 0 ? data :
    filter ? DEMO_AUTHORIZATIONS.filter((a) => a.decision === filter) : DEMO_AUTHORIZATIONS;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Autorisierungs-Audit-Trail (LUC)</h3>
        <div className="flex gap-1.5">
          {(["approved", "rejected", "escalated"] as const).map((d) => (
            <button key={d} onClick={() => setFilter(filter === d ? undefined : d)}
              className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                filter === d ?
                  d === "approved" ? "bg-green-100 text-green-800 border border-green-300" :
                  d === "rejected" ? "bg-red-50 text-red-600 border border-red-200" :
                  "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
              }`}>
              {d === "approved" ? "Freigegeben" : d === "rejected" ? "Abgelehnt" : "Eskaliert"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="px-5 py-10 text-center">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-xs mt-2">Lade Autorisierungen\u2026</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Zeitpunkt", "Route", "SAIL", "GRC", "Risiko", "Entscheid", "Quelle"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayData.map((auth) => (
                <tr key={auth.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDateTime(auth.decidedAt)}</td>
                  <td className="px-5 py-3 text-gray-700 font-mono text-[11px]">
                    {parseFloat(auth.pickupLat).toFixed(4)},{parseFloat(auth.pickupLng).toFixed(4)}
                    <span className="text-gray-300 mx-1">{"\u2192"}</span>
                    {parseFloat(auth.deliveryLat).toFixed(4)},{parseFloat(auth.deliveryLng).toFixed(4)}
                  </td>
                  <td className="px-5 py-3"><span className="font-bold text-gray-900">{auth.sailLevel ?? "\u2014"}</span></td>
                  <td className="px-5 py-3"><span className="text-gray-500">{"grc" in auth ? (auth as (typeof DEMO_AUTHORIZATIONS)[0]).grc : "\u2014"}</span></td>
                  <td className="px-5 py-3">
                    {auth.overallRisk ? (
                      <span className={`text-xs font-bold ${
                        auth.overallRisk === "LOW" ? "text-green-500" :
                        auth.overallRisk === "MEDIUM" ? "text-amber-600" :
                        auth.overallRisk === "HIGH" ? "text-brand-500" : "text-brand-700"
                      }`}>{auth.overallRisk}</span>
                    ) : "\u2014"}
                  </td>
                  <td className="px-5 py-3"><DecisionBadge decision={auth.decision} /></td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      {auth.decisionBy === "system" ? (
                        <><Zap className="w-3 h-3 text-brand-500" /><span className="text-brand-500">System KI</span></>
                      ) : auth.decisionBy === "accountable_manager" ? (
                        <><ShieldCheck className="w-3 h-3 text-purple-500" /><span className="text-purple-600">Accountable Mgr</span></>
                      ) : (
                        <><Eye className="w-3 h-3 text-amber-500" /><span className="text-amber-600">Safety Manager</span></>
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

// ─── SOR Panel ────────────────────────────────────────────────────────────────

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Safety Occurrence Reports</h3>
        <button onClick={() => setShowForm(!showForm)}
          className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all ${
            showForm ? "bg-gray-50 text-gray-500 border border-gray-200" : "bg-brand-50 text-brand-500 border border-brand-200 hover:bg-brand-100"
          }`}>
          {showForm ? "Abbrechen" : "+ Vorfall melden"}
        </button>
      </div>

      {showForm && (
        <div className="px-5 py-5 border-b border-gray-100 bg-gray-50/50">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Titel</label>
              <input type="text" required minLength={5} value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Kurze Beschreibung des Vorfalls"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Beschreibung</label>
              <textarea required minLength={10} rows={3} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Detaillierte Beschreibung..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Schweregrad</label>
                <select value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as typeof form.severity }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500">
                  <option value="low">Gering</option>
                  <option value="medium">Mittel</option>
                  <option value="high">Hoch</option>
                  <option value="critical">Kritisch</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Kategorie</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof form.category }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500">
                  <option value="operational">Operationell</option>
                  <option value="weather">Wetter</option>
                  <option value="airspace">Luftraum</option>
                  <option value="technical">Technisch</option>
                  <option value="human">Human Factors</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={report.isPending}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-500/20">
              {report.isPending ? "Wird gemeldet..." : "Vorfall einreichen"}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="px-5 py-8 text-center">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !occurrences || occurrences.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-xs">Keine gemeldeten Vorfälle — das ist gut!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Datum", "Titel", "Kategorie", "Schweregrad", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {occurrences.map((occ) => (
                <tr key={occ.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDateTime(occ.reportedAt)}</td>
                  <td className="px-5 py-3 text-gray-900 font-medium max-w-xs truncate text-xs">{occ.title}</td>
                  <td className="px-5 py-3 text-gray-500 capitalize text-xs">{occ.category}</td>
                  <td className="px-5 py-3"><SeverityBadge severity={occ.severity} /></td>
                  <td className="px-5 py-3"><OccurrenceStatusBadge status={occ.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function SafetyDashboard() {
  const { data: kpis } = trpc.safety.getKPIs.useQuery();

  return (
    <MissionControlLayout>
      <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 48px)" }}>
        <div className="grid grid-cols-[1fr_360px] gap-5">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Map with airspace overlays + live air traffic */}
            <SwissMap showAirTraffic />

            {/* Key Metrics */}
            <KeyMetrics
              items={[
                { label: "Fl\u00fcge heute", value: kpis?.todayCount ?? DEMO_FLIGHTS.filter((f) => f.status === "in_air" || f.status === "pre_flight_check" || f.status === "scheduled").length, animate: true },
                { label: "Genehmigungsrate", value: `${kpis?.approvalRate ?? Math.round((DEMO_AUTHORIZATIONS.filter((a) => a.decision === "approved").length / DEMO_AUTHORIZATIONS.length) * 100)}%` },
                { label: "Eskalationsrate", value: `${kpis?.escalationRate ?? Math.round((DEMO_AUTHORIZATIONS.filter((a) => a.decision === "escalated").length / DEMO_AUTHORIZATIONS.length) * 100)}%` },
                { label: "Vorf\u00e4lle", value: DEMO_INCIDENTS.filter((i) => i.status !== "resolved").length, animate: true },
              ]}
            />

            {/* Incident Register */}
            <IncidentRegister />

            {/* Authorizations audit trail */}
            <AuthorizationsTable />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Live Airspace Monitoring (SafeSky + INVOLI) */}
            <AirspaceMonitor />

            {/* AI Risk Traffic Light */}
            <AIRiskTrafficLight />

            {/* Safety KPIs */}
            <SafetyKPIs />

            {/* Flight Approval Workflow */}
            <ApprovalWorkflow />

            {/* LUC Protocol */}
            <LUCProtocol />

            {/* NOTAM Status */}
            <NotamStatusPanel />

            {/* Risk Distribution */}
            <RiskDistributionPanel />

            {/* Authorization Tester */}
            <AuthorizationTester />

            {/* SOR */}
            <SORPanel />
          </div>
        </div>
      </div>
    </MissionControlLayout>
  );
}
