import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasUserPurchasedProduct } from "@/lib/purchase-check";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const include = {
      productCategories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      variants: true,
    } as const;

    // Try by ID first (cuid or numeric), then by slug
    let product = await prisma.product.findUnique({
      where: { id: slug },
      include,
    });
    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug },
        include,
      });
    }

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    let canReview = false;
    const session = await auth(request);
    if (session?.user) {
      canReview = await hasUserPurchasedProduct(session.user.id, product.id);
    }

    const productResponse = {
      ...product,
      categories: product.productCategories.map((pc) => pc.category),
      canReview,
    };

    return NextResponse.json({
      success: true,
      product: productResponse,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

