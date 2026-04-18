"use client";

import { DEMO_BOOKINGS, DEMO_FRANCHISE_PARTNERS, DEMO_AIRSPACE_TRAFFIC } from "@/lib/demo-data";
import type { AirspaceTraffic } from "@/lib/airspace";

// Swiss map SVG outline (simplified topographic path)
const SWISS_PATH =
  "M95,28 L110,20 L130,22 L155,18 L175,25 L195,20 L220,28 L245,22 L265,30 L280,25 L300,32 " +
  "L315,28 L330,35 L345,30 L360,38 L370,32 L385,40 L395,35 L405,42 " +
  "L410,55 L405,68 L395,78 L385,85 L370,92 L355,98 L340,95 L320,100 " +
  "L300,105 L280,100 L260,108 L240,102 L220,110 L200,105 L180,112 " +
  "L160,108 L140,115 L120,110 L100,118 L85,112 L70,105 L55,98 " +
  "L45,88 L40,75 L42,62 L48,50 L55,42 L65,35 L78,30 Z";

// Known Swiss locations for demo flight markers
const LOCATIONS: Record<string, { x: number; y: number }> = {
  "Interlaken": { x: 230, y: 72 },
  "Grindelwald": { x: 245, y: 65 },
  "Lauterbrunnen": { x: 222, y: 78 },
  "Wilderswil": { x: 225, y: 74 },
  "Wengen": { x: 228, y: 76 },
  "Mürren": { x: 218, y: 80 },
  "Brienz": { x: 255, y: 68 },
  "Thun": { x: 210, y: 70 },
  "Spiez": { x: 215, y: 75 },
  "Kandersteg": { x: 200, y: 82 },
  "Stechelberg": { x: 220, y: 82 },
  "Bern": { x: 195, y: 60 },
  "Zürich": { x: 265, y: 42 },
  "Basel": { x: 220, y: 30 },
  "Luzern": { x: 260, y: 55 },
  "Genf": { x: 100, y: 85 },
};

// Franchise hub locations
const FRANCHISE_HUBS = [
  { name: "HQ Wilderswil", x: 225, y: 74, isHQ: true },
  { name: "Hub Interlaken", x: 230, y: 72, isHQ: false },
  { name: "Hub Grindelwald", x: 245, y: 65, isHQ: false },
  { name: "Hub Lauterbrunnen", x: 222, y: 78, isHQ: false },
  { name: "Hub Brienz", x: 255, y: 68, isHQ: false },
  { name: "Hub Thun", x: 210, y: 70, isHQ: false },
];

// Active flight zones (restricted/active operations areas)
const FLIGHT_ZONES = [
  { cx: 235, cy: 72, rx: 18, ry: 12, label: "Zone Alpha" },
  { cx: 250, cy: 66, rx: 12, ry: 8, label: "Zone Bravo" },
  { cx: 218, cy: 79, rx: 10, ry: 7, label: "Zone Charlie" },
];

function getLocationFromAddress(address: string): { x: number; y: number } | null {
  for (const [name, pos] of Object.entries(LOCATIONS)) {
    if (address.includes(name)) return pos;
  }
  return null;
}

// Simulated live drone positions along routes
function getDronePosition(pickup: { x: number; y: number }, delivery: { x: number; y: number }, progress: number) {
  return {
    x: pickup.x + (delivery.x - pickup.x) * progress,
    y: pickup.y + (delivery.y - pickup.y) * progress,
  };
}

// Map lat/lng to SVG coordinates (approximate projection for Swiss region)
function geoToSvg(lat: number, lng: number): { x: number; y: number } | null {
  // Bounding box: roughly lat 45.8–47.8, lng 5.9–10.5
  const minLat = 45.8, maxLat = 47.8, minLng = 5.9, maxLng = 10.5;
  if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) return null;
  const x = 40 + ((lng - minLng) / (maxLng - minLng)) * 380;
  const y = 20 + ((maxLat - lat) / (maxLat - minLat)) * 100;
  return { x, y };
}

// Aircraft shape paths for SVG markers
const AIRCRAFT_SHAPES: Record<string, (x: number, y: number, heading: number) => string> = {
  helicopter: (x, y) => `M${x},${y - 3} L${x + 2.5},${y + 1.5} L${x},${y + 0.5} L${x - 2.5},${y + 1.5}Z`,
  fixed_wing: (x, y) => `M${x},${y - 4} L${x + 3},${y + 2} L${x},${y + 1} L${x - 3},${y + 2}Z`,
  glider: (x, y) => `M${x},${y - 3} L${x + 4},${y} L${x},${y + 2} L${x - 4},${y}Z`,
  paraglider: (x, y) => `M${x - 2.5},${y - 1.5} Q${x},${y - 3.5} ${x + 2.5},${y - 1.5} L${x},${y + 2}Z`,
  drone: (x, y) => `M${x},${y - 2.5} L${x + 2},${y} L${x},${y + 2.5} L${x - 2},${y}Z`,
  balloon: (x, y) => `M${x},${y - 3} A2.5,3 0 1,1 ${x},${y + 0.5} L${x - 1},${y + 3} L${x + 1},${y + 3}Z`,
  unknown: (x, y) => `M${x},${y - 2} L${x + 2},${y} L${x},${y + 2} L${x - 2},${y}Z`,
};

