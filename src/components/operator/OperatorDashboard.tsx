"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { formatCHF } from "@/lib/pricing";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  ClipboardCheck,
} from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Entwurf", color: "bg-gray-100 text-gray-600" },
  pending: { label: "Ausstehend", color: "bg-yellow-100 text-yellow-700" },
  quoted: { label: "Angeboten", color: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Bestätigt", color: "bg-green-100 text-green-700" },
  in_progress: { label: "Im Flug", color: "bg-indigo-100 text-indigo-700" },
  completed: { label: "Abgeschlossen", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Storniert", color: "bg-red-100 text-red-600" },
};

type BookingStatus = "draft" | "pending" | "quoted" | "confirmed" | "in_progress" | "completed" | "cancelled";

export function OperatorDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | undefined>("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectBookingId, setRejectBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [operatorNotes, setOperatorNotes] = useState<Record<string, string>>({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const { data: bookings, isLoading, refetch } = trpc.operator.listBookings.useQuery({
    limit: 50,
    offset: 0,
    status: selectedStatus,
  });

  const approveMutation = trpc.operator.approveBooking.useMutation({
    onSuccess: () => refetch(),
    onError: () => {
      // Error is surfaced via approveMutation.error below the approve button
    },
  });
  const rejectMutation = trpc.operator.rejectBooking.useMutation({
    onSuccess: () => {
      setRejectBookingId(null);
      setRejectReason("");
      refetch();
    },
  });
  const updateNotesMutation = trpc.operator.updateNotes.useMutation({
    onSuccess: () => refetch(),
  });

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([undefined, "pending", "quoted", "confirmed", "completed", "cancelled"] as (BookingStatus | undefined)[]).map(
          (s) => (
            <button
              key={s ?? "all"}
              onClick={() => setSelectedStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedStatus === s
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s ? STATUS_LABELS[s]?.label : "Alle"}
            </button>
          )
        )}
      </div>

      {!bookings?.length ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          Keine Buchungen in diesem Status.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isExpanded = expandedId === booking.id;
            const statusCfg = STATUS_LABELS[booking.status] ?? STATUS_LABELS.pending;
            const paymentUrl = (booking.metadata as Record<string, unknown> | null)?.stripePaymentUrl as string | null;

            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Header row */}
                <div
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-gray-500">
                          {booking.identifier}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="font-semibold text-gray-900 truncate">
                        {booking.customer
                          ? `${booking.customer.firstName ?? ""} ${booking.customer.lastName ?? ""}`.trim() ||
                            booking.customer.email
                          : "—"}
                      </div>
                      <div className="text-sm text-gray-500 flex gap-3 mt-0.5 flex-wrap">
                        <span>
                          {format(new Date(booking.requestedDate), "d. MMM yyyy", { locale: de })}
                        </span>
                        <span>·</span>
                        <span>{booking.serviceType}</span>
                        <span>·</span>
                        <span>{booking.payloadWeightKg} kg</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {booking.totalCHF && (
                      <span className="font-bold text-lg text-gray-900">
                        {formatCHF(parseFloat(booking.totalCHF))}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded detail view */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-6 space-y-6">
                    {/* Booking details grid */}
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Lieferadresse</span>
                        <p className="font-medium text-gray-900">{booking.deliveryAddress ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Abflugoption</span>
                        <p className="font-medium text-gray-900">{booking.pickupOption}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Nutzlast</span>
                        <p className="font-medium text-gray-900">{booking.payloadWeightKg} kg</p>
                        {booking.payloadDescription && (
                          <p className="text-gray-500">{booking.payloadDescription}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Gefahrgut</span>
                        <p className="font-medium text-gray-900">
                          {booking.isDangerousGoods ? "JA — Gefahrgut!" : "Nein"}
                        </p>
                      </div>
                      {booking.customerNotes && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">Kundennotiz</span>
                          <p className="font-medium text-gray-900">{booking.customerNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Payment URL if exists */}
                    {paymentUrl && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-blue-600 mb-1">STRIPE ZAHLUNGSLINK</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-800 truncate flex-1">{paymentUrl}</span>
                          <button
                            onClick={() => copyToClipboard(paymentUrl)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 flex-shrink-0"
                          >
                            {copiedUrl === paymentUrl ? (
                              <ClipboardCheck className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            {copiedUrl === paymentUrl ? "Kopiert!" : "Kopieren"}
                          </button>
                          <a
                            href={paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Öffnen
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Operator notes textarea */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operator-Notizen
                      </label>
                      <textarea
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Interne Notizen zur Buchung..."
                        defaultValue={booking.operatorNotes ?? ""}
                        onChange={(e) =>
                          setOperatorNotes((prev) => ({ ...prev, [booking.id]: e.target.value }))
                        }
                      />
                      <button
                        onClick={() =>
                          updateNotesMutation.mutate({
                            bookingId: booking.id,
                            operatorNotes: operatorNotes[booking.id] ?? booking.operatorNotes ?? "",
                          })
                        }
                        className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                      >
                        Notizen speichern
                      </button>
                    </div>

                    {/* Actions */}
                    {booking.status === "pending" && (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              approveMutation.mutate({
                                bookingId: booking.id,
                                operatorNotes: operatorNotes[booking.id] ?? booking.operatorNotes ?? undefined,
                              })
                            }
                            disabled={approveMutation.isPending}
                            className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {approveMutation.isPending ? "Wird genehmigt..." : "Genehmigen & Zahlungslink senden"}
                          </button>
                          <button
                            onClick={() => setRejectBookingId(booking.id)}
                            className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 border border-red-200 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Ablehnen
                          </button>
                        </div>
                        {approveMutation.error && (
                          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700">{approveMutation.error.message}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reject dialog */}
                    {rejectBookingId === booking.id && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                        <p className="text-sm font-semibold text-red-700">Buchung ablehnen</p>
                        <textarea
                          rows={2}
                          className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                          placeholder="Grund für die Ablehnung..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              rejectMutation.mutate({
                                bookingId: booking.id,
                                reason: rejectReason,
                              })
                            }
                            disabled={!rejectReason.trim() || rejectMutation.isPending}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            {rejectMutation.isPending ? "Wird abgelehnt..." : "Ablehnen bestätigen"}
                          </button>
                          <button
                            onClick={() => {
                              setRejectBookingId(null);
                              setRejectReason("");
                            }}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
