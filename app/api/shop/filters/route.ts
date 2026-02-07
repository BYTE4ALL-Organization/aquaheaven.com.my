import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [categories, brands, priceRange, productsForAttrs] = await Promise.all([
      prisma.category.findMany({
        where: { parentId: null },
        select: {
          id: true,
          name: true,
          slug: true,
          children: {
            select: { id: true, name: true, slug: true },
            orderBy: { name: "asc" as const },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.brand.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      prisma.product.aggregate({
        where: { isActive: true },
        _min: { price: true },
        _max: { price: true },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          color: true,
          availableColors: true,
          size: true,
          availableSizes: true,
        },
      }),
    ]);

    const priceMin = priceRange._min.price != null ? Number(priceRange._min.price) : 0;
    const priceMax = priceRange._max.price != null ? Number(priceRange._max.price) : 250;

    const colorSet = new Set<string>();
    const sizeSet = new Set<string>();
    for (const p of productsForAttrs) {
      if (p.color?.trim()) colorSet.add(p.color.trim());
      if (p.size?.trim()) sizeSet.add(p.size.trim());
      if (Array.isArray(p.availableColors))
        p.availableColors.forEach((c) => c?.trim() && colorSet.add(c.trim()));
      if (Array.isArray(p.availableSizes))
        p.availableSizes.forEach((s) => s?.trim() && sizeSet.add(s.trim()));
    }

    const colors = Array.from(colorSet).sort();
    const sizes = Array.from(sizeSet).sort();

    const categoriesFlat: { name: string; slug: string }[] = [];
    for (const c of categories) {
      categoriesFlat.push({ name: c.name, slug: c.slug });
      for (const child of c.children || []) {
        categoriesFlat.push({ name: child.name, slug: child.slug });
      }
    }

    return NextResponse.json({
      success: true,
      categories: categoriesFlat,
      brands: brands.map((b) => ({ name: b.name, slug: b.slug })),
      priceRange: { min: priceMin, max: Math.max(priceMax, priceMin) },
      colors,
      sizes,
    });
  } catch (error) {
    console.error("Error fetching shop filters:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