const CATEGORY_COLORS: Record<string, string> = {
  helicopter: "#7C3AED",
  fixed_wing: "#2563EB",
  glider: "#059669",
  paraglider: "#D97706",
  drone: "#DC2626",
  balloon: "#EC4899",
  unknown: "#6B7280",
};

export function SwissMap({ compact = false, showHubs = true, showZones = true, showAirTraffic = false }: {
  compact?: boolean;
  showHubs?: boolean;
  showZones?: boolean;
  showAirTraffic?: boolean;
}) {
  const activeFlights = DEMO_BOOKINGS.filter((b) => b.status === "in_progress" || b.status === "confirmed");
  const inAirFlights = DEMO_BOOKINGS.filter((b) => b.status === "in_progress");
  const h = compact ? 180 : 280;

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Live Airspace Operations</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {inAirFlights.length} aktive Flüge &middot; {FRANCHISE_HUBS.length} Standorte &middot; Berner Oberland
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
          </span>
          <span className="text-[10px] font-bold text-brand-600">LIVE</span>
        </div>
      </div>

      <div className="px-3 pb-3">
        <svg viewBox="0 0 450 135" className="w-full" style={{ height: h }}>
          {/* Background grid lines */}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`vg${i}`} x1={i * 50} y1={0} x2={i * 50} y2={135} stroke="#f3f4f6" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`hg${i}`} x1={0} y1={i * 30} x2={450} y2={i * 30} stroke="#f3f4f6" strokeWidth={0.5} />
          ))}

          {/* Swiss outline */}
          <path d={SWISS_PATH} fill="#fef2f2" stroke="#D32F2F" strokeWidth={1.5} strokeLinejoin="round" opacity={0.8} />

          {/* Active flight zones (red overlays) */}
          {showZones && FLIGHT_ZONES.map((zone, i) => (
            <g key={`zone-${i}`}>
              <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry} fill="#D32F2F" stroke="#D32F2F" strokeWidth={0.5} strokeDasharray="3,2" opacity={0.15}>
                <animate attributeName="opacity" values="0.08;0.15;0.08" dur="3s" repeatCount="indefinite" />
              </ellipse>
              {!compact && (
                <text x={zone.cx} y={zone.cy - zone.ry - 2} textAnchor="middle" className="text-[5px] fill-brand-400 font-bold uppercase">
                  {zone.label}
                </text>
              )}
            </g>
          ))}

          {/* Franchise hub markers */}
          {showHubs && FRANCHISE_HUBS.map((hub) => (
            <g key={hub.name}>
              {hub.isHQ ? (
                <>
                  {/* HQ — larger diamond marker */}
                  <polygon
                    points={`${hub.x},${hub.y - 6} ${hub.x + 5},${hub.y} ${hub.x},${hub.y + 6} ${hub.x - 5},${hub.y}`}
                    fill="#D32F2F"
                    stroke="white"
                    strokeWidth={1.5}
                  />
                  <text x={hub.x} y={hub.y - 9} textAnchor="middle" className="text-[6px] fill-brand-600 font-bold">
                    HQ
                  </text>
                </>
              ) : (
                <>
                  {/* Hub — small square marker */}
                  <rect x={hub.x - 2.5} y={hub.y - 2.5} width={5} height={5} fill="white" stroke="#D32F2F" strokeWidth={1} rx={1} />
                </>
              )}
            </g>
          ))}

          {/* Active flight routes & markers */}
          {activeFlights.map((flight) => {
            const pickup = flight.pickupAddress ? getLocationFromAddress(flight.pickupAddress) : null;
            const delivery = flight.deliveryAddress ? getLocationFromAddress(flight.deliveryAddress) : null;

            return (
              <g key={flight.id}>
                {/* Route line */}
                {pickup && delivery && (
                  <line
                    x1={pickup.x} y1={pickup.y}
                    x2={delivery.x} y2={delivery.y}
                    stroke="#D32F2F" strokeWidth={1} strokeDasharray="4,3" opacity={0.5}
                  />
                )}
                {/* Pickup marker */}
                {pickup && (
                  <circle cx={pickup.x} cy={pickup.y} r={3.5} fill="white" stroke="#D32F2F" strokeWidth={1.5} />
                )}
                {/* Delivery marker */}
                {delivery && (
                  <g>
                    {flight.status === "in_progress" && (
                      <circle cx={delivery.x} cy={delivery.y} r={8} fill="#D32F2F" opacity={0.15}>
                        <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={delivery.x} cy={delivery.y} r={3.5} fill="#D32F2F" />
                    <circle cx={delivery.x} cy={delivery.y} r={1.5} fill="white" />
                  </g>
                )}
                {/* Live drone position (simulated for in_progress flights) */}
                {flight.status === "in_progress" && pickup && delivery && (
                  <g>
                    {(() => {
                      const pos = getDronePosition(pickup, delivery, 0.6);
                      return (
                        <>
                          <circle cx={pos.x} cy={pos.y} r={6} fill="#D32F2F" opacity={0.2}>
                            <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
                          </circle>
                          <polygon
                            points={`${pos.x},${pos.y - 4} ${pos.x + 3},${pos.y + 2} ${pos.x},${pos.y + 1} ${pos.x - 3},${pos.y + 2}`}
                            fill="#D32F2F"
                            stroke="white"
                            strokeWidth={0.5}
                          />
                        </>
                      );
                    })()}
                  </g>
                )}
              </g>
            );
          })}

          {/* Third-party air traffic overlay */}
          {showAirTraffic && DEMO_AIRSPACE_TRAFFIC.map((aircraft) => {
            const pos = geoToSvg(aircraft.lat, aircraft.lng);
            if (!pos) return null;
            const color = CATEGORY_COLORS[aircraft.category] ?? "#6B7280";
            const shapeFn = AIRCRAFT_SHAPES[aircraft.category] ?? AIRCRAFT_SHAPES.unknown;

            return (
              <g key={aircraft.id}>
                {/* Detection radius ring */}
                <circle cx={pos.x} cy={pos.y} r={5} fill={color} opacity={0.08}>
                  <animate attributeName="r" values="4;7;4" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.12;0.04;0.12" dur="2.5s" repeatCount="indefinite" />
                </circle>
                {/* Aircraft shape */}
                <path d={shapeFn(pos.x, pos.y, aircraft.headingDeg)} fill={color} stroke="white" strokeWidth={0.5} opacity={0.85} />
                {/* Callsign label */}
                {aircraft.callsign && !compact && (
                  <text x={pos.x + 5} y={pos.y - 4} className="text-[4.5px] font-bold" fill={color} opacity={0.8}>
                    {aircraft.callsign}
                  </text>
                )}
              </g>
            );
          })}

          {/* Key city labels */}
          {[
            { name: "Bern", ...LOCATIONS["Bern"] },
            { name: "Interlaken", ...LOCATIONS["Interlaken"] },
            { name: "Thun", ...LOCATIONS["Thun"] },
            ...(compact ? [] : [
              { name: "Luzern", ...LOCATIONS["Luzern"] },
              { name: "Brienz", ...LOCATIONS["Brienz"] },
            ]),
          ].map((city) => (
            <text
              key={city.name}
              x={city.x}
              y={city.y - 8}
              textAnchor="middle"
              className="text-[7px] fill-gray-400 font-medium"
            >
              {city.name}
            </text>
          ))}
        </svg>
      </div>

      {/* Map Legend */}
      {!compact && (
        <div className="px-5 pb-3 flex items-center gap-4 text-[9px] text-gray-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10"><polygon points="5,1 8,5 5,9 2,5" fill="#D32F2F" /></svg>
            <span>HQ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="8" height="8"><rect width="6" height="6" x="1" y="1" fill="white" stroke="#D32F2F" strokeWidth="1" rx="1" /></svg>
            <span>Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="8" height="8"><polygon points="4,0 7,3 4,5 1,3" fill="#D32F2F" stroke="white" strokeWidth="0.5" /></svg>
            <span>Drohne</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="8"><ellipse cx="6" cy="4" rx="5" ry="3" fill="none" stroke="#D32F2F" strokeWidth="0.5" strokeDasharray="2,1" /></svg>
            <span>Flugzone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="8" height="8"><circle cx="4" cy="4" r="3" fill="#D32F2F" /><circle cx="4" cy="4" r="1.5" fill="white" /></svg>
            <span>Ziel</span>
          </div>
          {showAirTraffic && (
            <>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-1.5">
                <svg width="8" height="8"><polygon points="4,0 7,3 4,5 1,3" fill="#7C3AED" stroke="white" strokeWidth="0.5" /></svg>
                <span>Heli</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="8" height="8"><polygon points="4,0 7,4 4,3 1,4" fill="#2563EB" stroke="white" strokeWidth="0.5" /></svg>
                <span>Flugzeug</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="8" height="8"><polygon points="4,1 8,4 4,6 0,4" fill="#059669" stroke="white" strokeWidth="0.5" /></svg>
                <span>Segelfl.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="8" height="8"><path d="M1.5,2.5 Q4,0 6.5,2.5 L4,7Z" fill="#D97706" stroke="white" strokeWidth="0.5" /></svg>
                <span>Gleitsch.</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
