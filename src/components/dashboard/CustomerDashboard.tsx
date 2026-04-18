"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { formatCHF } from "@/lib/pricing";
import { DEMO_BOOKINGS } from "@/lib/demo-data";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plane,
  ArrowRight,
  Plus,
  MapPin,
  Leaf,
  Truck,
  Mountain,
  Sun,
  Zap,
  Heart,
  Wrench,
  Search,
  Sprout,
  HardHat,
  Eye,
  Activity,
  TrendingUp,
  Navigation,
} from "lucide-react";

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{prefix}{display.toLocaleString("de-CH")}{suffix}</span>;
}

// ─── Status Config ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Entwurf",
    color: "text-gray-500",
    bgColor: "bg-gray-50 border-gray-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  pending: {
    label: "In Prüfung",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  quoted: {
    label: "Angeboten",
    color: "text-brand-600",
    bgColor: "bg-brand-50 border-brand-200",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  confirmed: {
    label: "Bestätigt",
    color: "text-brand-700",
    bgColor: "bg-brand-50 border-brand-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  in_progress: {
    label: "Im Flug",
    color: "text-brand-700",
    bgColor: "bg-brand-50 border-brand-200",
    icon: <Plane className="w-3.5 h-3.5" />,
  },
  completed: {
    label: "Abgeschlossen",
    color: "text-gray-600",
    bgColor: "bg-gray-50 border-gray-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "Storniert",
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

// ─── Service Types ────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { name: "Lastenflug", desc: "Gütertransport per Drohne", icon: Package, color: "from-brand-500 to-brand-700" },
  { name: "Berglogistik", desc: "Hüttenversorgung & Alpintransport", icon: Mountain, color: "from-brand-400 to-brand-600" },
  { name: "Notfalltransport", desc: "Medizin & Ersthilfe-Material", icon: Heart, color: "from-brand-600 to-brand-800" },
  { name: "Solarpanel-Reinigung", desc: "Wartung aus der Luft", icon: Sun, color: "from-brand-500 to-brand-700" },
  { name: "Express-Ersatzteile", desc: "Heute bestellt, morgen geliefert", icon: Zap, color: "from-brand-400 to-brand-600" },
  { name: "Saatgut-Ausbringung", desc: "Präzisions-Landwirtschaft", icon: Sprout, color: "from-brand-600 to-brand-800" },
  { name: "Baumaterial-Lieferung", desc: "Baustoffe an schwer zugängliche Orte", icon: HardHat, color: "from-brand-500 to-brand-700" },
  { name: "Inspektionsflüge", desc: "Infrastruktur & Gelände", icon: Search, color: "from-brand-400 to-brand-600" },
];

// ─── Timeline Step ────────────────────────────────────────────────────────────

function TimelineStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full border-2 transition-all ${
          done
            ? "bg-brand-500 border-brand-500"
            : active
            ? "bg-white border-brand-500 ring-4 ring-brand-100"
            : "bg-white border-gray-300"
        }`}
      />
      <span className={`text-xs font-medium ${done ? "text-brand-600" : active ? "text-brand-600" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}

function StatusTimeline({ status }: { status: string }) {
  const steps = ["Gebucht", "In Prüfung", "Bestätigt", "Im Flug", "Zugestellt"];
  const statusIndex: Record<string, number> = { draft: 0, pending: 1, quoted: 1, confirmed: 2, in_progress: 3, completed: 4, cancelled: -1 };
  const current = statusIndex[status] ?? 0;
  if (status === "cancelled") return null;

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <TimelineStep label={step} active={i === current} done={i < current} />
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-1 ${i < current ? "bg-brand-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Emissions Badge ──────────────────────────────────────────────────────────

function EmissionsBadge({ distanceKm }: { distanceKm?: number }) {
  const saved = distanceKm ? Math.round(distanceKm * 0.12 * 10) / 10 : 0;
  if (!saved) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold">
      <Leaf className="w-3 h-3 text-brand-500" />
      {saved} kg CO₂ gespart vs. LKW
    </div>
  );
}

// ─── Live Flight Tracker ─────────────────────────────────────────────────────

function LiveFlightTracker() {
  const activeFlights = DEMO_BOOKINGS.filter((b) => b.status === "in_progress");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
            <Navigation className="w-4.5 h-4.5 text-brand-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Live Tracking</h3>
            <p className="text-xs text-gray-400">{activeFlights.length} Drohne{activeFlights.length !== 1 ? "n" : ""} aktiv</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
          </span>
          <span className="text-xs font-semibold text-brand-600">LIVE</span>
        </div>
      </div>
      <div className="space-y-3">
        {activeFlights.map((flight) => (
          <div key={flight.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{flight.identifier}</p>
                <p className="text-xs text-gray-500">{flight.droneName} — {flight.pilotName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-gray-400">{flight.pickupAddress?.split(",")[0]} → {flight.deliveryAddress?.split(",")[0]}</p>
              <p className="text-xs text-brand-600 font-semibold mt-0.5">In der Luft</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── KPI Summary ─────────────────────────────────────────────────────────────

function KPISummary() {
  const completed = DEMO_BOOKINGS.filter((b) => b.status === "completed").length;
  const active = DEMO_BOOKINGS.filter((b) => b.status === "in_progress").length;
  const totalRevenue = DEMO_BOOKINGS.filter((b) => b.status === "completed").reduce((sum, b) => sum + parseFloat(b.totalCHF), 0);
  const totalDistance = DEMO_BOOKINGS.filter((b) => b.status === "completed").reduce((sum, b) => sum + parseFloat(b.routeDistanceKm), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Aktive Flüge", value: active, icon: Plane, accent: true },
        { label: "Abgeschlossen", value: completed, icon: CheckCircle2, accent: false },
        { label: "Gesamtumsatz", value: totalRevenue, prefix: "CHF ", icon: TrendingUp, accent: false },
        { label: "Km geflogen", value: Math.round(totalDistance), icon: Activity, accent: false },
      ].map((kpi) => (
        <div key={kpi.label} className={`rounded-2xl border p-5 ${kpi.accent ? "bg-brand-500 border-brand-500" : "bg-white border-gray-100 shadow-sm"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${kpi.accent ? "text-white/80" : "text-gray-400"}`}>{kpi.label}</span>
            <kpi.icon className={`w-4 h-4 ${kpi.accent ? "text-white/60" : "text-brand-400"}`} />
          </div>
          <p className={`text-2xl font-bold ${kpi.accent ? "text-white" : "text-gray-900"}`}>
            <AnimatedNumber value={kpi.value} prefix={kpi.prefix ?? ""} />
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Recent Activity Chart ───────────────────────────────────────────────────

function ActivityChart() {
  const chartData = [
    { day: "Mo", flüge: 3 }, { day: "Di", flüge: 5 }, { day: "Mi", flüge: 2 },
    { day: "Do", flüge: 7 }, { day: "Fr", flüge: 4 }, { day: "Sa", flüge: 1 }, { day: "So", flüge: 0 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
            <Activity className="w-4.5 h-4.5 text-brand-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Flugaktivität</h3>
            <p className="text-xs text-gray-400">Diese Woche</p>
          </div>
        </div>
      </div>
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="custActivityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D32F2F" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#D32F2F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #f3f4f6", borderRadius: "12px", fontSize: "12px", color: "#1f2937", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
              formatter={(value) => [`${value} Flüge`, ""]}
            />
            <Area type="monotone" dataKey="flüge" stroke="#D32F2F" strokeWidth={2} fill="url(#custActivityGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function CustomerDashboard() {
  const { data, isLoading, error } = trpc.booking.myBookings.useQuery({ limit: 20, offset: 0 });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Use demo data when API returns empty
  const bookings = data?.bookings?.length ? data.bookings : null;
  const useDemo = !isLoading && !error && !bookings;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-2 bg-gray-50 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-red-700">
        Fehler beim Laden der Buchungen: {error.message}
      </div>
    );
  }

  const displayBookings = useDemo ? DEMO_BOOKINGS : (bookings ?? []);

  return (
    <div className="space-y-8">
      {/* KPI Summary */}
      {useDemo && <KPISummary />}

      {/* Live Tracker + Activity Chart (2 columns) */}
      {useDemo && (
        <div className="grid lg:grid-cols-2 gap-6">
          <LiveFlightTracker />
          <ActivityChart />
        </div>
      )}

      {/* One-Click Ordering — Service Types */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Heute bestellen, morgen fliegen</h2>
            <p className="text-sm text-gray-500">Wählen Sie einen Service für Ihre nächste Drohnenlieferung</p>
          </div>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Jetzt buchen
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVICE_TYPES.map((service) => (
            <Link
              key={service.name}
              href="/book"
              className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-brand-200 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <service.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{service.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{service.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Bookings Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Meine Buchungen</h2>
          <div className="flex gap-1.5">
            {["pending", "confirmed", "in_progress", "completed"].map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => setActiveFilter(activeFilter === s ? null : s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    activeFilter === s
                      ? `${cfg.bgColor} ${cfg.color}`
                      : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {displayBookings
            .filter((b) => !activeFilter || b.status === activeFilter)
            .map((booking) => {
              const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-7 h-7 text-brand-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 mb-1">
                            <span className="font-mono text-sm font-bold text-gray-400">
                              {booking.identifier}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.bgColor} ${status.color}`}>
                              {status.icon}
                              {status.label}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-base">
                            {booking.serviceType === "LASTENFLUG" ? "Lastenflug" :
                             booking.serviceType === "BERGLOGISTIK" ? "Berglogistik" :
                             booking.serviceType === "SOLARPANEL_REINIGUNG" ? "Solarpanel-Reinigung" :
                             booking.serviceType === "BAUMATERIAL" ? "Baumaterial-Lieferung" :
                             booking.serviceType === "NOTFALLTRANSPORT" ? "Notfalltransport" :
                             booking.serviceType === "SAATGUT" ? "Saatgut-Ausbringung" :
                             booking.serviceType === "EXPRESS_ERSATZTEILE" ? "Express-Ersatzteile" :
                             booking.serviceType === "INSPEKTION" ? "Inspektionsflug" :
                             booking.serviceType}
                            {booking.serviceSubtype === "EINMALIGE_LIEFERUNG" ? " — Einmalige Lieferung" :
                             booking.serviceSubtype === "LANGZEIT_EINSATZ" ? " — Langzeit-Einsatz" : ""}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(booking.requestedDate), "d. MMM yyyy", { locale: de })}{" "}
                              {booking.requestedTimeFrom} Uhr
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" />
                              {booking.payloadWeightKg} kg
                            </span>
                          </div>
                          {booking.deliveryAddress && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {booking.deliveryAddress}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {booking.totalCHF && (
                          <div className="font-bold text-xl text-gray-900">
                            {formatCHF(parseFloat(booking.totalCHF))}
                          </div>
                        )}
                        <Link
                          href={`/dashboard/${booking.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 mt-2 group-hover:gap-2.5 transition-all"
                        >
                          Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {booking.status !== "cancelled" && booking.status !== "draft" && (
                      <div className="mt-5 pt-4 border-t border-gray-50">
                        <StatusTimeline status={booking.status} />
                      </div>
                    )}

                    {booking.status === "completed" && booking.routeDistanceKm && (
                      <div className="mt-3">
                        <EmissionsBadge distanceKm={parseFloat(booking.routeDistanceKm)} />
                      </div>
                    )}
                  </div>

                  {booking.status === "in_progress" && (
                    <div className="bg-brand-50 border-t border-brand-100 px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
                        </span>
                        <span className="text-sm font-semibold text-brand-700">Drohne im Flug</span>
                      </div>
                      <Link
                        href={`/dashboard/${booking.id}`}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Live verfolgen
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Emissions Summary */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Ihr Nachhaltigkeits-Beitrag</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Durch Drohnenlieferungen statt konventioneller Strassentransporte haben Sie bisher{" "}
              <strong className="text-brand-600">
                {(() => {
                  const totalKm = (useDemo ? DEMO_BOOKINGS : (data?.bookings ?? []))
                    .filter((b) => b.status === "completed" && b.routeDistanceKm)
                    .reduce((sum, b) => sum + parseFloat(b.routeDistanceKm ?? "0"), 0);
                  return `${Math.round(totalKm * 0.12 * 10) / 10} kg CO₂`;
                })()}
              </strong>{" "}
              eingespart. Jede Drohnenlieferung ist 100% elektrisch und emissionsfrei.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
