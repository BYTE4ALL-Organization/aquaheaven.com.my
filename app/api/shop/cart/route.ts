import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStackUserAndSync } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getStackUserAndSync(request);
    if (!user) {
      return NextResponse.json({ success: true, items: [] });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                reviews: { select: { rating: true } },
                brand: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: true, items: [] });
    }

    const formattedItems = cart.items.map((item) => ({
      ...item.product,
      quantity: item.quantity,
      availableQuantity: item.product.quantity,
      brand: item.product.brand?.name ?? undefined,
    }));

    return NextResponse.json({ success: true, items: formattedItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getStackUserAndSync(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items } = body as {
      items: { slug: string; quantity: number }[];
    };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "items array required" },
        { status: 400 }
      );
    }

    const slugs = items.map((i) => i.slug).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { slug: { in: slugs } },
    });
    const productBySlug = new Map(products.map((p) => [p.slug, p]));

    let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    for (const item of items) {
      const product = productBySlug.get(item.slug);
      if (!product || item.quantity < 1) continue;
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: item.quantity,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save cart" },
      { status: 500 }
    );
  }
}
