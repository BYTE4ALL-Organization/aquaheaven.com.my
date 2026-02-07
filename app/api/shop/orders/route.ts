import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStackUserAndSync } from "@/lib/auth";

function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shippingAddress, items, userId: bodyUserId } = body as {
      shippingAddress: { fullName?: string; address?: string; city?: string; state?: string; zip?: string; country?: string; phone?: string };
      items: { slug: string; quantity: number }[];
      userId?: string;
    };

    // Sync Stack user to DB and use our user id for the order (or use body userId for backwards compatibility)
    const dbUser = await getStackUserAndSync(request);
    const userId = dbUser?.id ?? bodyUserId ?? null;

    if (!shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Shipping address and items are required" },
        { status: 400 }
      );
    }

    const productSlugs = items.map((i) => i.slug);
    const products = await prisma.product.findMany({
      where: { slug: { in: productSlugs }, isActive: true },
    });
    const productBySlug = new Map(products.map((p) => [p.slug, p]));

    let subtotal = 0;
    const orderItems: { productId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = productBySlug.get(item.slug);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.slug}` },
          { status: 400 }
        );
      }
      if (item.quantity < 1) {
        return NextResponse.json(
          { success: false, error: `Invalid quantity for ${product.name}` },
          { status: 400 }
        );
      }
      if (product.quantity < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${product.name}. Available: ${product.quantity}` },
          { status: 400 }
        );
      }
      const price = Number(product.price);
      subtotal += price * item.quantity;
      orderItems.push({ productId: product.id, quantity: item.quantity, price });
    }

    const tax = 0;
    const shipping = 0;
    const total = subtotal + tax + shipping;
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          subtotal,
          total,
          tax,
          shipping,
          shippingAddress: shippingAddress as object,
          paymentStatus: "PENDING",
          userId,
        },
      });

      for (const oi of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: oi.productId,
            quantity: oi.quantity,
            price: oi.price,
          },
        });
      }

      for (const item of items) {
        const product = productBySlug.get(item.slug)!;
        await tx.product.update({
          where: { id: product.id },
          data: { quantity: product.quantity - item.quantity },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
