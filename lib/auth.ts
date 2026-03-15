import { prisma } from "@/lib/prisma";
import { addContactToResend } from "@/lib/resend";
import { stackServerApp } from "@/stack";

type SyncedUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

function hasServerAdminMetadata(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const maybe = value as Record<string, unknown>;
  return maybe.isAdmin === true;
}

function isStackUserAdminFromServerMetadata(stackUser: unknown): boolean {
  if (!stackUser || typeof stackUser !== "object") return false;
  const userRecord = stackUser as Record<string, unknown>;
  return hasServerAdminMetadata(userRecord.serverMetadata);
}

async function syncStackUser(stackUser: {
  id: string;
  primaryEmail: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
}): Promise<SyncedUser> {
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

  // Add Stack Auth user to Resend email list (fire-and-forget)
  addContactToResend({ email: user.email, name: user.name }).catch((err) =>
    console.error("Resend sync after auth:", err)
  );

  return user;
}

/**
 * Get the current Stack user from the request (cookies) and sync to our Prisma User table.
 * Call this in API routes that need the current user. Returns our DB User or null if not signed in.
 */
export async function getStackUserAndSync(request: Request): Promise<SyncedUser | null> {
  try {
    const stackUser = await stackServerApp.getUser({
      tokenStore: request,
      or: "return-null",
    });

    if (!stackUser) return null;
    return syncStackUser(stackUser);
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

export type AdminAuthResult =
  | { ok: true; user: SyncedUser }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Enforce signed-in + server-side Stack metadata isAdmin === true.
 */
export async function authAdmin(request: Request): Promise<AdminAuthResult> {
  try {
    const stackUser = await stackServerApp.getUser({
      tokenStore: request,
      or: "return-null",
    });

    if (!stackUser) {
      return { ok: false, status: 401, error: "Unauthorized" };
    }

    if (!isStackUserAdminFromServerMetadata(stackUser)) {
      return { ok: false, status: 403, error: "Forbidden" };
    }

    const user = await syncStackUser(stackUser);
    return { ok: true, user };
  } catch (error) {
    console.error("authAdmin error:", error);
    return { ok: false, status: 401, error: "Unauthorized" };
  }
}

/**
 * Server component helper for guarding /admin pages.
 */
export async function currentUserIsAdmin(): Promise<boolean> {
  try {
    const stackUser = await stackServerApp.getUser({ or: "return-null" });
    if (!stackUser) return false;
    return isStackUserAdminFromServerMetadata(stackUser);
  } catch {
    return false;
  }
}

export async function getCurrentAdminGate(): Promise<{
  signedIn: boolean;
  isAdmin: boolean;
}> {
  try {
    const stackUser = await stackServerApp.getUser({ or: "return-null" });
    if (!stackUser) {
      return { signedIn: false, isAdmin: false };
    }
    return {
      signedIn: true,
      isAdmin: isStackUserAdminFromServerMetadata(stackUser),
    };
  } catch {
    return { signedIn: false, isAdmin: false };
  }
}
