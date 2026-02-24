import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

const productInclude = {
  productCategories: {
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  },
  reviews: {
    select: { rating: true },
  },
} as const;

export type ProductsListOptions = {
  category?: string;
  brand?: string;
  featured?: boolean;
  bestSellers?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
};

export async function getProductsList(
  prisma: PrismaClient,
  options: ProductsListOptions = {}
) {
  const {
    category,
    brand,
    featured,
    bestSellers,
    limit,
    offset,
    sortBy = "createdAt",
    order = "desc",
    minPrice,
    maxPrice,
    color,
    size,
  } = options;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (category) {
    const catRow = await prisma.category.findFirst({
      where: { slug: category },
      select: { id: true, parentId: true },
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
    where.brand = { slug: brand.trim() };
  }
  if (featured === true) {
    where.isFeatured = true;
  }
  if (bestSellers === true) {
    where.isBestSeller = true;
  }
  if (minPrice != null && !Number.isNaN(minPrice)) {
    where.price = { ...(typeof where.price === "object" && where.price !== null ? where.price : {}), gte: minPrice };
  }
  if (maxPrice != null && !Number.isNaN(maxPrice)) {
    where.price = { ...(typeof where.price === "object" && where.price !== null ? where.price : {}), lte: maxPrice };
  }
  const andParts: Prisma.ProductWhereInput[] = [];
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

  const orderBy: any =
    sortBy === "price"
      ? { price: order }
      : sortBy === "name"
        ? { name: order }
        : { createdAt: order };

  const [products, total, priceRange] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      take: limit,
      skip: offset,
    }),
    prisma.product.count({ where }),
    prisma.product.aggregate({
      where: { isActive: true },
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  return {
    products,
    total,
    priceRange: {
      min: priceRange._min.price != null ? Number(priceRange._min.price) : 0,
      max: priceRange._max.price != null ? Number(priceRange._max.price) : 250,
    },
  };
}

export async function getFilters(prisma: PrismaClient) {
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
  const categoriesHierarchical: { name: string; slug: string; children: { name: string; slug: string }[] }[] = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    children: (c.children ?? []).map((ch) => ({ name: ch.name, slug: ch.slug })),
  }));
  return {
    categories: categoriesHierarchical,
    brands: brands.map((b) => ({ name: b.name, slug: b.slug })),
    priceRange: { min: priceMin, max: Math.max(priceMax, priceMin) },
    colors: Array.from(colorSet).sort(),
    sizes: Array.from(sizeSet).sort(),
  };
}

export async function getProductBySlugOrId(
  prisma: PrismaClient,
  slugOrId: string
) {
  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ slug: slugOrId }, { id: slugOrId }],
    },
    include: productInclude,
  });
  return product;
}

const productDetailInclude = {
  productCategories: {
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  },
  reviews: {
    include: {
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" as const },
  },
} as const;

/** Single product with categories and full reviews for product page. */
export async function getProductDetail(prisma: PrismaClient, slugOrId: string) {
  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ slug: slugOrId }, { id: slugOrId }],
    },
    include: productDetailInclude,
  });
  return product;
}

/** Latest reviews for homepage Happy Customers section. */
export async function getReviews(prisma: PrismaClient, limit = 12) {
  const rows = await prisma.review.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    user: r.user?.name || "Customer",
    content: r.comment || r.title || "",
    rating: r.rating,
    date: r.createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }));
}
