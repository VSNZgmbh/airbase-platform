import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { franchiseTenants } from "@/lib/db/schema";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
export const isClerkConfigured =
  clerkKey.startsWith("pk_") &&
  clerkKey !== "pk_test_placeholder" &&
  clerkKey.length > 20;

/** Returns userId — "demo-user" when Clerk is not configured, null if unauthenticated */
export async function getAuthUserId(): Promise<string | null> {
  if (!isClerkConfigured) return "demo-user";
  const { userId } = await auth();
  return userId;
}

/** Returns user role — "operator" (full access) in demo/dev mode only */
export async function getUserRole(userId: string): Promise<string | undefined> {
  if (!isClerkConfigured) return "operator";
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (user.publicMetadata as { role?: string })?.role;
}

/** Returns franchise tenant ID for the user — null in demo mode or if unresolvable */
export async function getUserTenantId(userId: string): Promise<string | null> {
  if (!isClerkConfigured) {
    // Demo mode: resolve from DEFAULT_TENANT_SLUG
    const defaultSlug = process.env.DEFAULT_TENANT_SLUG;
    if (defaultSlug) {
      const tenant = await db.query.franchiseTenants.findFirst({
        where: eq(franchiseTenants.slug, defaultSlug),
      }).catch(() => null);
      if (tenant) return tenant.id;
    }
    return null;
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.publicMetadata as { franchiseTenantId?: string };
  return meta.franchiseTenantId ?? null;
}
