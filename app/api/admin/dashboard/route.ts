import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all stats in parallel
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      lowStockProducts,
      recentOrders,
      topProducts,
      totalRevenue
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count({
        where: {
          quantity: {
            lte: 10
          }
        }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.product.findMany({
        include: {
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        }
      }),
      prisma.order.aggregate({
        _sum: {
          total: true
        },
        where: {
          status: {
            in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED']
          }
        }
      })
    ])

    // Calculate average ratings for top products and sort by review count
    const topProductsWithRatings = topProducts
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        reviewCount: product._count.reviews,
        averageRating: product.reviews.length > 0 
          ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)
          : '0.0'
      }))
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 5)

    const stats = {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue._sum.total || 0,
      lowStockProducts,
      recentOrders,
      topProducts: topProductsWithRatings
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
