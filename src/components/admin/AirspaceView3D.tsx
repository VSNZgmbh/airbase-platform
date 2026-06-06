"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  DEMO_FLIGHTS,
  DEMO_AIRSPACE_TRAFFIC,
} from "@/lib/demo-data";
import type { AirspaceTraffic, AircraftCategory } from "@/lib/airspace";
import { classifyThreat, getThreatColor, haversineM } from "@/lib/airspace";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  Eye,
  Info,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────────

// Berner Oberland bounding box for coordinate mapping
const GEO_BOUNDS = {
  minLat: 46.55,
  maxLat: 46.76,
  minLng: 7.75,
  maxLng: 8.10,
};

const MAX_ALTITUDE_M = 6000;
const CANVAS_W = 800;
const CANVAS_H = 500;
const GROUND_W = 600;
const GROUND_H = 400;

const CATEGORY_COLORS: Record<AircraftCategory, string> = {
  helicopter: "#7C3AED",
  fixed_wing: "#2563EB",
  glider: "#059669",
  paraglider: "#D97706",
  drone: "#DC2626",
  balloon: "#EC4899",
  unknown: "#6B7280",
};

const CATEGORY_LABELS: Record<AircraftCategory, string> = {
  helicopter: "Helikopter",
  fixed_wing: "Flugzeug",
  glider: "Segelflugzeug",
  paraglider: "Gleitschirm",
  drone: "Drohne",
  balloon: "Ballon",
  unknown: "Unbekannt",
};

const ALTITUDE_LAYERS = [
  { altitude: 0, label: "GND", color: "#e5e7eb" },
  { altitude: 500, label: "500m", color: "#86efac" },
  { altitude: 1500, label: "1500m", color: "#fde047" },
  { altitude: 3000, label: "3000m", color: "#fb923c" },
  { altitude: 5000, label: "5000m", color: "#f87171" },
];

// ─── Projection ─────────────────────────────────────────────────────────────

interface ViewParams {
  rotateX: number; // Tilt angle (degrees)
  rotateZ: number; // Rotation around vertical axis (degrees)
  zoom: number;
  offsetX: number;
  offsetY: number;
}

function geoTo3D(
  lat: number,
  lng: number,
  altitudeM: number,
  view: ViewParams
): { x: number; y: number; z: number; screenX: number; screenY: number } {
  // Normalize to [0, 1] within bounding box
  const nx = (lng - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng);
  const ny = 1 - (lat - GEO_BOUNDS.minLat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat);
  const nz = altitudeM / MAX_ALTITUDE_M;

  // Map to 3D space
  const x3d = (nx - 0.5) * GROUND_W;
  const y3d = (ny - 0.5) * GROUND_H;
  const z3d = nz * 250; // Height scale

  // Apply rotation
  const radX = (view.rotateX * Math.PI) / 180;
  const radZ = (view.rotateZ * Math.PI) / 180;

  // Rotate around Z axis (horizontal rotation)
  const x1 = x3d * Math.cos(radZ) - y3d * Math.sin(radZ);
  const y1 = x3d * Math.sin(radZ) + y3d * Math.cos(radZ);
  const z1 = z3d;

  // Rotate around X axis (tilt)
  const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
  const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

  // Simple perspective projection
  const perspective = 800;
  const scale = (perspective / (perspective + y2)) * view.zoom;

  const screenX = CANVAS_W / 2 + x1 * scale + view.offsetX;
  const screenY = CANVAS_H / 2 + y2 * scale * 0.5 - z2 * scale + view.offsetY;

  return { x: x1, y: y2, z: z2, screenX, screenY };
}

// ─── Canvas Renderer ────────────────────────────────────────────────────────

