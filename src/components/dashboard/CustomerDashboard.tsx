"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { formatCHF } from "@/lib/pricing";
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
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Entwurf",
    color: "text-gray-600",
    bgColor: "bg-gray-50 border-gray-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  pending: {
    label: "In Pr\u00fcfung",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  quoted: {
    label: "Angeboten",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  confirmed: {
    label: "Best\u00e4tigt",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
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
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
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
  { name: "Lastenflug", desc: "G\u00fctertransport per Drohne", icon: Package, color: "from-blue-500 to-indigo-600" },
  { name: "Berglogistik", desc: "H\u00fcttenversorgung & Alpintransport", icon: Mountain, color: "from-emerald-500 to-teal-600" },
  { name: "Notfalltransport", desc: "Medizin & Ersthilfe-Material", icon: Heart, color: "from-red-500 to-rose-600" },
  { name: "Solarpanel-Reinigung", desc: "Wartung aus der Luft", icon: Sun, color: "from-amber-500 to-yellow-600" },
  { name: "Express-Ersatzteile", desc: "Heute bestellt, morgen geliefert", icon: Zap, color: "from-violet-500 to-purple-600" },
  { name: "Saatgut-Ausbringung", desc: "Pr\u00e4zisions-Landwirtschaft", icon: Sprout, color: "from-green-500 to-emerald-600" },
  { name: "Baumaterial-Lieferung", desc: "Baustoffe an schwer zug\u00e4ngliche Orte", icon: HardHat, color: "from-orange-500 to-amber-600" },
  { name: "Inspektionsfl\u00fcge", desc: "Infrastruktur & Gel\u00e4nde", icon: Search, color: "from-cyan-500 to-blue-600" },
];

// ─── Timeline Step ────────────────────────────────────────────────────────────

function TimelineStep({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full border-2 transition-all ${
          done
            ? "bg-emerald-500 border-emerald-500"
            : active
            ? "bg-white border-brand-500 ring-4 ring-brand-100"
            : "bg-white border-gray-300"
        }`}
      />
      <span className={`text-xs font-medium ${done ? "text-emerald-600" : active ? "text-brand-600" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}

function StatusTimeline({ status }: { status: string }) {
  const steps = ["Gebucht", "In Pr\u00fcfung", "Best\u00e4tigt", "Im Flug", "Zugestellt"];
  const statusIndex: Record<string, number> = {
    draft: 0,
    pending: 1,
    quoted: 1,
    confirmed: 2,
    in_progress: 3,
    completed: 4,
    cancelled: -1,
  };
  const current = statusIndex[status] ?? 0;

  if (status === "cancelled") return null;

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <TimelineStep label={step} active={i === current} done={i < current} />
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-1 ${i < current ? "bg-emerald-400" : "bg-gray-200"}`} />
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
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
      <Leaf className="w-3 h-3" />
      {saved} kg CO\u2082 gespart vs. LKW
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function CustomerDashboard() {
  const { data, isLoading, error } = trpc.booking.myBookings.useQuery({
    limit: 20,
    offset: 0,
  });

  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Service cards skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-2 bg-gray-50 rounded w-full" />
            </div>
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
            <div className="h-3 bg-gray-50 rounded w-1/2" />
          </div>
        ))}
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

  return (
    <div className="space-y-8">
      {/* One-Click Ordering — Service Types */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Heute bestellen, morgen fliegen</h2>
            <p className="text-sm text-gray-500">W\u00e4hlen Sie einen Service f\u00fcr Ihre n\u00e4chste Drohnenlieferung</p>
          </div>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-brand-500/20 transition-all"
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
              className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200 transition-all"
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
      {!data?.bookings.length ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-50 to-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Package className="w-10 h-10 text-brand-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2">Noch keine Buchungen</h3>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            Buchen Sie Ihren ersten Drohnenflug \u2014 w\u00e4hlen Sie oben einen Service oder nutzen Sie den Buchungsassistenten.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all text-base"
          >
            <Plane className="w-5 h-5" />
            Ersten Flug buchen
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Meine Buchungen</h2>
            {/* Status filters */}
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
            {data.bookings
              .filter((b) => !activeFilter || b.status === activeFilter)
              .map((booking) => {
                const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 transition-all group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Package className="w-7 h-7 text-brand-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5 mb-1">
                              <span className="font-mono text-sm font-bold text-gray-400">
                                {booking.identifier}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.bgColor} ${status.color}`}
                              >
                                {status.icon}
                                {status.label}
                              </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-base">
                              {booking.serviceType === "LASTENFLUG" ? "Lastenflug" : booking.serviceType}
                              {booking.serviceSubtype === "EINMALIGE_LIEFERUNG"
                                ? " \u2014 Einmalige Lieferung"
                                : booking.serviceSubtype === "LANGZEIT_EINSATZ"
                                ? " \u2014 Langzeit-Einsatz"
                                : ""}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {format(new Date(booking.requestedDate), "d. MMM yyyy", { locale: de })}{" "}
                                {booking.requestedTimeFrom} Uhr
                              </span>
                              <span className="text-gray-300">\u00b7</span>
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

                      {/* Status Timeline */}
                      {booking.status !== "cancelled" && booking.status !== "draft" && (
                        <div className="mt-5 pt-4 border-t border-gray-50">
                          <StatusTimeline status={booking.status} />
                        </div>
                      )}

                      {/* Emissions Badge */}
                      {booking.status === "completed" && booking.routeDistanceKm && (
                        <div className="mt-3">
                          <EmissionsBadge distanceKm={parseFloat(booking.routeDistanceKm)} />
                        </div>
                      )}
                    </div>

                    {/* Live tracking indicator for in-progress flights */}
                    {booking.status === "in_progress" && (
                      <div className="bg-gradient-to-r from-brand-50 to-blue-50 border-t border-brand-100 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-600" />
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
      )}

      {/* Emissions Summary */}
      {data?.bookings && data.bookings.some((b) => b.status === "completed") && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Ihr Nachhaltigkeits-Beitrag</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Durch Drohnenlieferungen statt konventioneller Strassentransporte haben Sie bisher{" "}
                <strong className="text-emerald-700">
                  {(() => {
                    const totalKm = data.bookings
                      .filter((b) => b.status === "completed" && b.routeDistanceKm)
                      .reduce((sum, b) => sum + parseFloat(b.routeDistanceKm ?? "0"), 0);
                    return `${Math.round(totalKm * 0.12 * 10) / 10} kg CO\u2082`;
                  })()}
                </strong>{" "}
                eingespart. Jede Drohnenlieferung ist 100% elektrisch und emissionsfrei.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
