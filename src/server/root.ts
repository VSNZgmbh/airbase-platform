import { createTRPCRouter } from "@/lib/trpc/server";
import { bookingRouter } from "./routers/booking";
import { pricingRouter } from "./routers/pricing";

export const appRouter = createTRPCRouter({
  booking: bookingRouter,
  pricing: pricingRouter,
});

export type AppRouter = typeof appRouter;
