"use client";

import { trpc } from "@/lib/trpc/client";
import { Wind, CloudRain, Eye, Loader2 } from "lucide-react";

interface WeatherBadgeProps {
  lat: number;
  lng: number;
  datetime?: string;
}

const CONDITION_CONFIG = {
  safe: {
    label: "Flugbereit",
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-500",
    text: "text-green-700",
  },
  marginal: {
    label: "Grenzbereich",
    bg: "bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-500",
    text: "text-yellow-700",
  },
  unsafe: {
    label: "Nicht flugbereit",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
    text: "text-red-700",
  },
} as const;

export function WeatherBadge({ lat, lng, datetime }: WeatherBadgeProps) {
  const { data, isLoading, error } = trpc.weather.check.useQuery(
    { lat, lng, datetime },
    { staleTime: 15 * 60 * 1000 } // 15 min cache
  );

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Wetter wird geladen...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1">
        Wetterdaten nicht verfügbar
      </div>
    );
  }

  const cfg = CONDITION_CONFIG[data.condition];

  return (
    <div className={`inline-flex items-center gap-3 text-xs border rounded-xl px-3 py-2 ${cfg.bg}`}>
      {/* Go/No-go indicator */}
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className={`font-semibold ${cfg.text}`}>{cfg.label}</span>
      </div>

      {/* Wind */}
      <div className="flex items-center gap-1 text-gray-600">
        <Wind className="w-3 h-3" />
        <span>{data.windSpeedMs.toFixed(1)} m/s</span>
      </div>

      {/* Precipitation */}
      <div className="flex items-center gap-1 text-gray-600">
        <CloudRain className="w-3 h-3" />
        <span>{data.precipitationMm.toFixed(1)} mm</span>
      </div>

      {/* Visibility */}
      {data.visibilityM !== null && (
        <div className="flex items-center gap-1 text-gray-600">
          <Eye className="w-3 h-3" />
          <span>
            {data.visibilityM >= 1000
              ? `${(data.visibilityM / 1000).toFixed(1)} km`
              : `${data.visibilityM} m`}
          </span>
        </div>
      )}

      {/* Temperature */}
      <div className="text-gray-500">{data.temperature.toFixed(0)}°C</div>
    </div>
  );
}
