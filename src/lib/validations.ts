import { z } from "zod";
import { FLYCART_30 } from "./pricing";

export const bookingStep1Schema = z.object({
  serviceType: z.enum(["LASTENFLUG"]),
  serviceSubtype: z.enum(["EINMALIGE_LIEFERUNG", "LANGZEIT_EINSATZ"]),
});

export const bookingStep2Schema = z.object({
  requestedDate: z.string().min(1, "Bitte wählen Sie ein Datum"),
  requestedTimeFrom: z.string().min(1, "Bitte wählen Sie eine Uhrzeit"),
  requestedTimeTo: z.string().optional(),
});

export const bookingStep3Schema = z.object({
  payloadWeightKg: z
    .number()
    .min(0.1, "Gewicht muss grösser als 0 sein")
    .max(
      FLYCART_30.MAX_PAYLOAD_KG,
      `Maximalnutzlast: ${FLYCART_30.MAX_PAYLOAD_KG} kg`
    ),
  payloadDescription: z.string().optional(),
  isDangerousGoods: z.boolean().default(false),
});

export const bookingStep4Schema = z.object({
  // Delivery location (required)
  deliveryLat: z.number(),
  deliveryLng: z.number(),
  deliveryAddress: z.string().min(1, "Lieferadresse erforderlich"),

  // Pickup option
  pickupOption: z.enum(["CUSTOMER_LOCATION", "VOLTAIR_HUB", "CUSTOM_PICKUP"]),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  pickupAddress: z.string().optional(),
  hubId: z.string().optional(),

  // Calculated route distance (straight-line, km) — used for pricing
  routeDistanceKm: z.number().optional(),
});

export const createBookingSchema = z.object({
  ...bookingStep1Schema.shape,
  ...bookingStep2Schema.shape,
  ...bookingStep3Schema.shape,
  ...bookingStep4Schema.shape,
  customerNotes: z.string().optional(),
});

export type BookingStep1 = z.infer<typeof bookingStep1Schema>;
export type BookingStep2 = z.infer<typeof bookingStep2Schema>;
export type BookingStep3 = z.infer<typeof bookingStep3Schema>;
export type BookingStep4 = z.infer<typeof bookingStep4Schema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
