import { prisma } from "@/lib/prisma";

/** Order statuses we consider a "completed" purchase (customer has bought the product). */
const COMPLETED_ORDER_STATUSES = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

/**
 * Returns true if the user has purchased the product (has at least one order item
 * for this product in a completed order).
 */
export async function hasUserPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: [...COMPLETED_ORDER_STATUSES] },
      },
    },
    select: { id: true },
  });
  return !!orderItem;
}
