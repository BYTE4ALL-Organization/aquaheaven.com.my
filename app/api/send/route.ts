import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/order-mail";

type OrderConfirmationBody = {
  to: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  subtotal?: number;
  discountAmount?: number;
  promoCode?: string | null;
  shipping?: number;
  shippingAddress?: {
    type?: "pickup" | "shipping";
    fullName?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
  } | null;
};

/**
 * POST /api/send – send order confirmation email when payment is successful.
 * Delegates to lib/order-mail (SMTP + branded HTML).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderConfirmationBody;
    const { to, orderNumber, items, total, subtotal, discountAmount, promoCode, shipping, shippingAddress } = body;

    const normalizedTo = to?.trim().toLowerCase();
    if (!normalizedTo || normalizedTo.endsWith("@user.local")) {
      return NextResponse.json({ error: "Invalid or missing 'to' email" }, { status: 400 });
    }
    if (!orderNumber || !Array.isArray(items) || typeof total !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid orderNumber, items, or total" },
        { status: 400 }
      );
    }

    const result = await sendOrderConfirmationEmail({
      to: normalizedTo,
      orderNumber,
      items,
      total,
      subtotal,
      discountAmount,
      promoCode,
      shipping,
      shippingAddress,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Send failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Send failed" },
      { status: 500 }
    );
  }
}
