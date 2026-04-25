import { createTRPCRouter } from "@/lib/trpc/server";
import { bookingRouter } from "./routers/booking";
import { pricingRouter } from "./routers/pricing";
import { operatorRouter } from "./routers/operator";
import { pilotRouter } from "./routers/pilot";
import { analyticsRouter } from "./routers/analytics";
import { weatherRouter } from "./routers/weather";
import { notamRouter } from "./routers/notam";
import { tenantRouter } from "./routers/tenant";
import { permitRouter } from "./routers/permit";
import { safetyRouter } from "./routers/safety";
import { airspaceRouter } from "./routers/airspace";
import { telemetryRouter } from "./routers/telemetry";
import { flightAssignmentRouter } from "./routers/flight-assignment";

export const appRouter = createTRPCRouter({
  booking: bookingRouter,
  pricing: pricingRouter,
  operator: operatorRouter,
  pilot: pilotRouter,
  analytics: analyticsRouter,
  weather: weatherRouter,
  notam: notamRouter,
  tenant: tenantRouter,
  permit: permitRouter,
  safety: safetyRouter,
  airspace: airspaceRouter,
  telemetry: telemetryRouter,
  flightAssignment: flightAssignmentRouter,
});

export type AppRouter = typeof appRouter;
