"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Map, { Marker, Source, Layer, NavigationControl, ScaleControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  DEMO_BOOKINGS,
  DEMO_FLIGHTS,
  DEMO_AIRSPACE_TRAFFIC,
} from "@/lib/demo-data";
import type { AirspaceTraffic, AircraftCategory, ThreatLevel } from "@/lib/airspace";
import { classifyThreat, getThreatColor, haversineM } from "@/lib/airspace";
import {
  Plane,
  MapPin,
  Radio,
  Battery,
  Gauge,
  Navigation,
  Activity,
  Eye,
  EyeOff,
  Layers,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────────

// Berner Oberland center (Interlaken area)
const INITIAL_VIEW = {
  longitude: 7.87,
  latitude: 46.68,
  zoom: 11,
  pitch: 0,
  bearing: 0,
};

// Free OpenStreetMap-based tile sources (no API key needed)
const MAP_STYLES = {
  terrain: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  satellite: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  topo: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
};

const CATEGORY_ICONS: Record<AircraftCategory, string> = {
  helicopter: "\u{1F681}",
  fixed_wing: "\u2708\ufe0f",
  glider: "\u{1FA82}",
  paraglider: "\u{1FA82}",
  drone: "\u{1F6F8}",
  balloon: "\u{1F388}",
  unknown: "\u2753",
};

const CATEGORY_COLORS: Record<AircraftCategory, string> = {
  helicopter: "#7C3AED",
  fixed_wing: "#2563EB",
  glider: "#059669",
  paraglider: "#D97706",
  drone: "#DC2626",
  balloon: "#EC4899",
  unknown: "#6B7280",
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface DronePosition {
  id: string;
  identifier: string;
  pilotName: string;
  lat: number;
  lng: number;
  altitudeM: number;
  speedKmh: number;
  batteryPct: number;
  headingDeg: number;
  status: "in_air" | "pre_flight_check" | "grounded" | "returning";
  routeFrom: { lat: number; lng: number };
  routeTo: { lat: number; lng: number };
  payloadKg: number;
  c2Link: "strong" | "medium" | "weak";
}

interface SelectedDrone {
  drone: DronePosition;
  threats: Array<{ traffic: AirspaceTraffic; distance: number; threat: ThreatLevel }>;
}

// ─── Simulated Drone Positions ──────────────────────────────────────────────

function useSimulatedDrones(): DronePosition[] {
  const [progress, setProgress] = useState(0.6);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 0.95 ? 0.1 : p + 0.002));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const liveFlights = DEMO_FLIGHTS.filter((f) => f.status === "in_air");

  return liveFlights.map((flight, i) => {
    const pickupLat = parseFloat(flight.booking.pickupLat);
    const pickupLng = parseFloat(flight.booking.pickupLng);
    const deliveryLat = parseFloat(flight.booking.deliveryLat);
    const deliveryLng = parseFloat(flight.booking.deliveryLng);

    const adjustedProgress = Math.min(1, progress + i * 0.15);
    const lat = pickupLat + (deliveryLat - pickupLat) * adjustedProgress;
    const lng = pickupLng + (deliveryLng - pickupLng) * adjustedProgress;

    return {
      id: flight.id,
      identifier: flight.booking.identifier,
      pilotName: flight.booking.pilotName,
      lat,
      lng,
      altitudeM: 120 + Math.sin(progress * Math.PI * 4 + i) * 20,
      speedKmh: 65 + Math.sin(progress * Math.PI * 2 + i) * 15,
      batteryPct: Math.max(20, 95 - adjustedProgress * 60 + i * 5),
      headingDeg: (Math.atan2(deliveryLng - pickupLng, deliveryLat - pickupLat) * 180) / Math.PI,
      status: "in_air" as const,
      routeFrom: { lat: pickupLat, lng: pickupLng },
      routeTo: { lat: deliveryLat, lng: deliveryLng },
      payloadKg: parseFloat(flight.booking.payloadWeightKg),
      c2Link: "strong" as const,
    };
  });
}

// ─── GeoJSON for flight routes ──────────────────────────────────────────────

function buildRouteGeoJSON(drones: DronePosition[]) {
  return {
    type: "FeatureCollection" as const,
    features: drones.map((d) => ({
      type: "Feature" as const,
      properties: { id: d.id, identifier: d.identifier },
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [d.routeFrom.lng, d.routeFrom.lat],
          [d.lng, d.lng ? d.lng : d.routeFrom.lng],
          [d.routeTo.lng, d.routeTo.lat],
        ],
      },
    })),
  };
}

