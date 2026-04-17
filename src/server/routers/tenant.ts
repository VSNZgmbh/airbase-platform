/**
 * Tenant Router — Franchise multi-tenancy management
 * Handles per-franchise configuration, pricing overrides, and resource listing.
 */

import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  franchiseAdminProcedure,
  tenantProcedure,
} from "@/lib/trpc/server";
import {
  franchiseTenants,
  tenantPricingConfig,
  tenantServiceAreas,
  pilots,
  drones,
  bookings,
} from "@/lib/db/schema";

export const tenantRouter = createTRPCRouter({
  /**
   * Get current tenant info + pricing config.
   * Available to any request with a resolved tenant context.
   */
  getConfig: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await ctx.db.query.franchiseTenants.findFirst({
      where: eq(franchiseTenants.id, ctx.tenantId),
      with: { pricingConfig: true, serviceAreas: true },
    });

    if (!tenant) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
    }

    return tenant;
  }),

  /**
   * Update franchise pricing configuration.
   * Upserts the pricing config row for this tenant.
   */
  updatePricing: franchiseAdminProcedure
    .input(
      z.object({
        baseRateCHFPerKm: z.number().min(1).max(100).optional(),
        weightFreeKg: z.number().min(0).max(200).optional(),
        weightSurchargeCHFPerKg: z.number().min(0).max(10).optional(),
        hubPickupSurchargeCHF: z.number().min(0).max(200).optional(),
        customPickupCHFPerKm: z.number().min(0).max(20).optional(),
        minimumBookingCHF: z.number().min(0).max(500).optional(),
        vatPercent: z.number().min(0).max(30).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.tenantPricingConfig.findFirst({
        where: eq(tenantPricingConfig.franchiseTenantId, ctx.tenantId),
      });

      const values = {
        franchiseTenantId: ctx.tenantId,
        ...(input.baseRateCHFPerKm !== undefined && {
          baseRateCHFPerKm: input.baseRateCHFPerKm.toFixed(2),
        }),
        ...(input.weightFreeKg !== undefined && {
          weightFreeKg: input.weightFreeKg.toFixed(2),
        }),
        ...(input.weightSurchargeCHFPerKg !== undefined && {
          weightSurchargeCHFPerKg: input.weightSurchargeCHFPerKg.toFixed(2),
        }),
        ...(input.hubPickupSurchargeCHF !== undefined && {
          hubPickupSurchargeCHF: input.hubPickupSurchargeCHF.toFixed(2),
        }),
        ...(input.customPickupCHFPerKm !== undefined && {
          customPickupCHFPerKm: input.customPickupCHFPerKm.toFixed(2),
        }),
        ...(input.minimumBookingCHF !== undefined && {
          minimumBookingCHF: input.minimumBookingCHF.toFixed(2),
        }),
        ...(input.vatPercent !== undefined && {
          vatPercent: input.vatPercent.toFixed(2),
        }),
        updatedAt: new Date(),
      };

      if (existing) {
        const [updated] = await ctx.db
          .update(tenantPricingConfig)
          .set(values)
          .where(eq(tenantPricingConfig.franchiseTenantId, ctx.tenantId))
          .returning();
        return updated;
      } else {
        const [created] = await ctx.db
          .insert(tenantPricingConfig)
          .values(values)
          .returning();
        return created;
      }
    }),

  /**
   * List all pilots scoped to the current tenant.
   */
  listPilots: franchiseAdminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(pilots)
      .where(eq(pilots.franchiseTenantId, ctx.tenantId));
  }),

  /**
   * List all drones scoped to the current tenant.
   */
  listDrones: franchiseAdminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(drones)
      .where(eq(drones.franchiseTenantId, ctx.tenantId));
  }),

  /**
   * Get booking stats for the current tenant.
   */
  getStats: franchiseAdminProcedure.query(async ({ ctx }) => {
    const [tenantBookings, tenantPilots, tenantDrones] = await Promise.all([
      ctx.db
        .select()
        .from(bookings)
        .where(eq(bookings.franchiseTenantId, ctx.tenantId)),
      ctx.db
        .select()
        .from(pilots)
        .where(eq(pilots.franchiseTenantId, ctx.tenantId)),
      ctx.db
        .select()
        .from(drones)
        .where(eq(drones.franchiseTenantId, ctx.tenantId)),
    ]);

    const activePilots = tenantPilots.filter((p) => p.isActive).length;
    const activeDrones = tenantDrones.filter((d) => d.isActive).length;
    const completedBookings = tenantBookings.filter(
      (b) => b.status === "completed"
    ).length;
    const pendingBookings = tenantBookings.filter(
      (b) => b.status === "pending" || b.status === "confirmed"
    ).length;

    return {
      totalBookings: tenantBookings.length,
      completedBookings,
      pendingBookings,
      activePilots,
      activeDrones,
    };
  }),

  /**
   * List service areas for the current tenant.
   */
  listServiceAreas: tenantProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(tenantServiceAreas)
      .where(eq(tenantServiceAreas.franchiseTenantId, ctx.tenantId));
  }),

  /**
   * Add a service area for the tenant.
   */
  addServiceArea: franchiseAdminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        centerLat: z.number().optional(),
        centerLng: z.number().optional(),
        radiusKm: z.number().min(0.5).max(200).optional(),
        geoJson: z.unknown().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [area] = await ctx.db
        .insert(tenantServiceAreas)
        .values({
          franchiseTenantId: ctx.tenantId,
          name: input.name,
          centerLat: input.centerLat?.toFixed(7),
          centerLng: input.centerLng?.toFixed(7),
          radiusKm: input.radiusKm?.toFixed(2),
          geoJson: input.geoJson ?? null,
        })
        .returning();
      return area;
    }),
});
