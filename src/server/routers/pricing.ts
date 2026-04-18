import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server";
import { calculatePrice, type PickupOption } from "@/lib/pricing";
import { assessSora, soraAirspaceSurchargeCHF, isRushBooking } from "@/lib/sora";

export const pricingRouter = createTRPCRouter({
  /**
   * Calculate price breakdown including SORA airspace + rush surcharges.
   * Accepts optional coordinates + date to auto-compute SORA/rush.
   */
  calculate: publicProcedure
    .input(
      z.object({
        routeDistanceKm: z.number().min(0),
        payloadWeightKg: z.number().min(0).max(100),
        pickupOption: z.enum([
          "CUSTOMER_LOCATION",
          "VOLTAIR_HUB",
          "CUSTOM_PICKUP",
        ]),
        pickupDistanceFromHubKm: z.number().min(0).optional(),
        // Optional: provide coordinates for SORA assessment
        pickupLng: z.number().optional(),
        pickupLat: z.number().optional(),
        deliveryLng: z.number().optional(),
        deliveryLat: z.number().optional(),
        // Optional: date + time for rush detection
        requestedDate: z.string().optional(),
        requestedTimeFrom: z.string().optional(),
      })
    )
    .query(({ input }) => {
      let soraSurcharge = 0;
      let rush = false;
      let soraResult = null;

      // Auto-compute SORA surcharge if coordinates provided
      if (
        input.pickupLng != null &&
        input.pickupLat != null &&
        input.deliveryLng != null &&
        input.deliveryLat != null
      ) {
        soraResult = assessSora({
          pickupLng: input.pickupLng,
          pickupLat: input.pickupLat,
          deliveryLng: input.deliveryLng,
          deliveryLat: input.deliveryLat,
        });
        soraSurcharge = soraAirspaceSurchargeCHF(soraResult.sail);
      }

      // Auto-compute rush surcharge if date provided
      if (input.requestedDate) {
        rush = isRushBooking(input.requestedDate, input.requestedTimeFrom);
      }

      const breakdown = calculatePrice({
        routeDistanceKm: input.routeDistanceKm,
        payloadWeightKg: input.payloadWeightKg,
        pickupOption: input.pickupOption as PickupOption,
        pickupDistanceFromHubKm: input.pickupDistanceFromHubKm,
        soraAirspaceSurchargeCHF: soraSurcharge,
        isRushBooking: rush,
      });

      return {
        ...breakdown,
        soraAssessment: soraResult
          ? {
              grc: soraResult.grc,
              arc: soraResult.arc,
              sail: soraResult.sail,
              overallRisk: soraResult.overallRisk,
              requiresBazlPermit: soraResult.requiresBazlPermit,
              requiresBernBelpClearance: soraResult.requiresBernBelpClearance,
              riskFactors: soraResult.riskFactors,
            }
          : null,
        isRushBooking: rush,
      };
    }),
});
