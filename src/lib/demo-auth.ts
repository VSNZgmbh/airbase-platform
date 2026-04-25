import { auth, clerkClient } from "@clerk/nextjs/server";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
export const isClerkConfigured =
  clerkKey.startsWith("pk_") &&
  clerkKey !== "pk_test_placeholder" &&
  clerkKey.length > 20;

const isProduction = process.env.NODE_ENV === "production";

// In production, Clerk MUST be configured. Demo mode is only for development.
if (isProduction && !isClerkConfigured) {
  throw new Error(
    "FATAL: Clerk is not configured in production. " +
    "Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY. " +
    "Demo mode is disabled in production to prevent privilege escalation."
  );
}

/** Returns userId — "demo-user" when Clerk is not configured (dev only), null if unauthenticated */
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
