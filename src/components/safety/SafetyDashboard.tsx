"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
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
  TrendingUp,
  Plane,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dt: Date | string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DecisionBadge({ decision }: { decision: string }) {
  if (decision === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Freigegeben
      </span>
    );
  }
  if (decision === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <XCircle className="w-3.5 h-3.5" />
        Abgelehnt
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
      <AlertTriangle className="w-3.5 h-3.5" />
      Eskaliert
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    low: "Gering",
    medium: "Mittel",
    high: "Hoch",
    critical: "Kritisch",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${map[severity] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[severity] ?? severity}
    </span>
  );
}

function OccurrenceStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-red-100 text-red-700",
    under_review: "bg-amber-100 text-amber-700",
    resolved: "bg-emerald-100 text-emerald-700",
  };
  const labels: Record<string, string> = {
    open: "Offen",
    under_review: "In Prüfung",
    resolved: "Abgeschlossen",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, string> = {
    LOW: "text-emerald-600 font-semibold",
    MEDIUM: "text-amber-600 font-semibold",
    HIGH: "text-orange-600 font-semibold",
    CRITICAL: "text-red-600 font-semibold",
  };
  return <span className={map[risk] ?? "text-gray-600"}>{risk}</span>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  accent = "blue",
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "blue" | "green" | "amber" | "red" | "purple";
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
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
    <div className="bg-white rounded-2xl border border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Flugfreigabe beantragen</p>
            <p className="text-xs text-gray-500">LUC Selbst-Autorisierungs-Engine testen</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Abflug Lat</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.pickupLat}
                  onChange={e => setForm(f => ({ ...f, pickupLat: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Abflug Lng</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.pickupLng}
                  onChange={e => setForm(f => ({ ...f, pickupLng: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ziel Lat</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.deliveryLat}
                  onChange={e => setForm(f => ({ ...f, deliveryLat: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ziel Lng</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.deliveryLng}
                  onChange={e => setForm(f => ({ ...f, deliveryLng: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Höhe AGL (m)</label>
                <input
                  type="number"
                  min="10"
                  max="600"
                  value={form.altitudeAgl}
                  onChange={e => setForm(f => ({ ...f, altitudeAgl: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Geplanter Zeitpunkt</label>
                <input
                  type="datetime-local"
                  value={form.requestedForDatetime}
                  onChange={e => setForm(f => ({ ...f, requestedForDatetime: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authorize.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {authorize.isPending ? "Prüfung läuft…" : "Freigabe beantragen"}
            </button>
          </form>

          {authorize.error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
              Fehler: {authorize.error.message}
            </div>
          )}

          {result && (
            <div className="mt-5 space-y-3">
              <div className={`p-4 rounded-xl border-2 ${
                result.decision === "approved"
                  ? "border-emerald-300 bg-emerald-50"
                  : result.decision === "rejected"
                  ? "border-red-300 bg-red-50"
                  : "border-amber-300 bg-amber-50"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.decision === "approved" && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                  {result.decision === "rejected" && <ShieldX className="w-5 h-5 text-red-600" />}
                  {result.decision === "escalated" && <ShieldAlert className="w-5 h-5 text-amber-600" />}
                  <span className={`font-bold text-base ${
                    result.decision === "approved" ? "text-emerald-700"
                    : result.decision === "rejected" ? "text-red-700"
                    : "text-amber-700"
                  }`}>
                    {result.decision === "approved" ? "FLUG FREIGEGEBEN"
                      : result.decision === "rejected" ? "FLUG ABGELEHNT"
                      : "ESKALIERT — Safety Manager erforderlich"}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{result.reason}</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">SAIL</p>
                  <p className="text-lg font-bold text-gray-900">{result.soraResult.sail}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">GRC</p>
                  <p className="text-lg font-bold text-gray-900">{result.soraResult.grc}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">ARC</p>
                  <p className="text-lg font-bold text-gray-900">{result.soraResult.arc.toUpperCase()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Wetter</p>
                  <p className={`text-sm font-bold ${
                    result.weatherResult.overallCondition === "safe" ? "text-emerald-600"
                    : result.weatherResult.overallCondition === "marginal" ? "text-amber-600"
                    : "text-red-600"
                  }`}>
                    {result.weatherResult.overallCondition === "safe" ? "OK"
                      : result.weatherResult.overallCondition === "marginal" ? "MARGINAL"
                      : "UNSAFE"}
                  </p>
                </div>
              </div>

              {(result.soraResult.riskFactors.length > 0 || result.weatherResult.allWarnings.length > 0) && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-2">Risikofaktoren</p>
                  <ul className="space-y-1">
                    {result.soraResult.riskFactors.map((f, i) => (
                      <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                        <span className="mt-0.5">•</span>{f}
                      </li>
                    ))}
                    {result.weatherResult.allWarnings.map((w, i) => (
                      <li key={`w-${i}`} className="text-xs text-amber-800 flex items-start gap-1.5">
                        <span className="mt-0.5">•</span>{w}
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Autorisierungs-Audit-Trail</h2>
        </div>
        <div className="flex gap-1.5">
          {(["approved", "rejected", "escalated"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilter(filter === d ? undefined : d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === d
                  ? d === "approved" ? "bg-emerald-600 text-white"
                    : d === "rejected" ? "bg-red-600 text-white"
                    : "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {d === "approved" ? "Freigegeben" : d === "rejected" ? "Abgelehnt" : "Eskaliert"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">Lade Autorisierungen…</div>
        ) : !data || data.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            Noch keine Autorisierungen vorhanden. Nutze das Formular oben, um eine zu erstellen.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Zeitpunkt</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Route</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">SAIL</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risiko</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Entscheid</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Von</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((auth) => (
                <tr key={auth.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                    {formatDateTime(auth.decidedAt)}
                  </td>
                  <td className="px-6 py-3 text-gray-700 font-mono text-xs">
                    {parseFloat(auth.pickupLat).toFixed(4)},{parseFloat(auth.pickupLng).toFixed(4)}
                    <span className="text-gray-400 mx-1">→</span>
                    {parseFloat(auth.deliveryLat).toFixed(4)},{parseFloat(auth.deliveryLng).toFixed(4)}
                  </td>
                  <td className="px-6 py-3 font-bold text-gray-900">{auth.sailLevel ?? "—"}</td>
                  <td className="px-6 py-3">
                    {auth.overallRisk ? <RiskBadge risk={auth.overallRisk} /> : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <DecisionBadge decision={auth.decision} />
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {auth.decisionBy === "system" ? "System (KI)" : "Safety Manager"}
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

// ─── Safety Occurrences ───────────────────────────────────────────────────────

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
    <div className="bg-white rounded-2xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Safety Occurrence Reports (SOR)</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {showForm ? "Abbrechen" : "+ Vorfall melden"}
        </button>
      </div>

      {showForm && (
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Titel</label>
              <input
                type="text"
                required
                minLength={5}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Kurze Beschreibung des Vorfalls"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Beschreibung</label>
              <textarea
                required
                minLength={10}
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Detaillierte Beschreibung, was geschehen ist…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Schweregrad</label>
                <select
                  value={form.severity}
                  onChange={e => setForm(f => ({ ...f, severity: e.target.value as typeof form.severity }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Gering</option>
                  <option value="medium">Mittel</option>
                  <option value="high">Hoch</option>
                  <option value="critical">Kritisch</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kategorie</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as typeof form.category }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {report.isPending ? "Wird gemeldet…" : "Vorfall einreichen"}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">Lade Vorfälle…</div>
        ) : !occurrences || occurrences.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            Keine gemeldeten Vorfälle — das ist gut!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Datum</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Titel</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategorie</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Schweregrad</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {occurrences.map((occ) => (
                <tr key={occ.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                    {formatDateTime(occ.reportedAt)}
                  </td>
                  <td className="px-6 py-3 text-gray-900 font-medium max-w-xs truncate">{occ.title}</td>
                  <td className="px-6 py-3 text-gray-600 capitalize">{occ.category}</td>
                  <td className="px-6 py-3">
                    <SeverityBadge severity={occ.severity} />
                  </td>
                  <td className="px-6 py-3">
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

// ─── Risk Heatmap (simplified visual) ─────────────────────────────────────────

function RiskHeatmap() {
  const { data } = trpc.safety.listAuthorizations.useQuery({ limit: 100 });

  // Count by risk level
  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  if (data) {
    for (const a of data) {
      const risk = a.overallRisk as keyof typeof counts;
      if (risk in counts) counts[risk]++;
    }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5 text-gray-400" />
        <h2 className="font-semibold text-gray-900">Risiko-Verteilung</h2>
        <span className="text-xs text-gray-400 ml-auto">{total} Flüge gesamt</span>
      </div>

      <div className="space-y-3">
        {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((level) => {
          const pct = total > 0 ? Math.round((counts[level] / total) * 100) : 0;
          const colors: Record<string, string> = {
            LOW: "bg-emerald-500",
            MEDIUM: "bg-amber-400",
            HIGH: "bg-orange-500",
            CRITICAL: "bg-red-600",
          };
          const labels: Record<string, string> = {
            LOW: "Niedriges Risiko",
            MEDIUM: "Mittleres Risiko",
            HIGH: "Hohes Risiko",
            CRITICAL: "Kritisches Risiko",
          };
          return (
            <div key={level}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">{labels[level]}</span>
                <span className="text-xs font-bold text-gray-900">{counts[level]} ({pct}%)</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${colors[level]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2 font-medium">Schweizer Operationsgebiete</p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Interlaken — Grindelwald", grc: 2 },
            { name: "Thun — Interlaken", grc: 3 },
            { name: "Spiez — Kandersteg", grc: 2 },
            { name: "Brienz — Meiringen", grc: 2 },
            { name: "Bern — Köniz", grc: 4 },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-1.5 text-xs bg-gray-50 rounded-lg px-2.5 py-1.5">
              <div className={`w-2 h-2 rounded-full ${c.grc <= 2 ? "bg-emerald-500" : c.grc === 3 ? "bg-amber-400" : "bg-orange-500"}`} />
              <span className="text-gray-600">{c.name}</span>
              <span className="text-gray-400">GRC {c.grc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <ExternalLink className="w-3.5 h-3.5" />
        <a
          href="https://www.skyguide.ch/services/aeronautical-information"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          Skyguide AIM — NOTAMs manuell prüfen
        </a>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function SafetyDashboard() {
  const { data: kpis, isLoading: kpisLoading } = trpc.safety.getKPIs.useQuery();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Flüge heute"
          value={kpisLoading ? "…" : (kpis?.todayCount ?? 0)}
          sub="Autorisierungsanfragen"
          icon={Plane}
          accent="blue"
        />
        <StatCard
          title="Genehmigungsrate"
          value={kpisLoading ? "…" : `${kpis?.approvalRate ?? 0}%`}
          sub={`${kpis?.approved ?? 0} von ${kpis?.totalAll ?? 0} gesamt`}
          icon={ShieldCheck}
          accent="green"
        />
        <StatCard
          title="Eskalationsrate"
          value={kpisLoading ? "…" : `${kpis?.escalationRate ?? 0}%`}
          sub={`${kpis?.escalated ?? 0} Safety Manager Überprüfungen`}
          icon={AlertTriangle}
          accent="amber"
        />
        <StatCard
          title="Offene Vorfälle"
          value={kpisLoading ? "…" : (kpis?.openOccurrences ?? 0)}
          sub="Safety Occurrences offen"
          icon={AlertCircle}
          accent={kpis && kpis.openOccurrences > 0 ? "red" : "green"}
        />
      </div>

      {/* LUC Info Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">LUC — Light UAS Operator Certificate</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Als LUC-Inhaber bewilligen wir Flüge selbst, ohne BAZL-Einzelgenehmigung.
              Das System prüft automatisch <strong>SORA SAIL</strong>, <strong>Wetter</strong> und <strong>NOTAMs</strong>.
              Alle Entscheidungen werden protokolliert und sind für BAZL-Audits verfügbar.
              <span className="ml-1 inline-flex items-center gap-1 text-amber-700 font-medium">
                <Clock className="w-3.5 h-3.5" />
                SAIL ≤ III → Auto-Freigabe · SAIL IV → Safety Manager · SAIL V/VI → Abgelehnt
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Authorization Tester */}
      <AuthorizationTester />

      {/* Two column: Heatmap + Authorizations */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskHeatmap />
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
