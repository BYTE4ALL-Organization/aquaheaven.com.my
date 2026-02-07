import { prisma } from "@/lib/prisma";

const POSITIVE_COMMENTS = [
  "Using this towel every day. It was nice from the first use. Very smooth and super nice to use after a shower.",
  "Premium feel and classy. Took it to the beach and it dried good, not just small. Actually good size.",
  "Feels very smooth on the skin. Doesn't irritate the skin at all. Love it after a shower.",
  "Super nice to use after a shower. Premium feel and dries good. Smooth on the skin.",
  "Classy at the beach. Actually good, not just small. Dry good and the skin doesn't irritate.",
  "Very smooth. Nice to use after a shower. Premium feel and doesn't irritate the skin.",
  "People said it was nice and they were right. Feel very smooth, super nice after a shower. Premium feel.",
  "Using their towel at the beach – classy. Dry good, smooth on the skin, doesn't irritate.",
  "It was nice. Feel very smooth, super nice to use after a shower. Premium feel, classy.",
  "Actually good, not just small. Dries good, smoothly. The skin doesn't irritate. Love it.",
  "Super nice to use after a shower. Premium feel. Smooth on the skin, doesn't irritate the skin.",
  "Using this towel daily. Very smooth, nice after shower. Premium feel, dries good.",
  "Classy at the beach. Actually good size, dry good. Smoothly on the skin, doesn't irritate.",
  "Feel very smooth. Super nice after a shower. Premium feel. Skin doesn't irritate.",
  "Nice towel. Using it at the beach – classy. Dry good, smooth, doesn't irritate the skin.",
  "Very smooth and super nice to use after a shower. Premium feel. Actually good, not small.",
  "Dries good, smooth on the skin. Doesn't irritate the skin. Nice after a shower.",
  "Premium feel. Classy at the beach. Actually good size. Smoothly, skin doesn't irritate.",
  "Using their towel – feel very smooth. Super nice after shower. Premium, dry good.",
  "It was nice. Smooth, super nice to use after a shower. Doesn't irritate the skin.",
  "Actually good towel, not just small. Dry good. Smooth on the skin, no irritation.",
  "Super nice after a shower. Premium feel, classy. Very smooth. Skin doesn't irritate.",
  "Feel very smooth. Using it after every shower. Premium feel, dries good, doesn't irritate.",
  "Classy at the beach. Dry good. Smoothly. The skin doesn't irritate. Actually good size.",
  "People said it was nice – they're right. Very smooth, premium feel. Nice after shower.",
  "Using their towel daily. Super nice after a shower. Smooth, dry good, doesn't irritate skin.",
  "Premium feel and very smooth. Nice to use after a shower. Actually good, not small.",
  "Dry good and smooth on the skin. Doesn't irritate the skin. Classy, premium feel.",
  "Super nice to use after a shower. Feel very smooth. Premium feel. Skin doesn't irritate.",
  "Actually good size, not just small. Dries good. Smoothly, doesn't irritate the skin.",
  "Classy at the beach. Very smooth. Super nice after shower. Premium feel, dry good.",
  "It was nice. Smooth, premium feel. Nice after a shower. Doesn't irritate the skin.",
  "Using this towel – feel very smooth. Dry good. Smoothly, skin doesn't irritate.",
  "Premium feel. Super nice after a shower. Actually good, not small. Doesn't irritate skin.",
  "Very smooth and nice. Using after every shower. Classy, dry good. No skin irritation.",
  "Feel very smooth. Premium feel. Super nice after shower. Actually good. Skin doesn't irritate.",
  "Dry good, smooth on the skin. Doesn't irritate the skin. Classy, premium feel.",
  "Super nice to use after a shower. Very smooth. Actually good size. No irritation.",
  "Using their towel – it was nice. Very smooth, premium feel. Nice after shower.",
  "Actually good, not just small. Feel very smooth. Dry good. Doesn't irritate the skin.",
  "Classy at the beach. Super nice after a shower. Premium feel. Smooth, no skin irritation.",
  "People said it was nice. Very smooth, super nice after shower. Premium feel, dry good.",
  "Smoothly. The skin doesn't irritate. Premium feel. Nice to use after a shower.",
  "Using this towel – super nice after shower. Very smooth. Dry good. Doesn't irritate skin.",
  "Premium feel, classy. Actually good size. Very smooth. Skin doesn't irritate.",
  "Feel very smooth. Dry good. Super nice after a shower. Doesn't irritate the skin.",
  "It was nice. Classy at the beach. Actually good. Smooth on skin, no irritation.",
  "Very smooth. Premium feel. Using after every shower. Dry good. Skin doesn't irritate.",
  "Super nice after a shower. Feel very smooth. Actually good, not small. No irritation.",
];

