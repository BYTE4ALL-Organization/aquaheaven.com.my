import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: true, items: [] });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                reviews: { select: { rating: true } },
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
    const body = await request.json();
    const { userId, items } = body as {
      userId?: string;
      items: { slug: string; quantity: number }[];
    };

    if (!userId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "userId and items array required" },
        { status: 400 }
      );
    }

    const slugs = items.map((i) => i.slug).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { slug: { in: slugs } },
    });
    const productBySlug = new Map(products.map((p) => [p.slug, p]));

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
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
          userId,
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
