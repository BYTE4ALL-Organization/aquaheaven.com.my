const COOKIE_NAME = "redirect_after_login";
const COOKIE_MAX_AGE_SEC = 600; // 10 minutes
const SESSION_STORAGE_KEY = "redirectAfterLogin";

/**
 * Set redirect-after-login in both cookie (survives full-page redirect) and
 * sessionStorage (for same-tab client navigations). Call on sign-in page when
 * redirect query param is present.
 */
export function setRedirectAfterLoginCookie(path: string): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(path);
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, path);
  } catch {
    // ignore
  }
}

/**
 * Read redirect-after-login from cookie first (so it works after Stack’s
 * full-page redirect to main page), then sessionStorage. Returns null if
 * none or invalid. Call from client only.
 */
export function getRedirectAfterLogin(): string | null {
  if (typeof document === "undefined") return null;
  const fromCookie = document.cookie
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE_NAME}=`));
  if (fromCookie) {
    const value = decodeURIComponent(fromCookie.replace(`${COOKIE_NAME}=`, "").trim());
    if (value.startsWith("/")) return value;
  }
  try {
    const fromStorage = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (fromStorage && fromStorage.startsWith("/")) return fromStorage;
  } catch {
    // ignore
  }
  return null;
}

/**
 * Clear redirect-after-login cookie and sessionStorage after redirect.
 */
export function clearRedirectAfterLogin(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}
