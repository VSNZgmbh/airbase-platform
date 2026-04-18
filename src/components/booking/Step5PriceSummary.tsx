"use client";

import { ChevronRight, ChevronLeft, Package, MapPin, Calendar, Scale } from "lucide-react";
import { calculatePrice, formatCHF, type PickupOption } from "@/lib/pricing";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { BookingData } from "./BookingWizard";

interface Props {
  data: BookingData;
  onNext: () => void;
  onBack: () => void;
}

const SERVICE_LABELS: Record<string, string> = {
  LASTENFLUG: "LASTENFLUG",
};

const SUBTYPE_LABELS: Record<string, string> = {
  EINMALIGE_LIEFERUNG: "Einmalige Lieferung",
  LANGZEIT_EINSATZ: "Langzeit-Einsatz",
};

const PICKUP_LABELS: Record<string, string> = {
  CUSTOMER_LOCATION: "Kundeneigener Abflugort (Option A)",
  VOLTAIR_HUB: "AIRBASE Hub (Option B)",
  CUSTOM_PICKUP: "Individueller Abflugort (Option C)",
};

export function Step5PriceSummary({ data, onNext, onBack }: Props) {
  const routeDistanceKm = data.routeDistanceKm ?? 10;

  const price = calculatePrice({
    routeDistanceKm,
    payloadWeightKg: data.payloadWeightKg ?? 0,
    pickupOption: (data.pickupOption ?? "CUSTOMER_LOCATION") as PickupOption,
    pickupDistanceFromHubKm: 5, // placeholder for Option C hub surcharge
  });

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Ihr Angebot</h2>
      <p className="text-gray-500 mb-8">
        Prüfen Sie Ihre Angaben und den berechneten Preis.
      </p>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
            <Package className="w-3.5 h-3.5" />
            LEISTUNG
          </div>
          <div className="font-semibold text-gray-900">
            {SERVICE_LABELS[data.serviceType ?? ""] ?? data.serviceType}
          </div>
          <div className="text-sm text-gray-600">
            {SUBTYPE_LABELS[data.serviceSubtype ?? ""] ?? data.serviceSubtype}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            DATUM & UHRZEIT
          </div>
          <div className="font-semibold text-gray-900">
            {data.requestedDate
              ? format(new Date(data.requestedDate), "d. MMMM yyyy", { locale: de })
              : "—"}
          </div>
          <div className="text-sm text-gray-600">{data.requestedTimeFrom} Uhr</div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
            <Scale className="w-3.5 h-3.5" />
            NUTZLAST
          </div>
          <div className="font-semibold text-gray-900">{data.payloadWeightKg} kg</div>
          <div className="text-sm text-gray-600">
            {data.payloadDescription ?? "Keine Beschreibung"}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            STANDORT
          </div>
          <div className="font-semibold text-gray-900 text-sm leading-tight">
            {data.deliveryAddress ?? "—"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {PICKUP_LABELS[data.pickupOption ?? ""] ?? data.pickupOption}
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Preisübersicht</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Flugroute (Luftlinie): {routeDistanceKm} km
          </p>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Grundtarif ({routeDistanceKm} km × CHF 12.00)
            </span>
            <span className="font-medium">{formatCHF(price.basePrice)}</span>
          </div>
          {price.weightSurcharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Gewichtszuschlag ({(data.payloadWeightKg ?? 0) - 20} kg über 20 kg)
              </span>
              <span className="font-medium">{formatCHF(price.weightSurcharge)}</span>
            </div>
          )}
          {price.pickupSurcharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Abflugort-Aufschlag</span>
              <span className="font-medium">{formatCHF(price.pickupSurcharge)}</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
            <span className="text-gray-600">Zwischensumme</span>
            <span className="font-medium">{formatCHF(price.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">MwSt. ({price.vatPercent}%)</span>
            <span className="font-medium">{formatCHF(price.vatAmount)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-xl text-brand-600">
              {formatCHF(price.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-8 text-sm text-amber-800">
        <strong>Hinweis:</strong> Dies ist ein unverbindliches Angebot. Die
        endgültige Preisbestätigung erfolgt nach operativer Prüfung durch unser
        Team. Der Preis kann sich bei Änderung der Route oder des Gewichts ändern.
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-4 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Zurück
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold py-4 rounded-xl hover:bg-brand-700 transition-colors"
        >
          Buchung bestätigen
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
