import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Split "John Doe" into firstName "John", lastName "Doe".
 * Single name goes to firstName.
 */
function splitName(name: string | null): { firstName?: string; lastName?: string } {
  if (!name || typeof name !== "string") return {};
  const trimmed = name.trim();
  if (!trimmed) return {};
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

/**
 * Add or update a contact in Resend (your email list).
 * Only runs when RESEND_API_KEY is set. Skips placeholder emails (e.g. stack-xxx@user.local).
 * Used for Stack Auth users on sign-in/sync and on order so you can email them.
 */
export async function addContactToResend(params: {
  email: string;
  name?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) return { ok: true }; // no-op when Resend not configured
  const { email, name } = params;
  const normalized = email?.trim().toLowerCase();
  if (!normalized || normalized.endsWith("@user.local")) return { ok: true };

  const { firstName, lastName } = splitName(name ?? null);

  try {
    const { error } = await resend.contacts.create({
      email: normalized,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      unsubscribed: false,
    });
    if (error) {
      // Resend may return "already exists" – contact is still in list
      if (error.message?.toLowerCase().includes("already exists")) return { ok: true };
      // API key restricted to "send only" cannot use contacts API – skip without failing
      const errMsg = error.message ?? "";
      const restricted = (error as { name?: string }).name === "restricted_api_key" ||
        errMsg.toLowerCase().includes("restricted") ||
        (error as { statusCode?: number }).statusCode === 401;
      if (restricted) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Resend: API key is send-only; contacts not updated. Use a full-access key to add contacts.");
        }
        return { ok: true };
      }
      // Network / temporary errors – don't fail the main flow
      if (errMsg.includes("could not be resolved") || errMsg.includes("Unable to fetch")) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Resend: temporary error (", errMsg, "). Contact not added.");
        }
        return { ok: true };
      }
      console.error("Resend add contact error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    // Don't fail sign-in/checkout if Resend is down or key restricted
    if (process.env.NODE_ENV !== "production") {
      console.warn("Resend add contact exception:", err);
    }
    return { ok: true };
  }
}
