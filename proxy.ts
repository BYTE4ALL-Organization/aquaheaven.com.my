import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { REDIRECT_AFTER_LOGIN_COOKIE_NAME } from "@/lib/redirect-after-login";

/**
 * When user lands on "/" with a redirect_after_login cookie (e.g. after
 * sign-in from checkout), redirect them to the stored path so they reach
 * /checkout instead of the homepage. Stack Auth may redirect to "/" after
 * magic link; this ensures they are sent to the intended page.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(REDIRECT_AFTER_LOGIN_COOKIE_NAME);
  const value = cookie?.value?.trim();
  if (!value) return NextResponse.next();

  let path: string;
  try {
    path = decodeURIComponent(value);
  } catch {
    return NextResponse.next();
  }
  if (!path.startsWith("/") || path.startsWith("//")) {
    return NextResponse.next();
  }

  const res = NextResponse.redirect(new URL(path, request.url));
  res.cookies.set(REDIRECT_AFTER_LOGIN_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: "/",
};
