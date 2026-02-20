import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/resend";

type OrderWithDetails = {
  id: string;
  orderNumber: string;
  status: string;
  total: { toString(): string } | number;
  shippingAddress: unknown;
  user: { email: string | null; name: string | null } | null;
  items: Array<{
    quantity: number;
    price: { toString(): string } | number;
    product: { name: string };
  }>;
};

/**
 * Mark order as paid (CONFIRMED + COMPLETED) and send confirmation email.
 * Used by sync-payment fallback when user lands on success page (webhook may not fire).
 */
export async function markOrderPaidAndSendEmail(
  order: OrderWithDetails,
  opts?: { transactionId?: string }
): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "COMPLETED",
        status: "CONFIRMED",
        ...(opts?.transactionId && { transactionId: opts.transactionId }),
      },
    });

    const customerEmail = order.user?.email?.trim().toLowerCase();
    if (!customerEmail || customerEmail.endsWith("@user.local")) {
      return { ok: true };
    }

    const shippingAddress = order.shippingAddress as {
      fullName?: string;
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
      phone?: string;
    } | null;

    const result = await sendOrderConfirmationEmail({
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

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("markOrderPaidAndSendEmail error:", err);
    return { ok: false, error: message };
  }
}
