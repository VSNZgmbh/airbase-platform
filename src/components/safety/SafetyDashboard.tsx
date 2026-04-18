"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { DEMO_AUTHORIZATIONS, DEMO_AREA_DATA } from "@/lib/demo-data";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
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
  AlertCircle,
  FileText,
  Plane,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Activity,
  Zap,
  Eye,
  Radio,
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

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);
  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({
  value,
  max = 100,
  size = 80,
  stroke = 6,
  color = "#D32F2F",
  bgColor = "rgba(0,0,0,0.04)",
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  bgColor?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function DecisionBadge({ decision }: { decision: string }) {
  if (decision === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Freigegeben
      </span>
    );
  }
  if (decision === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        <XCircle className="w-3.5 h-3.5" />
        Abgelehnt
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
      <AlertTriangle className="w-3.5 h-3.5" />
      Eskaliert
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
  const labels: Record<string, string> = { low: "Gering", medium: "Mittel", high: "Hoch", critical: "Kritisch" };
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
  const labels: Record<string, string> = { open: "Offen", under_review: "In Pr\u00fcfung", resolved: "Abgeschlossen" };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${map[status] ?? "bg-gray-50 text-gray-400 border-gray-200"}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ─── KPI Card (White / Clean) ───────────────────────────────────────────────

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  ringValue,
  ringMax,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  ringValue?: number;
  ringMax?: number;
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${color}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
          </div>
          {ringValue !== undefined && ringMax !== undefined && (
            <div className="relative">
              <ProgressRing
                value={ringValue}
                max={ringMax}
                size={48}
                stroke={4}
                color={color.includes("brand") ? "#D32F2F" : color.includes("amber") ? "#f59e0b" : "#D32F2F"}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600">
                {ringMax > 0 ? Math.round((ringValue / ringMax) * 100) : 0}%
              </span>
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Live Status Indicator ───────────────────────────────────────────────────

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
      </span>
      <span className="text-xs font-medium text-brand-500">LIVE</span>
    </div>
  );
}

// ─── Authorization Tester ─────────────────────────────────────────────────────

function AuthorizationTester() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    pickupLat: "46.6863",
    pickupLng: "7.8632",
    deliveryLat: "46.7237",
    deliveryLng: "8.0325",
    altitudeAgl: "120",
    requestedForDatetime: new Date(Date.now() + 3600_000).toISOString().slice(0, 16),
  });
  const [result, setResult] = useState<null | {
    decision: string;
    reason: string;
    soraResult: { sail: string; grc: number; arc: string; overallRisk: string; riskFactors: string[] };
    weatherResult: { overallCondition: string; allWarnings: string[] };
  }>(null);

  const authorize = trpc.safety.authorize.useMutation({
    onSuccess: (data) => setResult(data as typeof result),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    authorize.mutate({
      pickupLat: parseFloat(form.pickupLat),
      pickupLng: parseFloat(form.pickupLng),
      deliveryLat: parseFloat(form.deliveryLat),
      deliveryLng: parseFloat(form.deliveryLng),
      altitudeAgl: parseInt(form.altitudeAgl),
      requestedForDatetime: new Date(form.requestedForDatetime).toISOString(),
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Flugfreigabe beantragen</p>
            <p className="text-xs text-gray-400">LUC Selbst-Autorisierungs-Engine testen</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator />
          {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Abflug Lat", key: "pickupLat", step: "0.0001" },
                { label: "Abflug Lng", key: "pickupLng", step: "0.0001" },
                { label: "Ziel Lat", key: "deliveryLat", step: "0.0001" },
                { label: "Ziel Lng", key: "deliveryLng", step: "0.0001" },
                { label: "H\u00f6he AGL (m)", key: "altitudeAgl", step: "1" },
              ].map(({ label, key, step }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
                  <input
                    type="number"
                    step={step}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Geplanter Zeitpunkt</label>
                <input
                  type="datetime-local"
                  value={form.requestedForDatetime}
                  onChange={(e) => setForm((f) => ({ ...f, requestedForDatetime: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authorize.isPending}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-brand-500/20"
            >
              {authorize.isPending ? "Pr\u00fcfung l\u00e4uft\u2026" : "Freigabe beantragen"}
            </button>
          </form>

          {authorize.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              Fehler: {authorize.error.message}
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <div
                className={`p-5 rounded-2xl border-2 ${
                  result.decision === "approved"
                    ? "border-gray-200 bg-gray-50"
                    : result.decision === "rejected"
                    ? "border-red-200 bg-red-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  {result.decision === "approved" && <ShieldCheck className="w-6 h-6 text-gray-700" />}
                  {result.decision === "rejected" && <ShieldX className="w-6 h-6 text-red-600" />}
                  {result.decision === "escalated" && <ShieldAlert className="w-6 h-6 text-amber-600" />}
                  <span
                    className={`font-bold text-lg tracking-wide ${
                      result.decision === "approved"
                        ? "text-gray-800"
                        : result.decision === "rejected"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {result.decision === "approved"
                      ? "FLUG FREIGEGEBEN"
                      : result.decision === "rejected"
                      ? "FLUG ABGELEHNT"
                      : "ESKALIERT \u2014 Safety Manager erforderlich"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{result.reason}</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "SAIL", value: result.soraResult.sail },
                  { label: "GRC", value: result.soraResult.grc },
                  { label: "ARC", value: result.soraResult.arc.toUpperCase() },
                  {
                    label: "Wetter",
                    value: result.weatherResult.overallCondition === "safe" ? "OK" : result.weatherResult.overallCondition === "marginal" ? "MARGINAL" : "UNSAFE",
                    color: result.weatherResult.overallCondition === "safe" ? "text-gray-700" : result.weatherResult.overallCondition === "marginal" ? "text-amber-600" : "text-red-600",
                  },
                ].map((item) => (
                  <div key={item.label} className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 text-center">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${"color" in item && item.color ? item.color : "text-gray-900"}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {(result.soraResult.riskFactors.length > 0 || result.weatherResult.allWarnings.length > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Risikofaktoren
                  </p>
                  <ul className="space-y-1">
                    {result.soraResult.riskFactors.map((f, i) => (
                      <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                        <span className="mt-0.5 text-amber-500">{"\u2022"}</span>
                        {f}
                      </li>
                    ))}
                    {result.weatherResult.allWarnings.map((w, i) => (
                      <li key={`w-${i}`} className="text-xs text-amber-700 flex items-start gap-1.5">
                        <span className="mt-0.5 text-amber-500">{"\u2022"}</span>
                        {w}
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

// ─── Risk Distribution (Recharts) ────────────────────────────────────────────

function RiskDistribution() {
  const { data } = trpc.safety.listAuthorizations.useQuery({ limit: 100 });

  // Use API data if available, otherwise fall back to demo data
  const sourceData = data && data.length > 0 ? data : DEMO_AUTHORIZATIONS;

  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  for (const a of sourceData) {
    const risk = a.overallRisk as keyof typeof counts;
    if (risk in counts) counts[risk]++;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const pieData = [
    { name: "Niedrig", value: counts.LOW, color: "#E57373" },
    { name: "Mittel", value: counts.MEDIUM, color: "#EF9A9A" },
    { name: "Hoch", value: counts.HIGH, color: "#D32F2F" },
    { name: "Kritisch", value: counts.CRITICAL, color: "#B71C1C" },
  ].filter((d) => d.value > 0);

  // Use DEMO_AREA_DATA as fallback for bar chart
  const barData = DEMO_AREA_DATA;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Risiko-Verteilung</h2>
        </div>
        <span className="text-xs text-gray-400 font-mono">{total} Fl\u00fcge</span>
      </div>

      {total > 0 ? (
        <div className="flex items-center gap-6 mb-6">
          <div className="w-[140px] h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2.5">
            {[
              { level: "LOW", label: "Niedrig", color: "#EF9A9A", bg: "bg-brand-300" },
              { level: "MEDIUM", label: "Mittel", color: "#E57373", bg: "bg-brand-400" },
              { level: "HIGH", label: "Hoch", color: "#D32F2F", bg: "bg-brand-500" },
              { level: "CRITICAL", label: "Kritisch", color: "#B71C1C", bg: "bg-brand-700" },
            ].map(({ level, label, bg }) => {
              const count = counts[level as keyof typeof counts];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${bg}`} />
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bg} transition-all duration-1000`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-[140px] flex items-center justify-center text-gray-400 text-sm">Noch keine Risikodaten vorhanden</div>
      )}

      <div className="border-t border-gray-100 pt-5 mt-2">
        <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Fl\u00fcge pro Gebiet</p>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barSize={20}>
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#1f2937",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="flights" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D32F2F" />
                  <stop offset="100%" stopColor="#B71C1C" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <ExternalLink className="w-3.5 h-3.5" />
        <a
          href="https://www.skyguide.ch/services/aeronautical-information"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-brand-500 transition-colors"
        >
          Skyguide AIM \u2014 NOTAMs manuell pr\u00fcfen
        </a>
      </div>
    </div>
  );
}

// ─── Authorizations Table ────────────────────────────────────────────────────

function AuthorizationsTable() {
  const [filter, setFilter] = useState<"approved" | "rejected" | "escalated" | undefined>(undefined);
  const { data, isLoading } = trpc.safety.listAuthorizations.useQuery({ limit: 50, decision: filter });

  // Fall back to demo data when API returns empty
  const displayData = data && data.length > 0
    ? data
    : filter
    ? DEMO_AUTHORIZATIONS.filter((a) => a.decision === filter)
    : DEMO_AUTHORIZATIONS;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Autorisierungs-Audit-Trail</h2>
        </div>
        <div className="flex gap-1.5">
          {(["approved", "rejected", "escalated"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilter(filter === d ? undefined : d)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === d
                  ? d === "approved"
                    ? "bg-gray-100 text-gray-800 border border-gray-300"
                    : d === "rejected"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {d === "approved" ? "Freigegeben" : d === "rejected" ? "Abgelehnt" : "Eskaliert"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm mt-3">Lade Autorisierungen\u2026</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Zeitpunkt", "Route", "SAIL", "Risiko", "Entscheid", "Quelle"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayData.map((auth) => (
                <tr key={auth.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap text-xs">{formatDateTime(auth.decidedAt)}</td>
                  <td className="px-6 py-3.5 text-gray-700 font-mono text-xs">
                    {parseFloat(auth.pickupLat).toFixed(4)},{parseFloat(auth.pickupLng).toFixed(4)}
                    <span className="text-gray-300 mx-1">{"\u2192"}</span>
                    {parseFloat(auth.deliveryLat).toFixed(4)},{parseFloat(auth.deliveryLng).toFixed(4)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-bold text-gray-900">{auth.sailLevel ?? "\u2014"}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    {auth.overallRisk ? (
                      <span
                        className={`text-xs font-bold ${
                          auth.overallRisk === "LOW"
                            ? "text-gray-500"
                            : auth.overallRisk === "MEDIUM"
                            ? "text-amber-600"
                            : auth.overallRisk === "HIGH"
                            ? "text-brand-500"
                            : "text-brand-700"
                        }`}
                      >
                        {auth.overallRisk}
                      </span>
                    ) : (
                      "\u2014"
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <DecisionBadge decision={auth.decision} />
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      {auth.decisionBy === "system" ? (
                        <>
                          <Zap className="w-3 h-3 text-brand-500" />
                          <span className="text-brand-500">System KI</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 text-amber-500" />
                          <span className="text-amber-600">Safety Manager</span>
                        </>
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

// ─── Safety Occurrences ──────────────────────────────────────────────────────

function SORPanel() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    category: "operational" as "operational" | "weather" | "airspace" | "technical" | "human",
  });

  const { data: occurrences, isLoading, refetch } = trpc.safety.listOccurrences.useQuery({ limit: 25 });
  const report = trpc.safety.reportOccurrence.useMutation({
    onSuccess: () => {
      setShowForm(false);
      setForm({ title: "", description: "", severity: "medium", category: "operational" });
      refetch();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    report.mutate(form);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Radio className="w-5 h-5 text-brand-500" />
          <h2 className="font-semibold text-gray-900">Safety Occurrence Reports (SOR)</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-all ${
            showForm
              ? "bg-gray-50 text-gray-500 border border-gray-200"
              : "bg-brand-50 text-brand-500 border border-brand-200 hover:bg-brand-100"
          }`}
        >
          {showForm ? "Abbrechen" : "+ Vorfall melden"}
        </button>
      </div>

      {showForm && (
        <div className="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Titel</label>
              <input
                type="text"
                required
                minLength={5}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Kurze Beschreibung des Vorfalls"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Beschreibung</label>
              <textarea
                required
                minLength={10}
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Detaillierte Beschreibung, was geschehen ist\u2026"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Schweregrad</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as typeof form.severity }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                >
                  <option value="low">Gering</option>
                  <option value="medium">Mittel</option>
                  <option value="high">Hoch</option>
                  <option value="critical">Kritisch</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Kategorie</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof form.category }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                >
                  <option value="operational">Operationell</option>
                  <option value="weather">Wetter</option>
                  <option value="airspace">Luftraum</option>
                  <option value="technical">Technisch</option>
                  <option value="human">Human Factors</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={report.isPending}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-brand-500/20"
            >
              {report.isPending ? "Wird gemeldet\u2026" : "Vorfall einreichen"}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="px-6 py-10 text-center">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !occurrences || occurrences.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Keine gemeldeten Vorf\u00e4lle \u2014 das ist gut!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Datum", "Titel", "Kategorie", "Schweregrad", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {occurrences.map((occ) => (
                <tr key={occ.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap text-xs">{formatDateTime(occ.reportedAt)}</td>
                  <td className="px-6 py-3.5 text-gray-900 font-medium max-w-xs truncate">{occ.title}</td>
                  <td className="px-6 py-3.5 text-gray-500 capitalize text-xs">{occ.category}</td>
                  <td className="px-6 py-3.5">
                    <SeverityBadge severity={occ.severity} />
                  </td>
                  <td className="px-6 py-3.5">
                    <OccurrenceStatusBadge status={occ.status} />
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

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function SafetyDashboard() {
  const { data: kpis, isLoading: kpisLoading } = trpc.safety.getKPIs.useQuery();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Fl\u00fcge heute"
          value={kpisLoading ? 0 : (kpis?.todayCount ?? 0)}
          sub="Autorisierungsanfragen"
          icon={Plane}
          color="from-brand-500 to-brand-700"
          ringValue={kpis?.todayCount ?? 0}
          ringMax={Math.max(kpis?.todayCount ?? 1, 20)}
        />
        <KPICard
          title="Genehmigungsrate"
          value={kpisLoading ? "..." : `${kpis?.approvalRate ?? 0}%`}
          sub={`${kpis?.approved ?? 0} von ${kpis?.totalAll ?? 0} gesamt`}
          icon={ShieldCheck}
          color="from-brand-500 to-brand-700"
          ringValue={kpis?.approvalRate ?? 0}
          ringMax={100}
        />
        <KPICard
          title="Eskalationsrate"
          value={kpisLoading ? "..." : `${kpis?.escalationRate ?? 0}%`}
          sub={`${kpis?.escalated ?? 0} Safety Manager \u00dcberpr\u00fcfungen`}
          icon={AlertTriangle}
          color="from-amber-500 to-amber-600"
          ringValue={kpis?.escalationRate ?? 0}
          ringMax={100}
        />
        <KPICard
          title="Offene Vorf\u00e4lle"
          value={kpisLoading ? 0 : (kpis?.openOccurrences ?? 0)}
          sub="Safety Occurrences offen"
          icon={AlertCircle}
          color={kpis && kpis.openOccurrences > 0 ? "from-brand-500 to-brand-700" : "from-gray-400 to-gray-500"}
        />
      </div>

      {/* LUC Info Banner */}
      <div className="relative bg-brand-50 border border-brand-100 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-100/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1.5">LUC \u2014 Light UAS Operator Certificate</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Als LUC-Inhaber bewilligen wir Fl\u00fcge selbst, ohne BAZL-Einzelgenehmigung. Das System pr\u00fcft automatisch{" "}
              <strong className="text-gray-900">SORA SAIL</strong>, <strong className="text-gray-900">Wetter</strong> und{" "}
              <strong className="text-gray-900">NOTAMs</strong>. Alle Entscheidungen werden protokolliert und sind f\u00fcr BAZL-Audits verf\u00fcgbar.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              {[
                { label: "SAIL \u2264 III", action: "Auto-Freigabe", color: "gray" },
                { label: "SAIL IV", action: "Safety Manager", color: "amber" },
                { label: "SAIL V/VI", action: "Abgelehnt", color: "brand" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                    item.color === "gray"
                      ? "bg-gray-50 text-gray-700 border-gray-200"
                      : item.color === "amber"
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-brand-50 text-brand-600 border-brand-200"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {item.label} {"\u2192"} {item.action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Authorization Tester */}
      <AuthorizationTester />

      {/* Two column: Risk + Authorizations */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskDistribution />
        </div>
        <div className="lg:col-span-2">
          <AuthorizationsTable />
        </div>
      </div>

      {/* SOR Panel */}
      <SORPanel />
    </div>
  );
}
