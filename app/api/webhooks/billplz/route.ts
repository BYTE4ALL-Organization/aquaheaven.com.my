import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallbackSignature } from "@/lib/billplz";
import { sendOrderConfirmationEmail } from "@/lib/resend";

/**
 * Billplz sends callback as POST with application/x-www-form-urlencoded.
 * Params: id (bill id), paid ("true"|"false"), state, reference_1 (our order id), etc.
 * If X-Signature is enabled in Billplz, verify using BILLPLZ_X_SIGNATURE_KEY.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let bodyText: string;
    let orderId: string | null = null;
    let paid = false;
    let billId: string | null = null;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      bodyText = await request.text();
      const params = new URLSearchParams(bodyText);
      billId = params.get("id");
      orderId = params.get("reference_1");
      paid = params.get("paid") === "true";
    } else if (contentType.includes("application/json")) {
      bodyText = await request.text();
      try {
        const json = JSON.parse(bodyText) as {
          id?: string;
          paid?: boolean;
          reference_1?: string;
        };
        billId = json.id ?? null;
        orderId = json.reference_1 ?? null;
        paid = json.paid === true;
      } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "Missing reference_1" }, { status: 400 });
    }

    const xSignature = request.headers.get("x-signature") ?? null;
    const xSignatureKey = process.env.BILLPLZ_X_SIGNATURE_KEY ?? null;
    const valid = await verifyCallbackSignature(bodyText, xSignature, xSignatureKey);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { email: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order) {
      console.warn("Billplz callback: order not found", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (billId && order.billplzBillId !== billId) {
      console.warn("Billplz callback: bill id mismatch", { order: order.billplzBillId, callback: billId });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: paid ? "COMPLETED" : "FAILED",
        ...(billId && { transactionId: billId }),
        ...(paid && { status: "CONFIRMED" }),
      },
    });

    if (paid) {
      const customerEmail = order.user?.email?.trim().toLowerCase();
      if (customerEmail && !customerEmail.endsWith("@user.local")) {
        const shippingAddress = order.shippingAddress as {
          fullName?: string;
          address?: string;
          city?: string;
          state?: string;
          zip?: string;
          country?: string;
          phone?: string;
        } | null;
        sendOrderConfirmationEmail({
          to: customerEmail,
          orderNumber: order.orderNumber,
          items: order.items.map((oi) => ({
            name: oi.product.name,
            quantity: oi.quantity,
            price: Number(oi.price),
          })),
          total: Number(order.total),
          shippingAddress: shippingAddress ?? undefined,
        }).catch((err) => console.error("Order confirmation email failed:", err));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Billplz webhook error:", error);
    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}
