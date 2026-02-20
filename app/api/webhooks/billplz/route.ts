import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallbackSignature } from "@/lib/billplz";
import { getBaseUrl } from "@/lib/base-url";

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

    function parsePaid(value: string | boolean | null | undefined): boolean {
      if (value === true || value === "true" || value === "1" || value === "yes") return true;
      if (typeof value === "string" && value.toLowerCase() === "true") return true;
      return false;
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      bodyText = await request.text();
      const params = new URLSearchParams(bodyText);
      billId = params.get("id");
      orderId = params.get("reference_1") ?? params.get("reference1");
      paid = parsePaid(params.get("paid"));
    } else if (contentType.includes("application/json")) {
      bodyText = await request.text();
      try {
        const json = JSON.parse(bodyText) as {
          id?: string;
          paid?: boolean | string;
          reference_1?: string;
          reference1?: string;
        };
        billId = json.id ?? null;
        orderId = json.reference_1 ?? json.reference1 ?? null;
        paid = parsePaid(json.paid);
      } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    if (!orderId || !String(orderId).trim()) {
      return NextResponse.json({ error: "Missing reference_1" }, { status: 400 });
    }

    const xSignature = request.headers.get("x-signature") ?? request.headers.get("X-Signature") ?? null;
    const xSignatureKey = process.env.BILLPLZ_X_SIGNATURE_KEY ?? null;
    const valid = await verifyCallbackSignature(bodyText, xSignature, xSignatureKey);
    if (!valid) {
      console.warn("Billplz callback: signature verification failed. Check BILLPLZ_X_SIGNATURE_KEY or disable X-Signature in Billplz dashboard.");
      return NextResponse.json(
        { error: "Invalid signature. Check BILLPLZ_X_SIGNATURE_KEY." },
        { status: 401 }
      );
    }

    const orderIdTrimmed = String(orderId).trim();
    let order = await prisma.order.findUnique({
      where: { id: orderIdTrimmed },
      include: {
        user: { select: { email: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });
    if (!order) {
      order = await prisma.order.findUnique({
        where: { orderNumber: orderIdTrimmed },
        include: {
          user: { select: { email: true, name: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      });
    }

    if (!order) {
      console.warn("Billplz callback: order not found for reference_1", orderIdTrimmed);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (billId && order.billplzBillId !== billId) {
      console.warn("Billplz callback: bill id mismatch", { order: order.billplzBillId, callback: billId });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: paid ? "COMPLETED" : "FAILED",
        ...(billId && { transactionId: billId }),
        ...(paid && { status: "CONFIRMED" }),
      },
    });

    if (paid) {
      console.info("Billplz: order marked as paid", { orderId: order.id, orderNumber: order.orderNumber });
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
        const baseUrl = getBaseUrl();
        try {
          const res = await fetch(`${baseUrl}/api/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: customerEmail,
              orderNumber: order.orderNumber,
              items: order.items.map((oi) => ({
                name: oi.product.name,
                quantity: oi.quantity,
                price: Number(oi.price),
              })),
              total: Number(order.total),
              shippingAddress: shippingAddress ?? undefined,
            }),
          });
          if (!res.ok) {
            const errBody = await res.text();
            console.error("Order confirmation email failed:", res.status, errBody);
          }
        } catch (err) {
          console.error("Order confirmation email request failed:", err);
        }
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
