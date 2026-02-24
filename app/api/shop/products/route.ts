import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const featured = searchParams.get("featured");
    const bestSellers = searchParams.get("bestSellers");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const color = searchParams.get("color");
    const size = searchParams.get("size");

    const where: any = {
      isActive: true,
    };

    if (category) {
      const catRow = await prisma.category.findFirst({
        where: { slug: category },
        select: { id: true },
        include: { children: { select: { id: true } } },
      });
      if (catRow) {
        const categoryIds = [catRow.id, ...(catRow.children?.map((ch) => ch.id) ?? [])];
        where.productCategories = {
          some: {
            categoryId: { in: categoryIds },
          },
        };
      } else {
        where.productCategories = {
          some: {
            category: { slug: category },
          },
        };
      }
    }

    if (brand?.trim()) {
      where.brand = {
        slug: brand.trim(),
      };
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (bestSellers === "true") {
      where.isBestSeller = true;
    }

    const minPriceNum = minPrice != null && minPrice !== "" ? parseFloat(minPrice) : NaN;
    const maxPriceNum = maxPrice != null && maxPrice !== "" ? parseFloat(maxPrice) : NaN;
    if (!Number.isNaN(minPriceNum) || !Number.isNaN(maxPriceNum)) {
      where.price = {};
      if (!Number.isNaN(minPriceNum)) where.price.gte = minPriceNum;
      if (!Number.isNaN(maxPriceNum)) where.price.lte = maxPriceNum;
    }

    const andParts: any[] = [];
    if (color?.trim()) {
      andParts.push({
        OR: [
          { color: { equals: color.trim(), mode: "insensitive" } },
          { availableColors: { has: color.trim() } },
        ],
      });
    }
    if (size?.trim()) {
      andParts.push({
        OR: [
          { size: { equals: size.trim(), mode: "insensitive" } },
          { availableSizes: { has: size.trim() } },
        ],
      });
    }
    if (andParts.length > 0) {
      where.AND = andParts;
    }

    const orderBy: any = {};
    if (sortBy === "price") {
      orderBy.price = order;
    } else if (sortBy === "name") {
      orderBy.name = order;
    } else {
      orderBy.createdAt = order;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
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
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy,
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    });

    const total = await prisma.product.count({ where });

    // Get price range for active products
    const priceRange = await prisma.product.aggregate({
      where: {
        isActive: true,
      },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    return NextResponse.json({
      success: true,
      products,
      total,
      priceRange: {
        min: priceRange._min.price ? Number(priceRange._min.price) : 0,
        max: priceRange._max.price ? Number(priceRange._max.price) : 250,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

