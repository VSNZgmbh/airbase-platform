import { initTRPC, TRPCError } from "@trpc/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/lib/db";

export const createTRPCContext = async () => {
  const { userId } = await auth();
  return {
    db,
    userId,
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
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (user.publicMetadata as { role?: string })?.role;
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
    const role = await getUserRole(ctx.userId);
    if (role !== "pilot") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Pilot role required" });
    }
    return next({ ctx: { ...ctx, userId: ctx.userId } });
  });
