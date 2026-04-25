import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  pgEnum,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const bookingStatusEnum = pgEnum("booking_status", [
  "draft",
  "pending",
  "quoted",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

export const serviceTypeEnum = pgEnum("service_type", [
  "LASTENFLUG",
  "PERSONENFLUG",
  "INSPEKTION",
]);

export const serviceSubtypeEnum = pgEnum("service_subtype", [
  "EINMALIGE_LIEFERUNG",
  "LANGZEIT_EINSATZ",
]);

export const pickupOptionEnum = pgEnum("pickup_option", [
  "CUSTOMER_LOCATION",
  "AIRBASE_HUB",
  "CUSTOM_PICKUP",
]);

export const flightStatusEnum = pgEnum("flight_status", [
  "scheduled",
  "pre_flight_check",
  "in_air",
  "landed",
  "completed",
  "aborted",
]);

export const permitStatusEnum = pgEnum("permit_status", [
  "not_required",
  "pending",
  "submitted",
  "approved",
  "rejected",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

/**
 * Drone model catalog — reference data for supported drone platforms.
 * Specs used for payload validation, flight planning, and GRC calculations.
 */
export const droneModels = pgTable("drone_models", {
  id: uuid("id").primaryKey().defaultRandom(),
  manufacturer: text("manufacturer").notNull(),
  modelName: text("model_name").notNull().unique(),
  /** e.g. "heavy_lift", "inspection", "survey" */
  category: text("category").notNull().default("heavy_lift"),

  // Performance specs
  maxPayloadKg: decimal("max_payload_kg", { precision: 6, scale: 2 }).notNull(),
  maxTakeoffWeightKg: decimal("max_takeoff_weight_kg", { precision: 6, scale: 2 }).notNull(),
  emptyWeightKg: decimal("empty_weight_kg", { precision: 6, scale: 2 }).notNull(),
  maxRangeKm: decimal("max_range_km", { precision: 6, scale: 2 }).notNull(),
  maxSpeedKmh: decimal("max_speed_kmh", { precision: 6, scale: 2 }).notNull(),
  cruiseSpeedKmh: decimal("cruise_speed_kmh", { precision: 6, scale: 2 }),
  maxAltitudeM: integer("max_altitude_m"),
  maxWindSpeedMs: decimal("max_wind_speed_ms", { precision: 5, scale: 1 }),

  // Battery
  batteryType: text("battery_type"),
  batteryCapacityAh: decimal("battery_capacity_ah", { precision: 6, scale: 2 }),
  batteryVoltageV: decimal("battery_voltage_v", { precision: 6, scale: 2 }),
  maxFlightTimeMin: integer("max_flight_time_min"),

  // Dimensions
  rotorDiameterIn: decimal("rotor_diameter_in", { precision: 5, scale: 1 }),
  foldedDimensions: text("folded_dimensions"),

  // Regulatory
  mtomClass: text("mtom_class"), // C0-C6 or "uncertified"
  noiseClassDb: decimal("noise_class_db", { precision: 5, scale: 1 }),

  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const franchiseTenants = pgTable("franchise_tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  country: text("country").notNull().default("CH"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  franchiseTenantId: uuid("franchise_tenant_id").references(
    () => franchiseTenants.id
  ),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  companyName: text("company_name"),
  address: text("address"),
  postalCode: text("postal_code"),
  city: text("city"),
  country: text("country").notNull().default("CH"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const drones = pgTable("drones", {
  id: uuid("id").primaryKey().defaultRandom(),
  model: text("model").notNull(),
  droneModelId: uuid("drone_model_id").references(() => droneModels.id),
  serialNumber: text("serial_number").notNull().unique(),
  maxPayloadKg: decimal("max_payload_kg", { precision: 6, scale: 2 }).notNull(),
  maxRangeKm: decimal("max_range_km", { precision: 6, scale: 2 }).notNull(),
  maxSpeedKmh: decimal("max_speed_kmh", { precision: 6, scale: 2 }),
  registrationId: text("registration_id"),
  isActive: boolean("is_active").notNull().default(true),
  franchiseTenantId: uuid("franchise_tenant_id").references(
    () => franchiseTenants.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pilots = pgTable("pilots", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  licenseNumber: text("license_number"),
  licenseExpiry: timestamp("license_expiry"),
  soraA1A3Certified: boolean("sora_a1_a3_certified").notNull().default(false),
  soraA2Certified: boolean("sora_a2_certified").notNull().default(false),
  sts01Certified: boolean("sts_01_certified").notNull().default(false),
  franchiseTenantId: uuid("franchise_tenant_id").references(
    () => franchiseTenants.id
  ),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const airbaseHubs = pgTable("airbase_hubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  franchiseTenantId: uuid("franchise_tenant_id").references(
    () => franchiseTenants.id
  ),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull().unique(), // e.g. AIR-2024-001
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  franchiseTenantId: uuid("franchise_tenant_id").references(
    () => franchiseTenants.id
  ),

  // Service details
  serviceType: serviceTypeEnum("service_type").notNull(),
  serviceSubtype: serviceSubtypeEnum("service_subtype"),
  status: bookingStatusEnum("status").notNull().default("draft"),

  // Schedule
  requestedDate: timestamp("requested_date").notNull(),
  requestedTimeFrom: text("requested_time_from"), // HH:mm
  requestedTimeTo: text("requested_time_to"),

  // Cargo
  payloadWeightKg: decimal("payload_weight_kg", {
    precision: 6,
    scale: 2,
  }).notNull(),
  payloadDescription: text("payload_description"),
  isDangerousGoods: boolean("is_dangerous_goods").notNull().default(false),

  // Delivery location
  deliveryLat: decimal("delivery_lat", { precision: 10, scale: 7 }).notNull(),
  deliveryLng: decimal("delivery_lng", { precision: 10, scale: 7 }).notNull(),
  deliveryAddress: text("delivery_address"),

  // Pickup option
  pickupOption: pickupOptionEnum("pickup_option").notNull(),
  pickupLat: decimal("pickup_lat", { precision: 10, scale: 7 }),
  pickupLng: decimal("pickup_lng", { precision: 10, scale: 7 }),
  pickupAddress: text("pickup_address"),
  hubId: uuid("hub_id").references(() => airbaseHubs.id),

  // Route
  routeDistanceKm: decimal("route_distance_km", { precision: 8, scale: 2 }),

  // Pricing
  basePriceCHF: decimal("base_price_chf", { precision: 10, scale: 2 }),
  weightSurchargeCHF: decimal("weight_surcharge_chf", {
    precision: 10,
    scale: 2,
  }),
  pickupSurchargeCHF: decimal("pickup_surcharge_chf", {
    precision: 10,
    scale: 2,
  }),
  /** Phase 5: SORA airspace complexity surcharge */
  soraSurchargeCHF: decimal("sora_surcharge_chf", { precision: 10, scale: 2 }).default("0"),
  /** Phase 5: Rush booking surcharge */
  rushSurchargeCHF: decimal("rush_surcharge_chf", { precision: 10, scale: 2 }).default("0"),
  subtotalCHF: decimal("subtotal_chf", { precision: 10, scale: 2 }),
  vatPercent: decimal("vat_percent", { precision: 4, scale: 2 }).default(
    "8.10"
  ),
  vatAmountCHF: decimal("vat_amount_chf", { precision: 10, scale: 2 }),
  totalCHF: decimal("total_chf", { precision: 10, scale: 2 }),

  // Notes
  customerNotes: text("customer_notes"),
  operatorNotes: text("operator_notes"),
  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const flights = pgTable("flights", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id),
  droneId: uuid("drone_id").references(() => drones.id),
  pilotId: uuid("pilot_id").references(() => pilots.id),
  status: flightStatusEnum("status").notNull().default("scheduled"),

  scheduledDeparture: timestamp("scheduled_departure"),
  scheduledArrival: timestamp("scheduled_arrival"),
  actualDeparture: timestamp("actual_departure"),
  actualArrival: timestamp("actual_arrival"),

  flightPlanJson: jsonb("flight_plan_json"),
  grcScore: integer("grc_score"),
  arcScore: integer("arc_score"),
  soraCategory: text("sora_category"),

  notes: text("notes"),
  incidentReport: text("incident_report"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const permits = pgTable("permits", {
  id: uuid("id").primaryKey().defaultRandom(),
  flightId: uuid("flight_id")
    .notNull()
    .references(() => flights.id),
  authority: text("authority").notNull(), // BAZL, airport, municipality
  status: permitStatusEnum("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  expiresAt: timestamp("expires_at"),
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amountCHF: decimal("amount_chf", { precision: 10, scale: 2 }).notNull(),
  vatAmountCHF: decimal("vat_amount_chf", { precision: 10, scale: 2 }),
  totalCHF: decimal("total_chf", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tenantPricingConfig = pgTable("tenant_pricing_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  franchiseTenantId: uuid("franchise_tenant_id")
    .notNull()
    .unique()
    .references(() => franchiseTenants.id),
  baseRateCHFPerKm: decimal("base_rate_chf_per_km", {
    precision: 8,
    scale: 2,
  }).notNull().default("12.00"),
  weightFreeKg: decimal("weight_free_kg", { precision: 6, scale: 2 }).notNull().default("20"),
  weightSurchargeCHFPerKg: decimal("weight_surcharge_chf_per_kg", {
    precision: 6,
    scale: 2,
  }).notNull().default("0.50"),
  hubPickupSurchargeCHF: decimal("hub_pickup_surcharge_chf", {
    precision: 8,
    scale: 2,
  }).notNull().default("25.00"),
  customPickupCHFPerKm: decimal("custom_pickup_chf_per_km", {
    precision: 6,
    scale: 2,
  }).notNull().default("2.00"),
  minimumBookingCHF: decimal("minimum_booking_chf", {
    precision: 8,
    scale: 2,
  }).notNull().default("120.00"),
  vatPercent: decimal("vat_percent", { precision: 4, scale: 2 }).notNull().default("8.10"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tenantServiceAreas = pgTable("tenant_service_areas", {
  id: uuid("id").primaryKey().defaultRandom(),
  franchiseTenantId: uuid("franchise_tenant_id")
    .notNull()
    .references(() => franchiseTenants.id),
  name: text("name").notNull(),
  // GeoJSON polygon or center+radius
  geoJson: jsonb("geo_json"),
  centerLat: decimal("center_lat", { precision: 10, scale: 7 }),
  centerLng: decimal("center_lng", { precision: 10, scale: 7 }),
  radiusKm: decimal("radius_km", { precision: 6, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const droneModelsRelations = relations(droneModels, ({ many }) => ({
  drones: many(drones),
}));

export const dronesRelations = relations(drones, ({ one }) => ({
  droneModel: one(droneModels, {
    fields: [drones.droneModelId],
    references: [droneModels.id],
  }),
  franchiseTenant: one(franchiseTenants, {
    fields: [drones.franchiseTenantId],
    references: [franchiseTenants.id],
  }),
}));

export const franchiseTenantsRelations = relations(franchiseTenants, ({ one, many }) => ({
  pricingConfig: one(tenantPricingConfig, {
    fields: [franchiseTenants.id],
    references: [tenantPricingConfig.franchiseTenantId],
  }),
  serviceAreas: many(tenantServiceAreas),
  pilots: many(pilots),
  drones: many(drones),
  hubs: many(airbaseHubs),
}));

export const customersRelations = relations(customers, ({ many, one }) => ({
  bookings: many(bookings),
  franchiseTenant: one(franchiseTenants, {
    fields: [customers.franchiseTenantId],
    references: [franchiseTenants.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(customers, {
    fields: [bookings.customerId],
    references: [customers.id],
  }),
  hub: one(airbaseHubs, {
    fields: [bookings.hubId],
    references: [airbaseHubs.id],
  }),
  flights: many(flights),
  invoices: many(invoices),
}));

export const flightsRelations = relations(flights, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [flights.bookingId],
    references: [bookings.id],
  }),
  drone: one(drones, {
    fields: [flights.droneId],
    references: [drones.id],
  }),
  pilot: one(pilots, {
    fields: [flights.pilotId],
    references: [pilots.id],
  }),
  permits: many(permits),
}));

export const permitsRelations = relations(permits, ({ one }) => ({
  flight: one(flights, {
    fields: [permits.flightId],
    references: [flights.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  booking: one(bookings, {
    fields: [invoices.bookingId],
    references: [bookings.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));

// ─── Phase 5: LUC Safety Dashboard ───────────────────────────────────────────

export const authorizationDecisionEnum = pgEnum("authorization_decision", [
  "approved",
  "rejected",
  "escalated",
]);

export const authorizationDecisionByEnum = pgEnum("authorization_decision_by", [
  "system",
  "safety_manager",
  "accountable_manager",
]);

export const occurrenceSeverityEnum = pgEnum("occurrence_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const occurrenceStatusEnum = pgEnum("occurrence_status", [
  "open",
  "under_review",
  "resolved",
]);

export const phaseOfOperationEnum = pgEnum("phase_of_operation", [
  "takeoff",
  "cruise",
  "landing",
  "ground",
  "hover",
]);

/**
 * LUC Self-Authorization log — every automated Go/No-Go decision.
 * Provides the full audit trail required for BAZL LUC audits.
 */
export const flightAuthorizations = pgTable("flight_authorizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Optional link to a booking */
  bookingId: uuid("booking_id").references(() => bookings.id),
  /** Optional link to a scheduled flight */
  flightId: uuid("flight_id").references(() => flights.id),
  /** Franchise tenant this authorization belongs to */
  franchiseTenantId: uuid("franchise_tenant_id").references(() => franchiseTenants.id),

  // Route
  pickupLat: decimal("pickup_lat", { precision: 10, scale: 7 }).notNull(),
  pickupLng: decimal("pickup_lng", { precision: 10, scale: 7 }).notNull(),
  deliveryLat: decimal("delivery_lat", { precision: 10, scale: 7 }).notNull(),
  deliveryLng: decimal("delivery_lng", { precision: 10, scale: 7 }).notNull(),
  altitudeAgl: integer("altitude_agl").default(120),

  /** ISO datetime for which the flight is planned */
  requestedForDatetime: timestamp("requested_for_datetime").notNull(),

  // SORA snapshot
  sailLevel: text("sail_level"),
  grcScore: integer("grc_score"),
  arcLevel: text("arc_level"),
  overallRisk: text("overall_risk"),

  // Full JSON snapshots for audit
  soraResultJson: jsonb("sora_result_json"),
  weatherResultJson: jsonb("weather_result_json"),
  notamResultJson: jsonb("notam_result_json"),

  // Decision
  decision: authorizationDecisionEnum("decision").notNull(),
  decisionReason: text("decision_reason").notNull(),
  decisionBy: authorizationDecisionByEnum("decision_by").notNull().default("system"),
  /** Set when a human safety manager overrides the system */
  decisionByUserId: text("decision_by_user_id"),
  decidedAt: timestamp("decided_at").notNull().defaultNow(),

  // Three-tier audit: Safety Manager intermediate approval (before Accountable Manager)
  safetyManagerDecision: authorizationDecisionEnum("safety_manager_decision"),
  safetyManagerUserId: text("safety_manager_user_id"),
  safetyManagerDecidedAt: timestamp("safety_manager_decided_at"),

  // ─── Retention & export metadata ──────────────────────────────────────────
  /** When this authorization was exported to BAZL */
  bazlExportedAt: timestamp("bazl_exported_at"),
  /** Flight authorizations: 3-year retention per BAZL LUC requirements */
  retentionExpiresAt: timestamp("retention_expires_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Safety Occurrence Reports (SOR) — mandatory for LUC compliance.
 */
export const safetyOccurrences = pgTable("safety_occurrences", {
  id: uuid("id").primaryKey().defaultRandom(),
  flightId: uuid("flight_id").references(() => flights.id),
  authorizationId: uuid("authorization_id").references(() => flightAuthorizations.id),
  franchiseTenantId: uuid("franchise_tenant_id").references(() => franchiseTenants.id),

  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: occurrenceSeverityEnum("severity").notNull().default("medium"),
  category: text("category").notNull().default("operational"), // operational | weather | airspace | technical | human

  reportedAt: timestamp("reported_at").notNull().defaultNow(),
  reportedByUserId: text("reported_by_user_id"),

  status: occurrenceStatusEnum("status").notNull().default("open"),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),

  // ─── ECCAIRS/ADREP mandatory fields (EU Regulation 376/2014) ──────────────
  /** When the incident actually occurred (distinct from reportedAt) */
  incidentOccurredAt: timestamp("incident_occurred_at"),
  /** Location of the incident (WGS84) */
  incidentLat: decimal("incident_lat", { precision: 10, scale: 7 }),
  incidentLng: decimal("incident_lng", { precision: 10, scale: 7 }),
  /** Phase of flight operation at time of incident */
  phaseOfOperation: phaseOfOperationEnum("phase_of_operation"),
  /** Whether the event qualifies as a near-miss */
  isNearMiss: boolean("is_near_miss").notNull().default(false),
  /** Root cause analysis */
  rootCause: text("root_cause"),
  /** Contributing factors (ECCAIRS taxonomy codes or free text) */
  contributingFactors: jsonb("contributing_factors").$type<string[]>().default([]),
  /** Corrective actions taken or recommended */
  correctiveActions: text("corrective_actions"),
  /** Clerk user ID of the investigator */
  investigatedByUserId: text("investigated_by_user_id"),
  /** When the investigation was completed */
  investigationCompletedAt: timestamp("investigation_completed_at"),
  /** When BAZL was notified of this occurrence */
  bazlNotifiedAt: timestamp("bazl_notified_at"),
  /** BAZL reference number for this report */
  bazlReferenceNumber: text("bazl_reference_number"),
  /** ECCAIRS report identifier */
  eccairsReportId: text("eccairs_report_id"),

  // ─── Retention metadata ───────────────────────────────────────────────────
  /** Safety occurrences: 5-year retention per BAZL/EU 376/2014 */
  retentionExpiresAt: timestamp("retention_expires_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Phase 5 Relations ────────────────────────────────────────────────────────

export const flightAuthorizationsRelations = relations(flightAuthorizations, ({ one }) => ({
  booking: one(bookings, {
    fields: [flightAuthorizations.bookingId],
    references: [bookings.id],
  }),
  flight: one(flights, {
    fields: [flightAuthorizations.flightId],
    references: [flights.id],
  }),
  franchiseTenant: one(franchiseTenants, {
    fields: [flightAuthorizations.franchiseTenantId],
    references: [franchiseTenants.id],
  }),
}));

export const safetyOccurrencesRelations = relations(safetyOccurrences, ({ one }) => ({
  flight: one(flights, {
    fields: [safetyOccurrences.flightId],
    references: [flights.id],
  }),
  authorization: one(flightAuthorizations, {
    fields: [safetyOccurrences.authorizationId],
    references: [flightAuthorizations.id],
  }),
  franchiseTenant: one(franchiseTenants, {
    fields: [safetyOccurrences.franchiseTenantId],
    references: [franchiseTenants.id],
  }),
}));

// ─── Phase 6: Live Telemetry Tracking ───────────────────────────────────────

export const telemetrySourceEnum = pgEnum("telemetry_source", [
  "dji_cloud_api",
  "lte_gps_tracker",
  "manual",
  "simulation",
]);

/**
 * Drone telemetry log — every position report from DJI Cloud API (MQTT) or
 * BAZL-redundant LTE-GPS tracker. High-write table, partitioned by time in prod.
 */
export const droneTelemetry = pgTable("drone_telemetry", {
  id: uuid("id").primaryKey().defaultRandom(),
  droneId: uuid("drone_id").references(() => drones.id),
  flightId: uuid("flight_id").references(() => flights.id),
  droneSerial: text("drone_serial").notNull(),

  // Position (WGS84)
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  altitudeMslM: decimal("altitude_msl_m", { precision: 8, scale: 2 }).notNull(),
  altitudeAglM: decimal("altitude_agl_m", { precision: 8, scale: 2 }),

  // Velocity
  speedKmh: decimal("speed_kmh", { precision: 6, scale: 2 }),
  headingDeg: decimal("heading_deg", { precision: 6, scale: 2 }),
  verticalSpeedMps: decimal("vertical_speed_mps", { precision: 6, scale: 2 }),

  // Battery (DB2160: 41 Ah, 52 V)
  batteryPct: integer("battery_pct"),
  batteryVoltageV: decimal("battery_voltage_v", { precision: 6, scale: 2 }),
  estimatedFlightTimeSec: integer("estimated_flight_time_sec"),

  // Payload & Winch
  payloadWeightKg: decimal("payload_weight_kg", { precision: 6, scale: 2 }),
  winchActive: boolean("winch_active").default(false),
  cargoLocked: boolean("cargo_locked").default(true),
  cargoTempC: decimal("cargo_temp_c", { precision: 5, scale: 1 }),

  // Signal quality
  signalStrengthPct: integer("signal_strength_pct"),
  gpsAccuracyM: decimal("gps_accuracy_m", { precision: 6, scale: 2 }),
  satelliteCount: integer("satellite_count"),

  // Warnings (array of { code, severity, message })
  warnings: jsonb("warnings").$type<Array<{ code: string; severity: string; message: string }>>(),

  // Source & timestamps
  source: telemetrySourceEnum("source").notNull(),
  deviceTimestamp: timestamp("device_timestamp"),
  receivedAt: timestamp("received_at").notNull().defaultNow(),

  // ─── Retention metadata ───────────────────────────────────────────────────
  /** Telemetry data: 1-year retention per BAZL requirements */
  retentionExpiresAt: timestamp("retention_expires_at"),
});

/**
 * Latest known position per drone — upserted on each telemetry report.
 * Provides O(1) fleet-wide snapshot without scanning the telemetry log.
 */
export const droneLatestPosition = pgTable("drone_latest_position", {
  droneSerial: text("drone_serial").primaryKey(),
  droneId: uuid("drone_id").references(() => drones.id),
  flightId: uuid("flight_id").references(() => flights.id),

  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  altitudeMslM: decimal("altitude_msl_m", { precision: 8, scale: 2 }).notNull(),
  altitudeAglM: decimal("altitude_agl_m", { precision: 8, scale: 2 }),
  speedKmh: decimal("speed_kmh", { precision: 6, scale: 2 }),
  headingDeg: decimal("heading_deg", { precision: 6, scale: 2 }),
  batteryPct: integer("battery_pct"),
  estimatedFlightTimeSec: integer("estimated_flight_time_sec"),
  payloadWeightKg: decimal("payload_weight_kg", { precision: 6, scale: 2 }),
  winchActive: boolean("winch_active").default(false),
  cargoLocked: boolean("cargo_locked").default(true),
  signalStrengthPct: integer("signal_strength_pct"),
  warnings: jsonb("warnings").$type<Array<{ code: string; severity: string; message: string }>>(),
  source: telemetrySourceEnum("source").notNull(),
  isAirborne: boolean("is_airborne").notNull().default(false),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Phase 6 Relations ──────────────────────────────────────────────────────

export const droneTelemetryRelations = relations(droneTelemetry, ({ one }) => ({
  drone: one(drones, {
    fields: [droneTelemetry.droneId],
    references: [drones.id],
  }),
  flight: one(flights, {
    fields: [droneTelemetry.flightId],
    references: [flights.id],
  }),
}));
