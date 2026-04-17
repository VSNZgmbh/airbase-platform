"use client";

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
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Entwurf",
    color: "bg-gray-100 text-gray-600",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  pending: {
    label: "In Prüfung",
    color: "bg-yellow-100 text-yellow-700",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  quoted: {
    label: "Angeboten",
    color: "bg-blue-100 text-blue-700",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  confirmed: {
    label: "Bestätigt",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  in_progress: {
    label: "Im Flug",
    color: "bg-brand-100 text-brand-700",
    icon: <Plane className="w-3.5 h-3.5" />,
  },
  completed: {
    label: "Abgeschlossen",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "Storniert",
    color: "bg-red-100 text-red-600",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

export function CustomerDashboard() {
  const { data, isLoading, error } = trpc.booking.myBookings.useQuery({
    limit: 20,
    offset: 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-700">
        Fehler beim Laden der Buchungen: {error.message}
      </div>
    );
  }

  if (!data?.bookings.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-brand-500" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">
          Noch keine Buchungen
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Buchen Sie Ihren ersten Drohnenflug und tracken Sie ihn hier.
        </p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Jetzt buchen
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.bookings.map((booking) => {
        const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
        return (
          <div
            key={booking.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-gray-500">
                      {booking.identifier}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${status.color}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {booking.serviceType === "LASTENFLUG" ? "LASTENFLUG" : booking.serviceType}
                    {booking.serviceSubtype === "EINMALIGE_LIEFERUNG"
                      ? " — Einmalige Lieferung"
                      : booking.serviceSubtype === "LANGZEIT_EINSATZ"
                      ? " — Langzeit-Einsatz"
                      : ""}
                  </h3>
                  <div className="text-sm text-gray-500 mt-1 space-x-3">
                    <span>
                      {format(new Date(booking.requestedDate), "d. MMM yyyy", {
                        locale: de,
                      })}{" "}
                      {booking.requestedTimeFrom} Uhr
                    </span>
                    <span>·</span>
                    <span>{booking.payloadWeightKg} kg</span>
                  </div>
                  {booking.deliveryAddress && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      → {booking.deliveryAddress}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {booking.totalCHF && (
                  <div className="font-bold text-lg text-gray-900">
                    {formatCHF(parseFloat(booking.totalCHF))}
                  </div>
                )}
                <Link
                  href={`/dashboard/${booking.id}`}
                  className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 mt-1"
                >
                  Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
