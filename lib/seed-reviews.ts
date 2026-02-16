import { prisma } from '@/lib/prisma'

export interface ProductReviewItem {
  id: string
  rating: number
  title: string | null
  comment: string | null
  isVerified: boolean
  createdAt: string
  user: {
    name: string | null
    image: string | null
  }
}

export interface ProductReviewsResult {
  reviews: ProductReviewItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ProductRatingResult {
  average: number
  count: number
}

/**
 * Get paginated reviews for a product.
 */
export async function getProductReviews(
  productId: string,
  page: number,
  limit: number
): Promise<ProductReviewsResult> {
  const skip = (page - 1) * limit
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    }),
    prisma.review.count({ where: { productId } }),
  ])

  const items: ProductReviewItem[] = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    isVerified: r.isVerified,
    createdAt: r.createdAt.toISOString(),
    user: {
      name: r.user.name,
      image: r.user.image,
    },
  }))

  return {
    reviews: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

/**
 * Get aggregate rating (average and count) for a product.
 */
export async function getProductRating(productId: string): Promise<ProductRatingResult> {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { id: true },
  })

  return {
    average: result._avg.rating ?? 0,
    count: result._count.id,
  }
}
