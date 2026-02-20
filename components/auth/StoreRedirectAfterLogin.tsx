"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";

/**
 * On sign-in page, store the redirect query param in sessionStorage so after
 * login AuthSync can redirect the user to e.g. /checkout.
 */
export default function StoreRedirectAfterLogin() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    if (redirect && redirect.startsWith("/") && typeof window !== "undefined") {
      sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, redirect);
    }
  }, [searchParams]);

  return null;
}
