import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server";
import { calculatePrice, type PickupOption } from "@/lib/pricing";

export const pricingRouter = createTRPCRouter({
  calculate: publicProcedure
    .input(
      z.object({
        routeDistanceKm: z.number().min(0),
        payloadWeightKg: z.number().min(0).max(100),
        pickupOption: z.enum([
          "CUSTOMER_LOCATION",
          "AIRBASE_HUB",
          "CUSTOM_PICKUP",
        ]),
        pickupDistanceFromHubKm: z.number().min(0).optional(),
      })
    )
    .query(({ input }) => {
      return calculatePrice({
        ...input,
        pickupOption: input.pickupOption as PickupOption,
      });
    }),
});
