import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBill } from "@/lib/billplz";
import { markOrderPaidAndSendEmail } from "@/lib/order-confirmation";
import { getStackUserAndSync } from "@/lib/auth";

/**
 * POST /api/shop/orders/[orderId]/sync-payment
 *
 * Fallback when Billplz callback does not reach our server: when the user lands
 * on the checkout success page, the client calls this to verify payment with
 * Billplz (GET bill) and, if paid, update the order and send the confirmation email.
 * Requires the current user to own the order.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getStackUserAndSync(_request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    if (!orderId?.trim()) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId.trim() },
      include: {
        user: { select: { email: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status === "CONFIRMED" && order.paymentStatus === "COMPLETED") {
      return NextResponse.json({ success: true, paid: true, alreadySynced: true });
    }

    if (!order.billplzBillId?.trim()) {
      return NextResponse.json(
        { success: false, paid: false, error: "No payment bill linked" },
        { status: 400 }
      );
    }

    const bill = await getBill(order.billplzBillId);
    if (!bill) {
      return NextResponse.json(
        { success: false, paid: false, error: "Could not fetch bill status" },
        { status: 502 }
      );
    }

    if (!bill.paid) {
      return NextResponse.json({ success: true, paid: false });
    }

    const result = await markOrderPaidAndSendEmail(order, {
      transactionId: bill.id,
    });

    if (!result.ok) {
      console.error("sync-payment: markOrderPaidAndSendEmail failed", result.error);
      return NextResponse.json(
        { success: true, paid: true, emailSent: false, error: result.error },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, paid: true, emailSent: true });
  } catch (err) {
    console.error("sync-payment error:", err);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
