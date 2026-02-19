/**
 * Billplz API integration.
 * Create bill uses v3; callback/docs reference v4 for other features.
 * Docs: https://www.billplz.com/api
 * Sandbox: https://www.billplz-sandbox.com/api/
 * Amounts are in sen (1 RM = 100 sen).
 */

const BILLPLZ_SANDBOX = "https://www.billplz-sandbox.com/api/v3";
const BILLPLZ_PRODUCTION = "https://www.billplz.com/api/v3";

export function getBillplzBaseUrl(): string {
  const useSandbox = process.env.BILLPLZ_USE_SANDBOX !== "false";
  return useSandbox ? BILLPLZ_SANDBOX : BILLPLZ_PRODUCTION;
}

export interface CreateBillParams {
  collectionId: string;
  /** Amount in sen (e.g. 1000 = RM 10.00) */
  amount: number;
  email: string;
  name: string;
  description: string;
  /** Server-side callback URL (Billplz POST here on payment status change) */
  callbackUrl: string;
  /** Optional: redirect URL after customer pays */
  redirectUrl?: string;
  /** Your reference (e.g. order id) - stored as reference_1 */
  reference1: string;
  reference1Label?: string;
  mobile?: string;
}

export interface BillplzBillResponse {
  id: string;
  collection_id: string;
  paid: boolean;
  state: string;
  amount: number;
  paid_amount: number;
  due_at: string;
  email: string;
  mobile: string | null;
  name: string;
  url: string;
  reference_1_label: string | null;
  reference_1: string | null;
  reference_2_label: string | null;
  reference_2: string | null;
  redirect_url: string | null;
  callback_url: string;
  description: string;
  paid_at: string | null;
}

/**
 * Create a bill via Billplz API v4. Returns the bill object with .url to redirect the customer.
 */
export async function createBill(params: CreateBillParams): Promise<BillplzBillResponse | null> {
  const apiKey = process.env.BILLPLZ_API_SECRET_KEY;
  const baseUrl = getBillplzBaseUrl();

  if (!apiKey) {
    console.error("Billplz: BILLPLZ_API_SECRET_KEY is not set");
    return null;
  }

  const body = new URLSearchParams({
    collection_id: params.collectionId,
    email: params.email,
    name: params.name,
    amount: String(params.amount),
    description: params.description.slice(0, 200),
    callback_url: params.callbackUrl,
    reference_1: params.reference1,
    ...(params.reference1Label && { reference_1_label: params.reference1Label }),
    ...(params.redirectUrl && { redirect_url: params.redirectUrl }),
    ...(params.mobile && { mobile: params.mobile }),
  });

  const auth = Buffer.from(`${apiKey}:`).toString("base64");

  try {
    const res = await fetch(`${baseUrl}/bills`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const text = await res.text();
    let data: BillplzBillResponse & { error?: { message?: string } };
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json") && text.trim() && !text.trimStart().startsWith("<")) {
      try {
        data = JSON.parse(text) as BillplzBillResponse & { error?: { message?: string } };
      } catch {
        console.error("Billplz create bill: invalid JSON response", res.status, text.slice(0, 200));
        return null;
      }
    } else {
      // Billplz returned HTML (e.g. error page, login page) – wrong URL or auth failed
      console.error(
        "Billplz create bill: expected JSON, got HTML.",
        "Status:",
        res.status,
        "URL:",
        `${baseUrl}/bills`,
        "Check BILLPLZ_API_SECRET_KEY and BILLPLZ_COLLECTION_ID (and sandbox vs production)."
      );
      return null;
    }

    if (!res.ok) {
      console.error("Billplz create bill error:", res.status, data);
      return null;
    }
    if (data.id && data.url) return data;
    return null;
  } catch (err) {
    console.error("Billplz create bill request failed:", err);
    return null;
  }
}

/**
 * Verify Billplz callback X-Signature (if you use X-Signature in Billplz dashboard).
 * Payload is the raw request body string; xSignature is the header value.
 */
export async function verifyCallbackSignature(
  payload: string,
  xSignature: string | null,
  xSignatureKey: string | null
): Promise<boolean> {
  if (!xSignature || !xSignatureKey) return true; // skip verification if not configured
  const { createHmac, timingSafeEqual } = await import("crypto");
  const expected = createHmac("sha256", xSignatureKey).update(payload).digest("hex");
  try {
    const a = Buffer.from(xSignature, "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