function buildFlightZonesGeoJSON() {
  // Operational airspace zones around the Interlaken/Berner Oberland area
  const zones = [
    { name: "Zone Alpha — Interlaken-Grindelwald", center: [7.95, 46.67], radius: 0.06 },
    { name: "Zone Bravo — Lauterbrunnen Valley", center: [7.89, 46.60], radius: 0.04 },
    { name: "Zone Charlie — Brienz Operations", center: [8.04, 46.75], radius: 0.035 },
  ];

  return {
    type: "FeatureCollection" as const,
    features: zones.map((z) => {
      const points: [number, number][] = [];
      for (let angle = 0; angle <= 360; angle += 10) {
        const rad = (angle * Math.PI) / 180;
        points.push([
          z.center[0] + z.radius * Math.cos(rad) * 1.3,
          z.center[1] + z.radius * Math.sin(rad),
        ]);
      }
      return {
        type: "Feature" as const,
        properties: { name: z.name },
        geometry: { type: "Polygon" as const, coordinates: [points] },
      };
    }),
  };
}

// ─── Drone Marker Component ─────────────────────────────────────────────────

function DroneMarker({
  drone,
  isSelected,
  onClick,
}: {
  drone: DronePosition;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Marker longitude={drone.lng} latitude={drone.lat} anchor="center" onClick={onClick}>
      <div className="relative cursor-pointer group">
        {/* Pulse ring */}
        <div className="absolute -inset-3 rounded-full bg-red-500 opacity-20 animate-ping" />
        {/* Main marker */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
            isSelected
              ? "bg-red-600 border-white scale-125 ring-4 ring-red-300"
              : "bg-red-500 border-white hover:scale-110"
          }`}
          style={{
            transform: `rotate(${drone.headingDeg}deg)`,
          }}
        >
          <Plane className="w-4 h-4 text-white" style={{ transform: `rotate(-${drone.headingDeg}deg)` }} />
        </div>
        {/* Label */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded whitespace-nowrap">
          {drone.identifier}
        </div>
      </div>
    </Marker>
  );
}

// ─── Traffic Marker ─────────────────────────────────────────────────────────

function TrafficMarker({
  aircraft,
  threatLevel,
}: {
  aircraft: AirspaceTraffic;
  threatLevel: ThreatLevel;
}) {
  const color = threatLevel !== "none" ? getThreatColor(threatLevel) : CATEGORY_COLORS[aircraft.category];

  return (
    <Marker longitude={aircraft.lng} latitude={aircraft.lat} anchor="center">
      <div className="relative group cursor-default">
        {/* Threat ring for non-none threat levels */}
        {threatLevel !== "none" && (
          <div
            className="absolute -inset-2 rounded-full animate-pulse"
            style={{ backgroundColor: color, opacity: 0.25 }}
          />
        )}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs border shadow-md"
          style={{
            backgroundColor: `${color}20`,
            borderColor: color,
            transform: `rotate(${aircraft.headingDeg}deg)`,
          }}
        >
          <span style={{ transform: `rotate(-${aircraft.headingDeg}deg)`, fontSize: "12px" }}>
            {CATEGORY_ICONS[aircraft.category]}
          </span>
        </div>
        {/* Callsign tooltip */}
        {aircraft.callsign && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {aircraft.callsign} · {Math.round(aircraft.altitudeM)}m
          </div>
        )}
      </div>
    </Marker>
  );
}

// ─── Hub Markers ────────────────────────────────────────────────────────────

const HUB_LOCATIONS = [
  { name: "HQ Wilderswil", lat: 46.6575, lng: 7.868, isHQ: true },
  { name: "Hub Interlaken", lat: 46.6863, lng: 7.8632, isHQ: false },
  { name: "Hub Grindelwald", lat: 46.6545, lng: 8.0414, isHQ: false },
  { name: "Hub Lauterbrunnen", lat: 46.5935, lng: 7.9091, isHQ: false },
  { name: "Hub Brienz", lat: 46.7547, lng: 8.0475, isHQ: false },
  { name: "Hub Thun", lat: 46.7580, lng: 7.6300, isHQ: false },
];

function HubMarker({ hub }: { hub: (typeof HUB_LOCATIONS)[number] }) {
  return (
    <Marker longitude={hub.lng} latitude={hub.lat} anchor="center">
      <div className="relative group cursor-default">
        <div
          className={`flex items-center justify-center shadow-md border-2 ${
            hub.isHQ
              ? "w-8 h-8 bg-red-600 border-white rounded-md rotate-45"
              : "w-5 h-5 bg-white border-red-500 rounded-sm"
          }`}
        >
          {hub.isHQ && (
            <span className="text-white text-[8px] font-black -rotate-45">HQ</span>
          )}
        </div>
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-1 rounded">
          {hub.name}
        </div>
      </div>
    </Marker>
  );
}

// ─── Drone Info Panel ───────────────────────────────────────────────────────

function DroneInfoPanel({
  selected,
  onClose,
  onSendAlert,
}: {
  selected: SelectedDrone;
  onClose: () => void;
  onSendAlert: (droneId: string, msg: string) => void;
}) {
  const { drone, threats } = selected;
  const [alertMsg, setAlertMsg] = useState("");

  const telemetry = [
    { label: "Position", value: `${drone.lat.toFixed(4)}°N, ${drone.lng.toFixed(4)}°E`, icon: MapPin },
    { label: "Höhe AGL", value: `${Math.round(drone.altitudeM)} m`, icon: Navigation },
    { label: "Geschwindigkeit", value: `${Math.round(drone.speedKmh)} km/h`, icon: Gauge },
    { label: "Batterie", value: `${Math.round(drone.batteryPct)}%`, icon: Battery },
    { label: "C2 Link", value: drone.c2Link.toUpperCase(), icon: Radio },
    { label: "Nutzlast", value: `${drone.payloadKg} kg`, icon: Activity },
  ];

  return (
    <div className="absolute top-3 right-3 w-80 bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl z-10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="text-white font-mono font-bold text-sm">{drone.identifier}</span>
          </div>
          <p className="text-white/70 text-xs mt-0.5">Pilot: {drone.pilotName}</p>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Telemetry Grid */}
      <div className="p-3 grid grid-cols-3 gap-2">
        {telemetry.map((t) => (
          <div key={t.label} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
            <t.icon className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-gray-900 font-mono">{t.value}</p>
            <p className="text-[8px] text-gray-400 uppercase">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Threats */}
      {threats.length > 0 && (
        <div className="px-3 pb-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Luftraum-Konflikte</p>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {threats.map((t) => (
              <div
                key={t.traffic.id}
                className="flex items-center gap-2 text-[10px] px-2 py-1 rounded-lg border"
                style={{
                  borderColor: getThreatColor(t.threat),
                  backgroundColor: `${getThreatColor(t.threat)}10`,
                }}
              >
                <span>{CATEGORY_ICONS[t.traffic.category]}</span>
                <span className="font-mono font-bold">{t.traffic.callsign ?? "Unbekannt"}</span>
                <span className="text-gray-400 flex-1">{Math.round(t.distance)}m</span>
                <span
                  className="font-bold uppercase"
                  style={{ color: getThreatColor(t.threat) }}
                >
                  {t.threat}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Alert */}
      <div className="px-3 pb-3 border-t border-gray-100 pt-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Sicherheitshinweis senden</p>
        <div className="flex gap-1.5">
          <input
            type="text"
            placeholder="Nachricht an Pilot..."
            value={alertMsg}
            onChange={(e) => setAlertMsg(e.target.value)}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-red-400"
          />
          <button
            onClick={() => {
              if (alertMsg.trim()) {
                onSendAlert(drone.id, alertMsg);
                setAlertMsg("");
              }
            }}
            className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function LiveOperationsMap({ expanded = false }: { expanded?: boolean }) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>("terrain");
  const [showTraffic, setShowTraffic] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showHubs, setShowHubs] = useState(true);
  const [selectedDrone, setSelectedDrone] = useState<SelectedDrone | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(expanded);
  const [alertLog, setAlertLog] = useState<Array<{ droneId: string; msg: string; time: string }>>([]);

  const drones = useSimulatedDrones();
  const routeGeoJSON = buildRouteGeoJSON(drones);
  const zoneGeoJSON = buildFlightZonesGeoJSON();

  // Compute traffic threats relative to our drones
  const trafficWithThreats = DEMO_AIRSPACE_TRAFFIC.map((aircraft) => {
    let worstThreat: ThreatLevel = "none";
    let minDistance = Infinity;

    for (const drone of drones) {
      const dist = haversineM(drone.lat, drone.lng, aircraft.lat, aircraft.lng);
      const altDiff = Math.abs(drone.altitudeM - aircraft.altitudeM);
      const threat = classifyThreat(dist, altDiff);
      if (dist < minDistance) {
        minDistance = dist;
      }
      if (
        (threat === "alert" && worstThreat !== "alert") ||
        (threat === "warning" && worstThreat !== "alert" && worstThreat !== "warning") ||
        (threat === "advisory" && worstThreat === "none")
      ) {
        worstThreat = threat;
      }
    }

    return { aircraft, threat: worstThreat, distance: minDistance };
  });

  const handleDroneClick = useCallback(
    (drone: DronePosition) => {
      const threats = trafficWithThreats
        .filter((t) => {
          const dist = haversineM(drone.lat, drone.lng, t.aircraft.lat, t.aircraft.lng);
          return dist < 3000;
        })
        .map((t) => ({
          traffic: t.aircraft,
          distance: haversineM(drone.lat, drone.lng, t.aircraft.lat, t.aircraft.lng),
          threat: classifyThreat(
            haversineM(drone.lat, drone.lng, t.aircraft.lat, t.aircraft.lng),
            Math.abs(drone.altitudeM - t.aircraft.altitudeM)
          ),
        }))
        .sort((a, b) => a.distance - b.distance);

      setSelectedDrone({ drone, threats });
    },
    [drones, trafficWithThreats]
  );

  const handleSendAlert = useCallback((droneId: string, msg: string) => {
    setAlertLog((prev) => [
      { droneId, msg, time: new Date().toLocaleTimeString("de-CH") },
      ...prev.slice(0, 9),
    ]);
  }, []);

  const alertCount = trafficWithThreats.filter((t) => t.threat === "alert").length;
  const warningCount = trafficWithThreats.filter((t) => t.threat === "warning").length;

  return (
    <div
      className={`relative bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all ${
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : ""
      }`}
    >
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-white/95 to-transparent px-4 pt-3 pb-8 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <h3 className="text-sm font-bold text-gray-900">Live Operations Karte</h3>
            </div>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              {drones.length} AKTIV
            </span>
            {alertCount > 0 && (
              <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {alertCount} ALARM
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {warningCount} WARNUNG
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Layer toggles */}
            <button
              onClick={() => setShowTraffic(!showTraffic)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                showTraffic ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"
              }`}
              title="Luftverkehr ein/aus"
            >
              {showTraffic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowZones(!showZones)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                showZones ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"
              }`}
              title="Flugzonen ein/aus"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            {/* Map style toggle */}
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value as keyof typeof MAP_STYLES)}
              className="text-[10px] bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none"
            >
              <option value="terrain">Terrain</option>
              <option value="satellite">Dunkel</option>
              <option value="topo">Topografisch</option>
            </select>
            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MapLibre GL Map */}
      <div className={isFullscreen ? "h-full" : "h-[500px]"}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={MAP_STYLES[mapStyle]}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="bottom-right" />
          <ScaleControl position="bottom-left" />

          {/* Flight zones layer */}
          {showZones && (
            <Source id="flight-zones" type="geojson" data={zoneGeoJSON}>
              <Layer
                id="flight-zones-fill"
                type="fill"
                paint={{
                  "fill-color": "#D32F2F",
                  "fill-opacity": 0.08,
                }}
              />
              <Layer
                id="flight-zones-border"
                type="line"
                paint={{
                  "line-color": "#D32F2F",
                  "line-width": 1.5,
                  "line-dasharray": [4, 3],
                  "line-opacity": 0.4,
                }}
              />
            </Source>
          )}

          {/* Flight route lines */}
          <Source id="flight-routes" type="geojson" data={routeGeoJSON}>
            <Layer
              id="flight-routes-line"
              type="line"
              paint={{
                "line-color": "#D32F2F",
                "line-width": 2,
                "line-dasharray": [6, 4],
                "line-opacity": 0.6,
              }}
            />
          </Source>

          {/* Hub markers */}
          {showHubs &&
            HUB_LOCATIONS.map((hub) => <HubMarker key={hub.name} hub={hub} />)}

          {/* Third-party air traffic */}
          {showTraffic &&
            trafficWithThreats.map(({ aircraft, threat }) => (
              <TrafficMarker key={aircraft.id} aircraft={aircraft} threatLevel={threat} />
            ))}

          {/* Drone markers (rendered last to be on top) */}
          {drones.map((drone) => (
            <DroneMarker
              key={drone.id}
              drone={drone}
              isSelected={selectedDrone?.drone.id === drone.id}
              onClick={() => handleDroneClick(drone)}
            />
          ))}
        </Map>
      </div>

      {/* Selected drone info panel */}
      {selectedDrone && (
        <DroneInfoPanel
          selected={selectedDrone}
          onClose={() => setSelectedDrone(null)}
          onSendAlert={handleSendAlert}
        />
      )}

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white/95 to-transparent px-4 pb-3 pt-6">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> {drones.length} Drohnen aktiv
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> {DEMO_AIRSPACE_TRAFFIC.length} Luftfahrzeuge
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-white border border-red-500" /> {HUB_LOCATIONS.length} Hubs
            </span>
          </div>
          <span className="font-mono text-gray-400">
            {viewState.latitude.toFixed(4)}°N {viewState.longitude.toFixed(4)}°E · Zoom {viewState.zoom.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
