import { initTRPC, TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { franchiseTenants } from "@/lib/db/schema";
import { getAuthUserId, getUserRole as getDemoUserRole, isClerkConfigured } from "@/lib/demo-auth";

/**
 * Resolve the franchise tenant ID for the current request.
 * Priority:
 *  1. Clerk user publicMetadata.franchiseTenantId (for franchise admins/pilots)
 *  2. X-Tenant-Slug request header (for internal tooling)
 *  3. DEFAULT_TENANT_SLUG env var (for demo / single-tenant deployments)
 */
async function resolveTenantId(userId: string | null): Promise<string | null> {
  // Try from Clerk user metadata
  if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const meta = user.publicMetadata as { franchiseTenantId?: string };
      if (meta.franchiseTenantId) return meta.franchiseTenantId;
    } catch {
      // Clerk not configured or user lookup failed — fall through
    }
  }

  // Fall back to env-configured default tenant slug (only if DB is available)
  const defaultSlug = process.env.DEFAULT_TENANT_SLUG;
  if (defaultSlug && process.env.DATABASE_URL) {
    const tenant = await db.query.franchiseTenants.findFirst({
      where: eq(franchiseTenants.slug, defaultSlug),
    }).catch(() => null);
    if (tenant) return tenant.id;
  }

  return null;
}

export const createTRPCContext = async () => {
  const userId = await getAuthUserId();
  const tenantId = await resolveTenantId(userId);
  return {
    db,
    userId,
    tenantId,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const end = Date.now();
  console.log(`[tRPC] ${path} took ${end - start}ms`);
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        ...ctx,
        userId: ctx.userId,
      },
    });
  });

async function getUserRole(userId: string): Promise<string | undefined> {
  return getDemoUserRole(userId);
}

export const operatorProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const role = await getUserRole(ctx.userId);
    if (role !== "operator") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Operator role required" });
    }
    return next({ ctx: { ...ctx, userId: ctx.userId } });
  });

export const pilotProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (isClerkConfigured) {
      const role = await getUserRole(ctx.userId);
      if (role !== "pilot") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Pilot role required" });
      }
    }
    return next({ ctx: { ...ctx, userId: ctx.userId } });
  });

/**
 * Procedure that requires a resolved tenant context.
 * Injects `tenantId` as non-nullable.
 */
export const tenantProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.tenantId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Tenant context required. Set DEFAULT_TENANT_SLUG or ensure user has franchiseTenantId in Clerk metadata.",
      });
    }
    return next({ ctx: { ...ctx, tenantId: ctx.tenantId } });
  });

/**
 * Procedure for franchise admins — requires auth + operator role + tenant.
 */
export const franchiseAdminProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const role = await getUserRole(ctx.userId);
    if (role !== "operator" && role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Franchise admin role required" });
    }
    if (!ctx.tenantId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No tenant assigned to this user" });
    }
    return next({ ctx: { ...ctx, userId: ctx.userId, tenantId: ctx.tenantId } });
  });
