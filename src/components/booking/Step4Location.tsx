"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import {
  MapPin,
  Building2,
  Navigation,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
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
      | "routeDistanceKm"
    >
  ) => void;
  onBack: () => void;
}

type PickupOption = "CUSTOMER_LOCATION" | "VOLTAIR_HUB" | "CUSTOM_PICKUP";

const VOLTAIR_HUBS = [
  { id: "hub-wilderswil", name: "AIRBASE HQ Wilderswil", address: "Mittelweg 9, 3812 Wilderswil", lat: 46.6553, lng: 7.8675 },
  { id: "hub-interlaken", name: "AIRBASE Hub Interlaken", address: "Interlaken, BE", lat: 46.6863, lng: 7.8632 },
  { id: "hub-grindelwald", name: "AIRBASE Hub Grindelwald", address: "Grindelwald, BE", lat: 46.6243, lng: 8.0413 },
];

// Haversine straight-line distance (km) — appropriate for drone routes
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Singleton Maps loader
let mapsLoader: Loader | null = null;
function getMapsLoader(): Loader {
  if (!mapsLoader) {
    mapsLoader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
      version: "weekly",
      libraries: ["places"],
    });
  }
  return mapsLoader;
}

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
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | undefined>(data.routeDistanceKm);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const deliveryInputRef = useRef<HTMLInputElement>(null);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const deliveryAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Maps
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setMapsError(true);
      return;
    }
    getMapsLoader()
      .load()
      .then(() => setMapsLoaded(true))
      .catch(() => setMapsError(true));
  }, []);

  // Reverse geocode helper
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!mapsLoaded) return;
    setIsReverseGeocoding(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results[0]) {
        setDeliveryAddress(result.results[0].formatted_address);
        setGeocodeError(null);
      }
    } catch {
      // silently ignore — address input still reflects last typed value
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [mapsLoaded]);

  // Place / move marker on map
  const placeMarker = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    } else {
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        draggable: true,
        title: "Lieferadresse",
      });
      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (!pos) return;
        setDeliveryLat(pos.lat());
        setDeliveryLng(pos.lng());
        void reverseGeocode(pos.lat(), pos.lng());
      });
      markerRef.current = marker;
    }
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, [reverseGeocode]);

  // Initialize map
  useEffect(() => {
    if (!mapsLoaded || !mapDivRef.current || mapRef.current) return;

    const map = new google.maps.Map(mapDivRef.current, {
      center: { lat: 46.686, lng: 7.863 }, // Interlaken / Berner Oberland
      zoom: 8,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapRef.current = map;

    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setDeliveryLat(lat);
      setDeliveryLng(lng);
      placeMarker(lat, lng);
      void reverseGeocode(lat, lng);
    });

    // If coordinates already exist from previous step visit, center map
    if (deliveryLat && deliveryLng) {
      placeMarker(deliveryLat, deliveryLng);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsLoaded]);

  // Initialize Places Autocomplete for delivery address
  useEffect(() => {
    if (!mapsLoaded || !deliveryInputRef.current || deliveryAutocompleteRef.current) return;

    const ac = new google.maps.places.Autocomplete(deliveryInputRef.current, {
      componentRestrictions: { country: "ch" },
      fields: ["formatted_address", "geometry"],
    });
    deliveryAutocompleteRef.current = ac;

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place.geometry?.location) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setDeliveryAddress(place.formatted_address ?? deliveryAddress);
      setDeliveryLat(lat);
      setDeliveryLng(lng);
      setGeocodeError(null);
      placeMarker(lat, lng);
    });
  }, [mapsLoaded, deliveryAddress, placeMarker]);

  // Initialize Places Autocomplete for custom pickup
  useEffect(() => {
    if (!mapsLoaded || pickupOption !== "CUSTOM_PICKUP") return;
    if (!pickupInputRef.current || pickupAutocompleteRef.current) return;

    const ac = new google.maps.places.Autocomplete(pickupInputRef.current, {
      componentRestrictions: { country: "ch" },
      fields: ["formatted_address", "geometry"],
    });
    pickupAutocompleteRef.current = ac;

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place.geometry?.location) return;
      setPickupAddress(place.formatted_address ?? pickupAddress);
      setPickupLat(place.geometry.location.lat());
      setPickupLng(place.geometry.location.lng());
    });
  }, [mapsLoaded, pickupOption, pickupAddress]);

  // Recalculate straight-line distance whenever relevant coords change
  useEffect(() => {
    if (!deliveryLat || !deliveryLng) return;

    let originLat: number;
    let originLng: number;

    if (pickupOption === "VOLTAIR_HUB" && selectedHub) {
      const hub = VOLTAIR_HUBS.find((h) => h.id === selectedHub);
      if (!hub) return;
      originLat = hub.lat;
      originLng = hub.lng;
    } else if (pickupOption === "CUSTOM_PICKUP" && pickupLat && pickupLng) {
      originLat = pickupLat;
      originLng = pickupLng;
    } else if (pickupOption === "CUSTOMER_LOCATION") {
      // Use nearest hub as proxy origin (pilot comes from hub area)
      const nearest = VOLTAIR_HUBS.reduce((a, b) =>
        haversineKm(deliveryLat, deliveryLng, a.lat, a.lng) <
        haversineKm(deliveryLat, deliveryLng, b.lat, b.lng)
          ? a
          : b
      );
      originLat = nearest.lat;
      originLng = nearest.lng;
    } else {
      return;
    }

    const dist = haversineKm(originLat, originLng, deliveryLat, deliveryLng);
    setRouteDistanceKm(Math.round(dist * 10) / 10);
  }, [deliveryLat, deliveryLng, pickupOption, selectedHub, pickupLat, pickupLng]);

  const canProceed =
    deliveryAddress &&
    deliveryLat !== undefined &&
    deliveryLng !== undefined &&
    deliveryLat !== 0 &&
    deliveryLng !== 0 &&
    (pickupOption === "CUSTOMER_LOCATION" ||
      (pickupOption === "VOLTAIR_HUB" && selectedHub) ||
      (pickupOption === "CUSTOM_PICKUP" && pickupAddress && pickupLat && pickupLng));

  const handleNext = () => {
    if (!canProceed) return;
    onNext({
      deliveryAddress,
      deliveryLat: deliveryLat!,
      deliveryLng: deliveryLng!,
      pickupOption,
      pickupAddress: pickupAddress || undefined,
      pickupLat,
      pickupLng,
      hubId: selectedHub || undefined,
      routeDistanceKm: routeDistanceKm ?? 10,
    });
  };

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Standort</h2>
      <p className="text-gray-500 mb-6">
        Geben Sie den Lieferort und die gewünschte Abflugoption an.
      </p>

      {/* Delivery address */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <MapPin className="inline w-4 h-4 mr-1 text-brand-600" />
          Lieferadresse*
        </label>
        <div className="relative">
          <input
            ref={deliveryInputRef}
            type="text"
            value={deliveryAddress}
            onChange={(e) => {
              setDeliveryAddress(e.target.value);
              // Clear coords if user types manually (re-geocode on place_changed)
              if (!deliveryAutocompleteRef.current) {
                setDeliveryLat(undefined);
                setDeliveryLng(undefined);
              }
            }}
            placeholder="Strasse, Hausnummer, PLZ, Ort"
            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none pr-10 transition-colors ${
              geocodeError
                ? "border-red-300 focus:border-red-400"
                : deliveryLat
                ? "border-green-300 focus:border-green-400"
                : "border-gray-200 focus:border-brand-400"
            }`}
          />
          {isReverseGeocoding && (
            <Loader2 className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 animate-spin" />
          )}
        </div>
        {geocodeError && (
          <p className="flex items-center gap-1 text-sm text-red-600 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {geocodeError}
          </p>
        )}
        {deliveryLat && !geocodeError && (
          <p className="text-xs text-green-600 mt-1">
            Koordinaten gesetzt — oder klicken Sie auf die Karte, um die Position anzupassen.
          </p>
        )}
        {!mapsLoaded && !mapsError && (
          <p className="text-xs text-gray-400 mt-1">Google Maps wird geladen…</p>
        )}
        {mapsError && (
          <p className="text-xs text-amber-600 mt-1">
            Karte nicht verfügbar. Bitte Adresse manuell eingeben.
          </p>
        )}
      </div>

      {/* Map */}
      <div className="mb-4">
        <div
          ref={mapDivRef}
          className="w-full h-48 sm:h-64 rounded-xl border border-gray-200 overflow-hidden bg-gray-100"
        >
          {!mapsLoaded && !mapsError && (
            <div className="flex items-center justify-center h-full gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Karte wird geladen…
            </div>
          )}
          {mapsError && (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Karte nicht verfügbar
            </div>
          )}
        </div>
        {mapsLoaded && (
          <p className="text-xs text-gray-400 mt-1">
            Klicken Sie auf die Karte, um den Lieferort zu setzen, oder ziehen Sie den Marker.
          </p>
        )}
      </div>

      {/* Calculated distance badge */}
      {routeDistanceKm !== undefined && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-6 text-sm text-brand-700">
          Berechnete Flugroute (Luftlinie):{" "}
          <strong>{routeDistanceKm} km</strong>
        </div>
      )}

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
            className={`w-full flex items-start gap-3 sm:gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              pickupOption === "CUSTOMER_LOCATION"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                  Option A — Kundeneigener Abflugort
                </span>
                <span className="text-sm font-semibold text-green-600 flex-shrink-0">
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
            onClick={() => setPickupOption("VOLTAIR_HUB")}
            className={`w-full flex items-start gap-3 sm:gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              pickupOption === "VOLTAIR_HUB"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                  Option B — AIRBASE Hub
                </span>
                <span className="text-sm font-semibold text-blue-600 flex-shrink-0">
                  +CHF 25.00
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Fracht bei einem unserer Hubs abgeben. Wir übernehmen ab dort.
              </p>
            </div>
          </button>

          {pickupOption === "VOLTAIR_HUB" && (
            <div className="ml-4 sm:ml-14 space-y-2">
              {VOLTAIR_HUBS.map((hub) => (
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
                  <div className="text-left">
                    <div className="font-medium text-sm text-gray-900">{hub.name}</div>
                    <div className="text-xs text-gray-500">{hub.address}</div>
                  </div>
                  {selectedHub === hub.id && (
                    <div className="w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
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
            onClick={() => {
              setPickupOption("CUSTOM_PICKUP");
              pickupAutocompleteRef.current = null; // reset so it re-inits on the new input
            }}
            className={`w-full flex items-start gap-3 sm:gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              pickupOption === "CUSTOM_PICKUP"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                  Option C — Individueller Abflugort
                </span>
                <span className="text-sm font-semibold text-orange-600 flex-shrink-0">
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
            <div className="ml-4 sm:ml-14">
              <input
                ref={pickupInputRef}
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Abflugadresse eingeben"
                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors ${
                  pickupLat
                    ? "border-green-300 focus:border-green-400"
                    : "border-gray-200 focus:border-brand-400"
                }`}
              />
              {pickupLat && (
                <p className="text-xs text-green-600 mt-1">Abflugort gesetzt.</p>
              )}
              {pickupAddress && !pickupLat && (
                <p className="text-xs text-amber-600 mt-1">
                  Bitte wählen Sie einen Vorschlag aus der Liste.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 sm:px-6 py-4 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Zurück</span>
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold py-4 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Preis berechnen
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
