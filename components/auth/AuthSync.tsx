"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";

const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";

/**
 * When a user is signed in via Stack, call /api/auth/sync so they are upserted
 * into our Prisma users table. This runs once per mount when user is present.
 * If sessionStorage has redirectAfterLogin (set when visiting sign-in?redirect=/checkout),
 * redirect the user there and clear it.
 */
export default function AuthSync() {
  const router = useRouter();
  const user = useUser({ or: "return-null" });
  const synced = useRef(false);

  useEffect(() => {
    if (!user || synced.current) return;
    synced.current = true;
    const redirectUrl =
      typeof window !== "undefined" ? sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY) : null;
    if (redirectUrl && redirectUrl.startsWith("/")) {
      sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
      router.replace(redirectUrl);
      return;
    }
    fetch("/api/auth/sync", { credentials: "include" }).catch(() => {
      synced.current = false;
    });
  }, [user, router]);

  return null;
}
