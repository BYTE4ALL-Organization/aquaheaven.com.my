import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallbackSignature } from "@/lib/billplz";
import { sendOrderConfirmationEmail } from "@/lib/resend";

/**
 * Billplz callback (v3/v4): POST application/x-www-form-urlencoded.
 * Params: id (bill id), paid ("true"|"false"), state; reference_1 is optional in callback.
 * If reference_1 is missing, we look up order by billplzBillId === id.
 * Enable "Basic Callback URL" or "X Signature Callback URL" in Billplz collection/dashboard.
 * If X-Signature is enabled, set BILLPLZ_X_SIGNATURE_KEY.
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

    if (!billId || !String(billId).trim()) {
      return NextResponse.json({ error: "Missing id (bill id)" }, { status: 400 });
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

    const billIdTrimmed = String(billId).trim();
    const orderIdTrimmed = orderId ? String(orderId).trim() : null;

    let order = null;
    if (orderIdTrimmed) {
      order = await prisma.order.findUnique({
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
    }
    if (!order && billIdTrimmed) {
      order = await prisma.order.findFirst({
        where: { billplzBillId: billIdTrimmed },
        include: {
          user: { select: { email: true, name: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      });
    }

    if (!order) {
      console.warn("Billplz callback: order not found for id/reference_1", { billId: billIdTrimmed, reference_1: orderIdTrimmed });
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
        const { ok, error } = await sendOrderConfirmationEmail({
          to: customerEmail,
          orderNumber: order.orderNumber,
          items: order.items.map((oi) => ({
            name: oi.product.name,
            quantity: oi.quantity,
            price: Number(oi.price),
          })),
          total: Number(order.total),
          shippingAddress: shippingAddress ?? undefined,
        });
        if (!ok) {
          console.error("Order confirmation email failed:", error);
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