/** Get or create seed users for reviews (need at least 100 for variety) */
async function getOrCreateSeedUsers(count: number): Promise<string[]> {
  const existing = await prisma.user.findMany({
    take: count,
    select: { id: true },
  });
  const ids = existing.map((u) => u.id);
  if (ids.length >= count) return ids.slice(0, count);

  const toCreate = count - ids.length;
  for (let i = 0; i < toCreate; i++) {
    const email = `reviewer-seed-${Date.now()}-${i}@aquaheaven.local`;
    const name = `Customer ${i + 1}`;
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, name },
      update: {},
      select: { id: true },
    });
    ids.push(user.id);
  }
  return ids;
}

/** Random date between 2023-01-01 and 2026-12-31 for review variety */
function randomReviewDate(): Date {
  const start = new Date("2023-01-01T00:00:00.000Z").getTime();
  const end = new Date("2026-12-31T23:59:59.999Z").getTime();
  return new Date(start + Math.random() * (end - start));
}

export type SeedTowelReviewsOptions = {
  /** If set, seed only this product (25–115 reviews). Otherwise seed all towel products. */
  productId?: string;
};

/** Seed positive reviews (25–115 per product, rating 4–5, average 4.2–4.8). All towels or one product. */
export async function seedTowelReviews(options?: SeedTowelReviewsOptions): Promise<{ products: number; reviews: number }> {
  let products: { id: string }[];

  if (options?.productId) {
    const product = await prisma.product.findUnique({
      where: { id: options.productId },
      select: { id: true },
    });
    products = product ? [product] : [];
  } else {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { slug: { contains: "towel", mode: "insensitive" } },
          { name: { contains: "towel", mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    const categoryIds = categories.map((c) => c.id);
    if (categoryIds.length === 0) {
      return { products: 0, reviews: 0 };
    }
    products = await prisma.product.findMany({
      where: { categoryId: { in: categoryIds }, isActive: true },
      select: { id: true },
    });
  }

  if (products.length === 0) {
    return { products: 0, reviews: 0 };
  }

  const userIds = await getOrCreateSeedUsers(100);
  let totalReviews = 0;

  for (const product of products) {
    const reviewCount = 25 + Math.floor(Math.random() * 91); // 25–115
    const targetAvg = 4.2 + Math.random() * 0.6; // 4.2–4.8
    const p5 = (targetAvg - 4); // fraction that are 5 (e.g. 4.5 avg => 0.5)
    const numFives = Math.round(reviewCount * p5);
    const numFours = reviewCount - numFives;

    const ratings: number[] = [];
    for (let i = 0; i < numFives; i++) ratings.push(5);
    for (let i = 0; i < numFours; i++) ratings.push(4);
    for (let i = ratings.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ratings[i], ratings[j]] = [ratings[j], ratings[i]];
    }

    const comments = [...POSITIVE_COMMENTS];
    while (comments.length < reviewCount) {
      comments.push(comments[comments.length % POSITIVE_COMMENTS.length]);
    }

    const batch = Array.from({ length: reviewCount }, (_, i) => {
      const createdAt = randomReviewDate();
      return {
        productId: product.id,
        userId: userIds[i % userIds.length],
        rating: ratings[i],
        comment: comments[i % comments.length],
        title: null as string | null,
        isVerified: Math.random() > 0.3,
        createdAt,
        updatedAt: createdAt,
      };
    });
    await prisma.review.createMany({ data: batch });
    totalReviews += reviewCount;
  }

  return { products: products.length, reviews: totalReviews };
}
