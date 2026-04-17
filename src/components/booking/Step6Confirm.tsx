"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { CheckCircle2, ChevronLeft, Loader2, LogIn } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { formatCHF, calculatePrice, type PickupOption } from "@/lib/pricing";
import type { BookingData } from "./BookingWizard";
import type { CreateBookingInput } from "@/lib/validations";

interface Props {
  data: BookingData;
  onBack: () => void;
}

export function Step6Confirm({ data, onBack }: Props) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const routeDistanceKm = 10;
  const price = calculatePrice({
    routeDistanceKm,
    payloadWeightKg: data.payloadWeightKg ?? 0,
    pickupOption: (data.pickupOption ?? "CUSTOMER_LOCATION") as PickupOption,
    pickupDistanceFromHubKm: 5,
  });

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: (booking) => {
      setBookingId(booking.id);
      setSubmitted(true);
    },
  });

  const handleSubmit = () => {
    if (!accepted || !user) return;

    createBooking.mutate({
      serviceType: data.serviceType ?? "LASTENFLUG",
      serviceSubtype: data.serviceSubtype,
      requestedDate: data.requestedDate ?? "",
      requestedTimeFrom: data.requestedTimeFrom ?? "",
      requestedTimeTo: data.requestedTimeTo,
      payloadWeightKg: data.payloadWeightKg ?? 0,
      payloadDescription: data.payloadDescription,
      isDangerousGoods: data.isDangerousGoods ?? false,
      deliveryLat: data.deliveryLat ?? 0,
      deliveryLng: data.deliveryLng ?? 0,
      deliveryAddress: data.deliveryAddress ?? "",
      pickupOption: data.pickupOption ?? "CUSTOMER_LOCATION",
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      pickupAddress: data.pickupAddress,
      hubId: data.hubId,
      customerNotes: notes || undefined,
    } as CreateBookingInput);
  };

  // Success screen
  if (submitted) {
    return (
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Buchung erfolgreich!
        </h2>
        <p className="text-gray-600 mb-2">
          Ihre Buchungsanfrage wurde übermittelt.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Wir prüfen Ihre Anfrage und melden uns innerhalb von 24 Stunden mit
          einer Auftragsbestätigung.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors"
          >
            Meine Buchungen
          </button>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Buchung abschliessen
      </h2>
      <p className="text-gray-500 mb-8">
        {user
          ? "Überprüfen Sie Ihre Angaben und senden Sie die Buchungsanfrage ab."
          : "Bitte melden Sie sich an, um die Buchung abzuschliessen."}
      </p>

      {!user ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-brand-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Anmeldung erforderlich
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Um Buchungen aufzugeben und zu verwalten, benötigen Sie ein
            Airbase-Konto.
          </p>
          <SignInButton mode="modal">
            <button className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors">
              <LogIn className="w-4 h-4" />
              Anmelden / Registrieren
            </button>
          </SignInButton>
        </div>
      ) : (
        <>
          {/* User info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-xs font-medium text-gray-500 mb-1">BUCHER</div>
            <div className="font-semibold text-gray-900">
              {user.fullName ?? user.primaryEmailAddress?.emailAddress}
            </div>
            <div className="text-sm text-gray-500">
              {user.primaryEmailAddress?.emailAddress}
            </div>
          </div>

          {/* Price confirmation */}
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-brand-700">Gesamtbetrag</div>
                <div className="text-xs text-brand-600">inkl. {price.vatPercent}% MwSt.</div>
              </div>
              <div className="text-2xl font-bold text-brand-700">
                {formatCHF(price.total)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bemerkungen (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Besondere Anforderungen, Zugangsinformationen, etc."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-400 focus:outline-none resize-none text-sm"
            />
          </div>

          {/* Accept terms */}
          <div className="mb-8">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-600">
                Ich akzeptiere die{" "}
                <a href="/agb" className="text-brand-600 hover:underline">
                  Allgemeinen Geschäftsbedingungen
                </a>{" "}
                und{" "}
                <a href="/datenschutz" className="text-brand-600 hover:underline">
                  Datenschutzerklärung
                </a>{" "}
                von Airbase.
              </span>
            </label>
          </div>

          {createBooking.error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-sm text-red-700">
              Fehler: {createBooking.error.message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={createBooking.isPending}
              className="flex items-center gap-2 px-6 py-4 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Zurück
            </button>
            <button
              type="button"
              disabled={!accepted || createBooking.isPending}
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold py-4 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Buchung abschicken
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
