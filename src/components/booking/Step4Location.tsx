"use client";

import { useState } from "react";
import { MapPin, Building2, Navigation, ChevronRight, ChevronLeft, Info } from "lucide-react";
import type { BookingData } from "./BookingWizard";

interface Props {
  data: BookingData;
  onNext: (
    data: Pick<
      BookingData,
      | "deliveryLat"
      | "deliveryLng"
      | "deliveryAddress"
      | "pickupOption"
      | "pickupLat"
      | "pickupLng"
      | "pickupAddress"
      | "hubId"
    >
  ) => void;
  onBack: () => void;
}

type PickupOption = "CUSTOMER_LOCATION" | "AIRBASE_HUB" | "CUSTOM_PICKUP";

const AIRBASE_HUBS = [
  { id: "hub-zuerich", name: "Airbase Hub Zürich", address: "Zürich, ZH", lat: 47.3769, lng: 8.5417 },
  { id: "hub-bern", name: "Airbase Hub Bern", address: "Bern, BE", lat: 46.948, lng: 7.4474 },
  { id: "hub-luzern", name: "Airbase Hub Luzern", address: "Luzern, LU", lat: 47.0502, lng: 8.3093 },
];

export function Step4Location({ data, onNext, onBack }: Props) {
  const [deliveryAddress, setDeliveryAddress] = useState(data.deliveryAddress ?? "");
  const [deliveryLat, setDeliveryLat] = useState<number | undefined>(data.deliveryLat);
  const [deliveryLng, setDeliveryLng] = useState<number | undefined>(data.deliveryLng);
  const [pickupOption, setPickupOption] = useState<PickupOption>(
    (data.pickupOption as PickupOption) ?? "CUSTOMER_LOCATION"
  );
  const [pickupAddress, setPickupAddress] = useState(data.pickupAddress ?? "");
  const [pickupLat, setPickupLat] = useState<number | undefined>(data.pickupLat);
  const [pickupLng, setPickupLng] = useState<number | undefined>(data.pickupLng);
  const [selectedHub, setSelectedHub] = useState<string>(data.hubId ?? "");

  // Mock geocoding — in production use Google Maps API
  const geocodeAddress = (address: string): { lat: number; lng: number } | null => {
    if (!address.trim()) return null;
    // Placeholder: default to center of Switzerland
    return { lat: 46.8182, lng: 8.2275 };
  };

  const handleDeliveryAddressBlur = () => {
    const coords = geocodeAddress(deliveryAddress);
    if (coords) {
      setDeliveryLat(coords.lat);
      setDeliveryLng(coords.lng);
    }
  };

  const handlePickupAddressBlur = () => {
    const coords = geocodeAddress(pickupAddress);
    if (coords) {
      setPickupLat(coords.lat);
      setPickupLng(coords.lng);
    }
  };

  const canProceed =
    deliveryAddress &&
    deliveryLat &&
    deliveryLng &&
    (pickupOption === "CUSTOMER_LOCATION" ||
      (pickupOption === "AIRBASE_HUB" && selectedHub) ||
      (pickupOption === "CUSTOM_PICKUP" && pickupAddress));

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Standort</h2>
      <p className="text-gray-500 mb-8">
        Geben Sie den Lieferort und die gewünschte Abflugoption an.
      </p>

      {/* Delivery location */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <MapPin className="inline w-4 h-4 mr-1 text-brand-600" />
          Lieferadresse*
        </label>
        <input
          type="text"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          onBlur={handleDeliveryAddressBlur}
          placeholder="Strasse, Hausnummer, PLZ, Ort"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-400 focus:outline-none"
        />
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <Info className="w-3.5 h-3.5" />
          Google Maps Integration wird in der nächsten Version aktiviert.
        </div>
      </div>

      {/* Pickup option */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Abflugoption
        </label>
        <div className="space-y-3">
          {/* Option A */}
          <button
            type="button"
            onClick={() => setPickupOption("CUSTOMER_LOCATION")}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              pickupOption === "CUSTOMER_LOCATION"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">
                  Option A — Kundeneigener Abflugort
                </span>
                <span className="text-sm font-semibold text-green-600">
                  Kein Aufpreis
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Der Drohnenpilot kommt zu Ihnen. Sie stellen einen geeigneten
                Startplatz bereit.
              </p>
            </div>
          </button>

          {/* Option B */}
          <button
            type="button"
            onClick={() => setPickupOption("AIRBASE_HUB")}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              pickupOption === "AIRBASE_HUB"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">
                  Option B — Airbase Hub
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  +CHF 25.00
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Fracht bei einem unserer Hubs abgeben. Wir übernehmen ab dort.
              </p>
            </div>
          </button>

          {pickupOption === "AIRBASE_HUB" && (
            <div className="ml-14 space-y-2">
              {AIRBASE_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => setSelectedHub(hub.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    selectedHub === hub.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">{hub.name}</div>
                    <div className="text-xs text-gray-500">{hub.address}</div>
                  </div>
                  {selectedHub === hub.id && (
                    <div className="w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Option C */}
          <button
            type="button"
            onClick={() => setPickupOption("CUSTOM_PICKUP")}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              pickupOption === "CUSTOM_PICKUP"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">
                  Option C — Individueller Abflugort
                </span>
                <span className="text-sm font-semibold text-orange-600">
                  +CHF 2.00/km
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Beliebiger Abflugort. Zusatzkosten basierend auf Entfernung zum
                nächsten Hub.
              </p>
            </div>
          </button>

          {pickupOption === "CUSTOM_PICKUP" && (
            <div className="ml-14">
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                onBlur={handlePickupAddressBlur}
                placeholder="Abflugadresse eingeben"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-400 focus:outline-none"
              />
            </div>
          )}
        </div>
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
          disabled={!canProceed}
          onClick={() =>
            onNext({
              deliveryAddress,
              deliveryLat: deliveryLat ?? 0,
              deliveryLng: deliveryLng ?? 0,
              pickupOption,
              pickupAddress: pickupAddress || undefined,
              pickupLat,
              pickupLng,
              hubId: selectedHub || undefined,
            })
          }
          className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold py-4 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Preis berechnen
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
