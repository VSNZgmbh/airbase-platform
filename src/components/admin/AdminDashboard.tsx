"use client";

import { trpc } from "@/lib/trpc/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Package,
  TrendingUp,
  Plane,
  FileText,
  AlertCircle,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  draft: "Entwurf",
  pending: "Ausstehend",
  quoted: "Angeboten",
  confirmed: "Bestätigt",
  in_progress: "In Bearbeitung",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
};

const SERVICE_LABELS: Record<string, string> = {
  LASTENFLUG: "Lastenflug",
  PERSONENFLUG: "Personenflug",
  INSPEKTION: "Inspektion",
};

const CHART_COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#16a34a", "#d97706", "#dc2626"];

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
  accent?: "blue" | "green" | "purple" | "amber" | "red";
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
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

export function AdminDashboard() {
  const overviewQ = trpc.analytics.overview.useQuery();
  const timelineQ = trpc.analytics.bookingsOverTime.useQuery({ days: 90 });
  const routesQ = trpc.analytics.popularRoutes.useQuery();
  const serviceQ = trpc.analytics.serviceTypeBreakdown.useQuery();
  const payloadQ = trpc.analytics.avgPayloadWeight.useQuery();

  const isLoading =
    overviewQ.isLoading || timelineQ.isLoading || serviceQ.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 h-28" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 h-72" />
      </div>
    );
  }

  const ov = overviewQ.data;
  const timeline = timelineQ.data ?? [];
  const routes = routesQ.data ?? [];
  const services = serviceQ.data ?? [];
  const payload = payloadQ.data;

  const statusPieData = Object.entries(ov?.bookingsByStatus ?? {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: STATUS_LABELS[k] ?? k, value: v }));

  const serviceBarData = services.map((s) => ({
    name: SERVICE_LABELS[s.serviceType] ?? s.serviceType,
    Buchungen: s.count,
    "Umsatz (CHF)": Math.round(s.revenue),
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Buchungen gesamt"
          value={ov?.totalBookings ?? 0}
          icon={Package}
          accent="blue"
        />
        <StatCard
          title="Umsatz abgeschlossen"
          value={`CHF ${(ov?.totalRevenueCHF ?? 0).toLocaleString("de-CH", { minimumFractionDigits: 0 })}`}
          icon={TrendingUp}
          accent="green"
        />
        <StatCard
          title="Flüge abgeschlossen"
          value={`${ov?.completedFlights ?? 0} / ${ov?.totalFlights ?? 0}`}
          sub="abgeschlossen / gesamt"
          icon={Plane}
          accent="purple"
        />
        <StatCard
          title="Ø Nutzlast"
          value={payload ? `${payload.avg} kg` : "—"}
          sub={payload ? `Min ${payload.min} kg · Max ${payload.max} kg` : undefined}
          icon={Package}
          accent="amber"
        />
        <StatCard
          title="Offene Rechnungen"
          value={ov?.unpaidInvoicesCount ?? 0}
          sub={
            ov?.unpaidInvoicesTotalCHF
              ? `CHF ${ov.unpaidInvoicesTotalCHF.toLocaleString("de-CH")}`
              : undefined
          }
          icon={FileText}
          accent={ov && ov.unpaidInvoicesCount > 0 ? "red" : "green"}
        />
      </div>

      {/* Bookings Over Time */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Buchungen & Umsatz (letzte 90 Tage)
        </h2>
        {timeline.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2">
            <AlertCircle className="w-4 h-4" />
            Noch keine Daten vorhanden
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}.${d.getMonth() + 1}.`;
                }}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(v) => `${v} CHF`}
              />
              <Tooltip
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                labelFormatter={(l) => new Date(l).toLocaleDateString("de-CH")}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                name="Buchungen"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                name="Umsatz (CHF)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Booking Status Pie */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Buchungen nach Status
          </h2>
          {statusPieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2">
              <AlertCircle className="w-4 h-4" />
              Keine Buchungen vorhanden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {statusPieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Service Type Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Buchungen nach Leistungsart
          </h2>
          {serviceBarData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2">
              <AlertCircle className="w-4 h-4" />
              Keine Buchungen vorhanden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={serviceBarData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Buchungen" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Popular Routes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Häufigste Lieferadressen
        </h2>
        {routes.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-gray-400 text-sm gap-2">
            <AlertCircle className="w-4 h-4" />
            Keine Daten vorhanden
          </div>
        ) : (
          <div className="space-y-2">
            {routes.map((route, i) => {
              const maxCount = routes[0]?.count ?? 1;
              const pct = Math.round((route.count / maxCount) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-400 w-5 text-right">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 truncate">
                        {route.address}
                      </span>
                      <span className="text-xs font-semibold text-gray-500 ml-2 flex-shrink-0">
                        {route.count}×
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
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
