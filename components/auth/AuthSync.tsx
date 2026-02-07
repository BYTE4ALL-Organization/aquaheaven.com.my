"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@stackframe/stack";

/**
 * When a user is signed in via Stack, call /api/auth/sync so they are upserted
 * into our Prisma users table. This runs once per mount when user is present.
 */
export default function AuthSync() {
  const user = useUser({ or: "return-null" });
  const synced = useRef(false);

  useEffect(() => {
    if (!user || synced.current) return;
    synced.current = true;
    fetch("/api/auth/sync", { credentials: "include" }).catch(() => {
      synced.current = false;
    });
  }, [user]);

  return null;
}
