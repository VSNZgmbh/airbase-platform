import { auth, clerkClient } from "@clerk/nextjs/server";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
export const isClerkConfigured =
  clerkKey.startsWith("pk_") &&
  clerkKey !== "pk_test_placeholder" &&
  clerkKey.length > 20;

/** Returns userId — "demo-user" when Clerk is not configured, null if unauthenticated in prod */
export async function getAuthUserId(): Promise<string | null> {
  if (!isClerkConfigured) return "demo-user";
  const { userId } = await auth();
  return userId;
}

/** Returns user role — "operator" (full access) in demo mode */
export async function getUserRole(userId: string): Promise<string | undefined> {
  if (!isClerkConfigured) return "operator";
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (user.publicMetadata as { role?: string })?.role;
}