function renderAirspace(
  ctx: CanvasRenderingContext2D,
  drones: Array<{ lat: number; lng: number; altitudeM: number; identifier: string; pilotName: string }>,
  traffic: AirspaceTraffic[],
  view: ViewParams,
  showAltitudeLayers: boolean,
  showThreatZones: boolean,
  hoveredId: string | null,
  time: number
) {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // ─── Ground plane ────────────────────────────────────────────────────
  const corners = [
    geoTo3D(GEO_BOUNDS.minLat, GEO_BOUNDS.minLng, 0, view),
    geoTo3D(GEO_BOUNDS.minLat, GEO_BOUNDS.maxLng, 0, view),
    geoTo3D(GEO_BOUNDS.maxLat, GEO_BOUNDS.maxLng, 0, view),
    geoTo3D(GEO_BOUNDS.maxLat, GEO_BOUNDS.minLng, 0, view),
  ];

  ctx.beginPath();
  ctx.moveTo(corners[0].screenX, corners[0].screenY);
  for (let i = 1; i < corners.length; i++) {
    ctx.lineTo(corners[i].screenX, corners[i].screenY);
  }
  ctx.closePath();
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ─── Grid lines on ground ────────────────────────────────────────────
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 8; i++) {
    const lat = GEO_BOUNDS.minLat + (i / 8) * (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat);
    const p1 = geoTo3D(lat, GEO_BOUNDS.minLng, 0, view);
    const p2 = geoTo3D(lat, GEO_BOUNDS.maxLng, 0, view);
    ctx.beginPath();
    ctx.moveTo(p1.screenX, p1.screenY);
    ctx.lineTo(p2.screenX, p2.screenY);
    ctx.stroke();
  }
  for (let i = 0; i <= 8; i++) {
    const lng = GEO_BOUNDS.minLng + (i / 8) * (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng);
    const p1 = geoTo3D(GEO_BOUNDS.minLat, lng, 0, view);
    const p2 = geoTo3D(GEO_BOUNDS.maxLat, lng, 0, view);
    ctx.beginPath();
    ctx.moveTo(p1.screenX, p1.screenY);
    ctx.lineTo(p2.screenX, p2.screenY);
    ctx.stroke();
  }

  // ─── Altitude layers ─────────────────────────────────────────────────
  if (showAltitudeLayers) {
    for (const layer of ALTITUDE_LAYERS) {
      if (layer.altitude === 0) continue;
      const lCorners = [
        geoTo3D(GEO_BOUNDS.minLat, GEO_BOUNDS.minLng, layer.altitude, view),
        geoTo3D(GEO_BOUNDS.minLat, GEO_BOUNDS.maxLng, layer.altitude, view),
        geoTo3D(GEO_BOUNDS.maxLat, GEO_BOUNDS.maxLng, layer.altitude, view),
        geoTo3D(GEO_BOUNDS.maxLat, GEO_BOUNDS.minLng, layer.altitude, view),
      ];

      ctx.beginPath();
      ctx.moveTo(lCorners[0].screenX, lCorners[0].screenY);
      for (let i = 1; i < lCorners.length; i++) {
        ctx.lineTo(lCorners[i].screenX, lCorners[i].screenY);
      }
      ctx.closePath();
      ctx.fillStyle = `${layer.color}08`;
      ctx.fill();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = `${layer.color}40`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.setLineDash([]);

      // Label on right edge
      ctx.fillStyle = `${layer.color}90`;
      ctx.font = "bold 9px monospace";
      ctx.fillText(layer.label, lCorners[1].screenX + 4, lCorners[1].screenY);
    }
  }

  // ─── Altitude poles for vertical reference ───────────────────────────
  const poleBase = geoTo3D(GEO_BOUNDS.maxLat, GEO_BOUNDS.maxLng, 0, view);
  const poleTop = geoTo3D(GEO_BOUNDS.maxLat, GEO_BOUNDS.maxLng, MAX_ALTITUDE_M, view);
  ctx.beginPath();
  ctx.moveTo(poleBase.screenX, poleBase.screenY);
  ctx.lineTo(poleTop.screenX, poleTop.screenY);
  ctx.strokeStyle = "#9ca3af40";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Tick marks
  for (let alt = 1000; alt <= MAX_ALTITUDE_M; alt += 1000) {
    const tick = geoTo3D(GEO_BOUNDS.maxLat, GEO_BOUNDS.maxLng, alt, view);
    ctx.beginPath();
    ctx.moveTo(tick.screenX - 3, tick.screenY);
    ctx.lineTo(tick.screenX + 3, tick.screenY);
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = "#9ca3af";
    ctx.font = "8px monospace";
    ctx.fillText(`${alt / 1000}k`, tick.screenX + 6, tick.screenY + 3);
  }

  // ─── Collect all objects for depth sorting ───────────────────────────
  const objects: Array<{
    type: "drone" | "traffic";
    data: any;
    projected: ReturnType<typeof geoTo3D>;
    groundProjected: ReturnType<typeof geoTo3D>;
  }> = [];

  // Drones
  for (const drone of drones) {
    const proj = geoTo3D(drone.lat, drone.lng, drone.altitudeM, view);
    const groundProj = geoTo3D(drone.lat, drone.lng, 0, view);
    objects.push({ type: "drone", data: drone, projected: proj, groundProjected: groundProj });
  }

  // Traffic
  for (const aircraft of traffic) {
    const proj = geoTo3D(aircraft.lat, aircraft.lng, aircraft.altitudeM, view);
    const groundProj = geoTo3D(aircraft.lat, aircraft.lng, 0, view);
    objects.push({ type: "traffic", data: aircraft, projected: proj, groundProjected: groundProj });
  }

  // Sort by Y (depth) — further objects first
  objects.sort((a, b) => a.projected.y - b.projected.y);

  // ─── Render objects ──────────────────────────────────────────────────
  for (const obj of objects) {
    const { screenX, screenY } = obj.projected;
    const gx = obj.groundProjected.screenX;
    const gy = obj.groundProjected.screenY;

    // Vertical line from ground to aircraft
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(screenX, screenY);
    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = obj.type === "drone" ? "#E3061350" : "#6b728050";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.setLineDash([]);

    // Ground shadow
    ctx.beginPath();
    ctx.arc(gx, gy, 3, 0, Math.PI * 2);
    ctx.fillStyle = obj.type === "drone" ? "#E3061330" : "#6b728020";
    ctx.fill();

    if (obj.type === "drone") {
      const drone = obj.data;
      const isHovered = hoveredId === drone.identifier;

      // Threat zone ring
      if (showThreatZones) {
        const pulseR = 12 + Math.sin(time * 3) * 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = "#E3061315";
        ctx.fill();
        ctx.strokeStyle = "#E3061340";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Drone marker
      const r = isHovered ? 8 : 6;
      ctx.beginPath();
      ctx.arc(screenX, screenY, r, 0, Math.PI * 2);
      ctx.fillStyle = "#E30613";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();

      // Label
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 10px system-ui";
      ctx.fillText(drone.identifier, screenX + 10, screenY - 4);
      ctx.fillStyle = "#6b7280";
      ctx.font = "9px system-ui";
      ctx.fillText(`${Math.round(drone.altitudeM)}m AGL`, screenX + 10, screenY + 8);
    } else {
      const aircraft = obj.data as AirspaceTraffic;
      const color = CATEGORY_COLORS[aircraft.category];
      const isHovered = hoveredId === aircraft.id;

      // Threat ring if close to any drone
      if (showThreatZones) {
        for (const drone of drones) {
          const dist = haversineM(drone.lat, drone.lng, aircraft.lat, aircraft.lng);
          const altDiff = Math.abs(drone.altitudeM - aircraft.altitudeM);
          const threat = classifyThreat(dist, altDiff);
          if (threat !== "none") {
            const threatColor = getThreatColor(threat);
            ctx.beginPath();
            ctx.arc(screenX, screenY, 10 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
            ctx.strokeStyle = `${threatColor}80`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      // Aircraft marker
      const r = isHovered ? 6 : 4;
      ctx.beginPath();
      ctx.arc(screenX, screenY, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Callsign label
      if (aircraft.callsign || isHovered) {
        ctx.fillStyle = color;
        ctx.font = "bold 8px monospace";
        ctx.fillText(aircraft.callsign ?? "???", screenX + 8, screenY - 2);
        ctx.fillStyle = "#9ca3af";
        ctx.font = "7px monospace";
        ctx.fillText(`${Math.round(aircraft.altitudeM)}m`, screenX + 8, screenY + 7);
      }
    }
  }

  // ─── City labels ─────────────────────────────────────────────────────
  const cities = [
    { name: "Interlaken", lat: 46.686, lng: 7.863 },
    { name: "Grindelwald", lat: 46.624, lng: 8.041 },
    { name: "Lauterbrunnen", lat: 46.593, lng: 7.909 },
    { name: "Brienz", lat: 46.754, lng: 8.047 },
    { name: "Thun", lat: 46.758, lng: 7.630 },
    { name: "Wilderswil", lat: 46.657, lng: 7.868 },
  ];

  for (const city of cities) {
    if (city.lat < GEO_BOUNDS.minLat || city.lat > GEO_BOUNDS.maxLat) continue;
    if (city.lng < GEO_BOUNDS.minLng || city.lng > GEO_BOUNDS.maxLng) continue;
    const p = geoTo3D(city.lat, city.lng, 0, view);
    ctx.fillStyle = "#6b728080";
    ctx.font = "9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(city.name, p.screenX, p.screenY + 12);
    ctx.textAlign = "left";

    // Small dot marker
    ctx.beginPath();
    ctx.arc(p.screenX, p.screenY, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#d1d5db";
    ctx.fill();
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AirspaceView3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<ViewParams>({
    rotateX: 55,
    rotateZ: -15,
    zoom: 1.1,
    offsetX: 0,
    offsetY: 40,
  });
  const [showAltitudeLayers, setShowAltitudeLayers] = useState(true);
  const [showThreatZones, setShowThreatZones] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState<{ x: number; y: number } | null>(null);
  const timeRef = useRef(0);
  const animRef = useRef<number>(0);

  // Build drone data from demo flights
  const [droneProgress, setDroneProgress] = useState(0.55);
  useEffect(() => {
    const t = setInterval(() => setDroneProgress((p) => (p >= 0.95 ? 0.1 : p + 0.001)), 50);
    return () => clearInterval(t);
  }, []);

  const drones = DEMO_FLIGHTS.filter((f) => f.status === "in_air").map((flight, i) => {
    const pickupLat = parseFloat(flight.booking.pickupLat);
    const pickupLng = parseFloat(flight.booking.pickupLng);
    const deliveryLat = parseFloat(flight.booking.deliveryLat);
    const deliveryLng = parseFloat(flight.booking.deliveryLng);
    const p = Math.min(1, droneProgress + i * 0.15);

    return {
      lat: pickupLat + (deliveryLat - pickupLat) * p,
      lng: pickupLng + (deliveryLng - pickupLng) * p,
      altitudeM: 120 + Math.sin(droneProgress * Math.PI * 4 + i) * 20,
      identifier: flight.booking.identifier,
      pilotName: flight.booking.pilotName,
    };
  });

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;

    function frame() {
      timeRef.current += 0.016;
      renderAirspace(
        ctx!,
        drones,
        DEMO_AIRSPACE_TRAFFIC,
        view,
        showAltitudeLayers,
        showThreatZones,
        hoveredId,
        timeRef.current
      );
      animRef.current = requestAnimationFrame(frame);
    }
    frame();

    return () => cancelAnimationFrame(animRef.current);
  }, [view, drones, showAltitudeLayers, showThreatZones, hoveredId]);

  // Mouse interaction for rotation
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !lastMouse) return;
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      setView((v) => ({
        ...v,
        rotateZ: v.rotateZ + dx * 0.3,
        rotateX: Math.max(20, Math.min(80, v.rotateX + dy * 0.3)),
      }));
      setLastMouse({ x: e.clientX, y: e.clientY });
    },
    [isDragging, lastMouse]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastMouse(null);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setView((v) => ({
      ...v,
      zoom: Math.max(0.5, Math.min(2.5, v.zoom - e.deltaY * 0.001)),
    }));
  }, []);

  // Category counts for legend
  const categoryCounts: Record<string, number> = {};
  for (const t of DEMO_AIRSPACE_TRAFFIC) {
    categoryCounts[t.category] = (categoryCounts[t.category] ?? 0) + 1;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-bold text-gray-900">3D Luftraum-Visualisierung</h3>
          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAltitudeLayers(!showAltitudeLayers)}
            className={`p-1.5 rounded-lg text-xs ${showAltitudeLayers ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"}`}
            title="Höhenschichten"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowThreatZones(!showThreatZones)}
            className={`p-1.5 rounded-lg text-xs ${showThreatZones ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"}`}
            title="Bedrohungszonen"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView((v) => ({ ...v, zoom: Math.min(2.5, v.zoom + 0.2) }))}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView((v) => ({ ...v, zoom: Math.max(0.5, v.zoom - 0.2) }))}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView({ rotateX: 55, rotateZ: -15, zoom: 1.1, offsetX: 0, offsetY: 40 })}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
            title="Ansicht zurücksetzen"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full cursor-grab active:cursor-grabbing"
          style={{ width: CANVAS_W, height: CANVAS_H, maxWidth: "100%" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
        {/* Interaction hint */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[9px] text-gray-400 bg-white/80 px-2 py-1 rounded-lg">
          <Info className="w-3 h-3" />
          Klicken + Ziehen zum Drehen · Scrollen zum Zoomen
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow" />
          <span className="text-[10px] text-gray-500 font-medium">AIRBASE Drohne ({drones.length})</span>
        </div>
        {Object.entries(categoryCounts).map(([cat, count]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[cat as AircraftCategory] }}
            />
            <span className="text-[10px] text-gray-500">
              {CATEGORY_LABELS[cat as AircraftCategory]} ({count})
            </span>
          </div>
        ))}
        {showAltitudeLayers && (
          <>
            <span className="text-gray-200">|</span>
            {ALTITUDE_LAYERS.filter((l) => l.altitude > 0).map((l) => (
              <div key={l.altitude} className="flex items-center gap-1">
                <span className="w-3 h-0.5" style={{ backgroundColor: l.color }} />
                <span className="text-[9px] text-gray-400 font-mono">{l.label}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
