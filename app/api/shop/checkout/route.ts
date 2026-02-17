import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStackUserAndSync } from "@/lib/auth";
import { addContactToResend } from "@/lib/resend";
import { createBill } from "@/lib/billplz";

function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/** Resolve items to { slug, quantity } using slug or product id */
async function resolveItems(
  items: { slug?: string; id?: string; quantity: number }[]
): Promise<{ slug: string; quantity: number }[]> {
  const bySlug = items.filter((i) => i.slug && i.quantity > 0);
  if (bySlug.length === items.length) {
    return bySlug.map((i) => ({ slug: i.slug!, quantity: i.quantity }));
  }
  const ids = items.filter((i) => i.id && i.quantity > 0).map((i) => String(i.id));
  if (ids.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    select: { id: true, slug: true },
  });
  const byId = new Map(products.map((p) => [p.id, p.slug]));
  return items
    .filter((i) => (i.id && byId.get(String(i.id))) || i.slug)
    .map((i) => ({
      slug: (i.slug ?? byId.get(String(i.id)))!,
      quantity: i.quantity,
    }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      shippingAddress,
      items: rawItems,
      userId: bodyUserId,
    } = body as {
      shippingAddress: {
        fullName?: string;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        phone?: string;
      };
      items: { slug?: string; id?: string; quantity: number }[];
      userId?: string;
    };

    const dbUser = await getStackUserAndSync(request);
    const userId = dbUser?.id ?? bodyUserId ?? null;

    if (!shippingAddress || !rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Shipping address and items are required" },
        { status: 400 }
      );
    }

    const items = await resolveItems(rawItems);
    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid items" },
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
          {
            success: false,
            error: `Insufficient stock for ${product.name}. Available: ${product.quantity}`,
          },
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
          paymentMethod: "billplz",
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

    const collectionId = process.env.BILLPLZ_COLLECTION_ID;
    const callbackBase =
      process.env.BILLPLZ_CALLBACK_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";
    const callbackUrl = `${callbackBase.replace(/\/$/, "")}/api/webhooks/billplz`;
    const redirectUrl = `${callbackBase.replace(/\/$/, "")}/checkout/success?order=${order.id}`;

    if (!collectionId) {
      console.error("Billplz: BILLPLZ_COLLECTION_ID is not set");
      return NextResponse.json(
        { success: false, error: "Payment is not configured" },
        { status: 500 }
      );
    }

    const fullName =
      (shippingAddress as { fullName?: string }).fullName ||
      (dbUser?.name ?? "Customer");
    const email = dbUser?.email ?? "noreply@aquaheaven.com.my";
    const mobile = (shippingAddress as { phone?: string }).phone ?? undefined;

    const amountSen = Math.round(Number(order.total) * 100);
    if (amountSen < 1) {
      return NextResponse.json(
        { success: false, error: "Order total must be at least RM 0.01" },
        { status: 400 }
      );
    }

    const bill = await createBill({
      collectionId,
      amount: amountSen,
      email,
      name: fullName.slice(0, 100),
      description: `Order ${order.orderNumber} - Aquaheaven`,
      callbackUrl,
      redirectUrl,
      reference1: order.id,
      reference1Label: "Order ID",
      mobile,
    });

    if (!bill) {
      return NextResponse.json(
        { success: false, error: "Failed to create payment bill" },
        { status: 500 }
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { billplzBillId: bill.id },
    });

    if (dbUser) {
      addContactToResend({ email: dbUser.email, name: dbUser.name }).catch((err) =>
        console.error("Resend sync after checkout:", err)
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      billUrl: bill.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to checkout" },
      { status: 500 }
    );
  }
}
