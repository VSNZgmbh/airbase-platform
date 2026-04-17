import { sql, gte, lte, and } from "drizzle-orm";
import { createTRPCRouter, operatorProcedure } from "@/lib/trpc/server";
import { bookings, flights, invoices } from "@/lib/db/schema";
import { z } from "zod";

export const analyticsRouter = createTRPCRouter({
  overview: operatorProcedure.query(async ({ ctx }) => {
    // Total bookings by status
    const bookingsByStatus = await ctx.db
      .select({
        status: bookings.status,
        count: sql<number>`count(*)::int`,
      })
      .from(bookings)
      .groupBy(bookings.status);

    // Total revenue from completed bookings
    const revenueResult = await ctx.db
      .select({
        total: sql<string>`coalesce(sum(total_chf), 0)`,
      })
      .from(bookings)
      .where(sql`status = 'completed'`);

    // Total flights
    const flightCountResult = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(flights);

    // Completed flights
    const completedFlightsResult = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(flights)
      .where(sql`status = 'completed'`);

    // Unpaid invoices
    const unpaidInvoicesResult = await ctx.db
      .select({
        count: sql<number>`count(*)::int`,
        total: sql<string>`coalesce(sum(total_chf), 0)`,
      })
      .from(invoices)
      .where(sql`status IN ('sent', 'overdue')`);

    const statusMap: Record<string, number> = {};
    for (const row of bookingsByStatus) {
      statusMap[row.status] = row.count;
    }

    return {
      totalBookings: bookingsByStatus.reduce((s, r) => s + r.count, 0),
      bookingsByStatus: statusMap,
      totalRevenueCHF: parseFloat(revenueResult[0]?.total ?? "0"),
      totalFlights: flightCountResult[0]?.count ?? 0,
      completedFlights: completedFlightsResult[0]?.count ?? 0,
      unpaidInvoicesCount: unpaidInvoicesResult[0]?.count ?? 0,
      unpaidInvoicesTotalCHF: parseFloat(unpaidInvoicesResult[0]?.total ?? "0"),
    };
  }),

  bookingsOverTime: operatorProcedure
    .input(
      z.object({
        days: z.number().min(7).max(365).default(90),
      })
    )
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const rows = await ctx.db
        .select({
          date: sql<string>`to_char(created_at, 'YYYY-MM-DD')`,
          count: sql<number>`count(*)::int`,
          revenue: sql<string>`coalesce(sum(total_chf), 0)`,
        })
        .from(bookings)
        .where(gte(bookings.createdAt, since))
        .groupBy(sql`to_char(created_at, 'YYYY-MM-DD')`)
        .orderBy(sql`to_char(created_at, 'YYYY-MM-DD') asc`);

      return rows.map((r) => ({
        date: r.date,
        count: r.count,
        revenue: parseFloat(r.revenue),
      }));
    }),

  popularRoutes: operatorProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        deliveryAddress: bookings.deliveryAddress,
        count: sql<number>`count(*)::int`,
      })
      .from(bookings)
      .where(sql`delivery_address IS NOT NULL AND status NOT IN ('draft', 'cancelled')`)
      .groupBy(bookings.deliveryAddress)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    return rows.map((r) => ({
      address: r.deliveryAddress ?? "Unbekannt",
      count: r.count,
    }));
  }),

  serviceTypeBreakdown: operatorProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        serviceType: bookings.serviceType,
        count: sql<number>`count(*)::int`,
        revenue: sql<string>`coalesce(sum(total_chf), 0)`,
      })
      .from(bookings)
      .where(sql`status NOT IN ('draft', 'cancelled')`)
      .groupBy(bookings.serviceType)
      .orderBy(sql`count(*) desc`);

    return rows.map((r) => ({
      serviceType: r.serviceType,
      count: r.count,
      revenue: parseFloat(r.revenue),
    }));
  }),

  avgPayloadWeight: operatorProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        avg: sql<string>`round(avg(payload_weight_kg)::numeric, 2)`,
        min: sql<string>`min(payload_weight_kg)`,
        max: sql<string>`max(payload_weight_kg)`,
      })
      .from(bookings)
      .where(sql`status NOT IN ('draft', 'cancelled')`);

    return {
      avg: parseFloat(result[0]?.avg ?? "0"),
      min: parseFloat(result[0]?.min ?? "0"),
      max: parseFloat(result[0]?.max ?? "0"),
    };
  }),
});
