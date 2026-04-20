"use client";

/**
 * useLiveTelemetry — React hook for real-time drone fleet telemetry.
 *
 * Connects to the SSE endpoint (/api/telemetry/stream) for server-pushed
 * telemetry updates. Falls back to client-side mock generation if SSE fails.
 *
 * Usage:
 *   const { drones, isConnected, lastUpdate } = useLiveTelemetry();
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { FleetTelemetrySnapshot, TelemetryReport } from "@/lib/telemetry";
import { generateMockTelemetry } from "@/lib/telemetry";

interface UseLiveTelemetryReturn {
  drones: TelemetryReport[];
  isConnected: boolean;
  connectionSource: "sse" | "mock" | "disconnected";
  lastUpdate: string | null;
  sourceBreakdown: {
    djiCloudApi: number;
    lteGpsTracker: number;
    simulation: number;
  };
}

export function useLiveTelemetry(): UseLiveTelemetryReturn {
  const [snapshot, setSnapshot] = useState<FleetTelemetrySnapshot | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionSource, setConnectionSource] = useState<"sse" | "mock" | "disconnected">("disconnected");
  const eventSourceRef = useRef<EventSource | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startMockFallback = useCallback(() => {
    if (fallbackTimerRef.current) return;
    setConnectionSource("mock");
    setIsConnected(true);

    fallbackTimerRef.current = setInterval(() => {
      setSnapshot(generateMockTelemetry(Date.now()));
    }, 2000);

    // Initial immediate update
    setSnapshot(generateMockTelemetry(Date.now()));
  }, []);

  const stopMockFallback = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const connectSSE = useCallback(() => {
    if (typeof window === "undefined") return;

    // Clean up previous connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const es = new EventSource("/api/telemetry/stream");
      eventSourceRef.current = es;

      es.onopen = () => {
        stopMockFallback();
        setIsConnected(true);
        setConnectionSource("sse");
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as FleetTelemetrySnapshot;
          setSnapshot(data);
        } catch {
          // Invalid JSON — ignore
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        setIsConnected(false);
        setConnectionSource("disconnected");

        // Fall back to mock and try reconnecting after 5 seconds
        startMockFallback();
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, 5000);
      };
    } catch {
      // SSE not supported — use mock
      startMockFallback();
    }
  }, [startMockFallback, stopMockFallback]);

  useEffect(() => {
    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      stopMockFallback();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectSSE, stopMockFallback]);

  return {
    drones: snapshot?.drones ?? [],
    isConnected,
    connectionSource,
    lastUpdate: snapshot?.timestamp ?? null,
    sourceBreakdown: snapshot?.sourceBreakdown ?? {
      djiCloudApi: 0,
      lteGpsTracker: 0,
      simulation: 0,
    },
  };
}
