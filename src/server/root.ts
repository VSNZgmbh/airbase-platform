import { createTRPCRouter } from "@/lib/trpc/server";
import { bookingRouter } from "./routers/booking";
import { pricingRouter } from "./routers/pricing";
import { operatorRouter } from "./routers/operator";
import { pilotRouter } from "./routers/pilot";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = createTRPCRouter({
  booking: bookingRouter,
  pricing: pricingRouter,
  operator: operatorRouter,
  pilot: pilotRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
