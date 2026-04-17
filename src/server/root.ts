import { createTRPCRouter } from "@/lib/trpc/server";
import { bookingRouter } from "./routers/booking";
import { pricingRouter } from "./routers/pricing";
import { operatorRouter } from "./routers/operator";
import { pilotRouter } from "./routers/pilot";

export const appRouter = createTRPCRouter({
  booking: bookingRouter,
  pricing: pricingRouter,
  operator: operatorRouter,
  pilot: pilotRouter,
});

export type AppRouter = typeof appRouter;
