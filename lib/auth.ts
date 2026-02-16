import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack";

/**
 * Get the current Stack user from the request (cookies) and sync to our Prisma User table.
 * Call this in API routes that need the current user. Returns our DB User or null if not signed in.
 */
export async function getStackUserAndSync(request: Request): Promise<{
  id: string;
  email: string;
  name: string | null;
  image: string | null;
} | null> {
  try {
    const stackUser = await stackServerApp.getUser({
      tokenStore: request,
      or: "return-null",
    });

    if (!stackUser) return null;

    // Use Stack's id as our User id so we can upsert consistently
    const email = stackUser.primaryEmail ?? `stack-${stackUser.id}@user.local`;
    const name = stackUser.displayName ?? null;
    const image = stackUser.profileImageUrl ?? null;

    const user = await prisma.user.upsert({
      where: { id: stackUser.id },
      create: {
        id: stackUser.id,
        email,
        name,
        image,
      },
      update: {
        email,
        name,
        image,
      },
    });

    return user;
  } catch (error) {
    console.error("getStackUserAndSync error:", error);
    return null;
  }
}

/**
 * Get current session for API routes. Pass the request so we can read cookies.
 * Returns { user } or null. Use in admin API routes for auth checks.
 */
export async function auth(request: Request): Promise<{
  user: { id: string; email: string; name: string | null; image: string | null };
} | null> {
  const user = await getStackUserAndSync(request);
  return user ? { user } : null;
}
