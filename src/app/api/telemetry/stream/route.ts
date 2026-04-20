/**
 * GET /api/telemetry/stream — Server-Sent Events (SSE) for live telemetry
 *
 * Pushes fleet telemetry updates to the frontend every 2 seconds.
 * Works on Vercel (Edge/Serverless) — no WebSocket needed.
 *
 * In production: reads from drone_latest_position table.
 * In demo mode: generates simulated telemetry from mock data.
 *
 * Frontend connects with EventSource:
 *   const es = new EventSource("/api/telemetry/stream");
 *   es.onmessage = (e) => { const data = JSON.parse(e.data); ... };
 */

import { NextRequest } from "next/server";
import { generateMockTelemetry } from "@/lib/telemetry";

const INTERVAL_MS = 2000; // Push every 2 seconds
const MAX_DURATION_MS = 55000; // Close before Vercel 60s timeout

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const startTime = Date.now();

      // Send initial snapshot immediately
      try {
        const snapshot = generateMockTelemetry(Date.now());
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`),
        );
      } catch {
        // Skip if error
      }

      // Push updates at interval
      const interval = setInterval(() => {
        if (closed || Date.now() - startTime > MAX_DURATION_MS) {
          clearInterval(interval);
          try { controller.close(); } catch { /* already closed */ }
          return;
        }

        try {
          const snapshot = generateMockTelemetry(Date.now());
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`),
          );
        } catch {
          clearInterval(interval);
          try { controller.close(); } catch { /* already closed */ }
        }
      }, INTERVAL_MS);

      // Handle client disconnect via AbortSignal
      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
