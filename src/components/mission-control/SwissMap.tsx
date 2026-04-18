"use client";

import { DEMO_BOOKINGS } from "@/lib/demo-data";

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
  "Bern": { x: 195, y: 60 },
  "Zürich": { x: 265, y: 42 },
  "Basel": { x: 220, y: 30 },
  "Luzern": { x: 260, y: 55 },
  "Genf": { x: 100, y: 85 },
};

function getLocationFromAddress(address: string): { x: number; y: number } | null {
  for (const [name, pos] of Object.entries(LOCATIONS)) {
    if (address.includes(name)) return pos;
  }
  return null;
}

export function SwissMap({ compact = false }: { compact?: boolean }) {
  const activeFlights = DEMO_BOOKINGS.filter((b) => b.status === "in_progress" || b.status === "confirmed");
  const h = compact ? 180 : 280;

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Live Airspace Operations</h3>
          <p className="text-xs text-gray-400 mt-0.5">{activeFlights.length} aktive Flüge im Berner Oberland</p>
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

          {/* Airspace zones (red overlays) */}
          <ellipse cx={230} cy={75} rx={45} ry={25} fill="#D32F2F" opacity={0.12} />
          <ellipse cx={230} cy={75} rx={30} ry={18} fill="#D32F2F" opacity={0.08} />
          <ellipse cx={265} cy={50} rx={20} ry={12} fill="#D32F2F" opacity={0.06} />

          {/* Active flight markers */}
          {activeFlights.map((flight, i) => {
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
                  <g>
                    <circle cx={pickup.x} cy={pickup.y} r={4} fill="white" stroke="#D32F2F" strokeWidth={1.5} />
                  </g>
                )}
                {/* Delivery marker (pulsing for in_progress) */}
                {delivery && (
                  <g>
                    {flight.status === "in_progress" && (
                      <circle cx={delivery.x} cy={delivery.y} r={8} fill="#D32F2F" opacity={0.15}>
                        <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={delivery.x} cy={delivery.y} r={4} fill="#D32F2F" />
                    <circle cx={delivery.x} cy={delivery.y} r={2} fill="white" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Key city labels */}
          {[
            { name: "Bern", ...LOCATIONS["Bern"] },
            { name: "Interlaken", ...LOCATIONS["Interlaken"] },
            { name: "Thun", ...LOCATIONS["Thun"] },
            { name: "Luzern", ...LOCATIONS["Luzern"] },
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
    </div>
  );
}
