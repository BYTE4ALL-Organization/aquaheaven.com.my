import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getProductReviews, getProductRating } from '@/lib/seed-reviews'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Find product by slug first
    let product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true }
    })

    // If not found by slug, try by ID (for backward compatibility)
    if (!product) {
      const idMatch = slug.match(/^(\d+)/)
      if (idMatch) {
        product = await prisma.product.findUnique({
          where: { id: idMatch[1] },
          select: { id: true }
        })
      }
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get reviews and rating for the product
    const [reviews, rating] = await Promise.all([
      getProductReviews(product.id, page, limit),
      getProductRating(product.id)
    ])

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews.reviews,
        rating,
        pagination: reviews.pagination
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { rating, title, comment, userId } = body

    // Validate required fields
    if (!rating || !userId) {
      return NextResponse.json(
        { success: false, error: 'Rating and userId are required' },
        { status: 400 }
      )
    }

    // Find product by slug first
    let product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true }
    })

    // If not found by slug, try by ID (for backward compatibility)
    if (!product) {
      const idMatch = slug.match(/^(\d+)/)
      if (idMatch) {
        product = await prisma.product.findUnique({
          where: { id: idMatch[1] },
          select: { id: true }
        })
      }
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        title,
        comment,
        userId,
        productId: product.id
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: review
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

