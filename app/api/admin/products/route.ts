import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      products
    })
  } catch (error: any) {
    console.error('Error fetching products:', error)
    
    // Provide more helpful error messages
    if (error?.code === 'P1001') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed. Please check if your Neon database is active and the connection string is correct.' 
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      slug, 
      description, 
      price: priceRaw, 
      quantity: quantityRaw, 
      images, 
      thumbnail,
      categoryId, 
      brandId,
      isActive = true,
      isFeatured = false,
      sku,
      color,
      size,
      material,
      availableColors = [],
      availableSizes = []
    } = body

    // Coerce price and quantity to numbers (form/JSON may send strings)
    const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw) : NaN
    const quantity = quantityRaw != null && quantityRaw !== '' ? Number(quantityRaw) : 0

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      )
    }

    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid price (>= 0) is required' },
        { status: 400 }
      )
    }

    // Category is required only if product is active (not a draft)
    if (isActive && !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category is required for active products. Save as draft if category is missing.' },
        { status: 400 }
      )
    }

    const resolvedSlug =
      slug && String(slug).trim()
        ? String(slug).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const product = await prisma.product.create({
      data: {
        name,
        slug: resolvedSlug,
        description,
        price: Number(price),
        quantity: Number(quantity),
        images,
        thumbnail,
        categoryId,
        brandId,
        isActive,
        isFeatured,
        sku,
        color,
        size,
        material,
        availableColors: Array.isArray(availableColors) ? availableColors : [],
        availableSizes: Array.isArray(availableSizes) ? availableSizes : []
      },
      include: {
        category: true,
        brand: true
      }
    })

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Error creating product:', error)
    
    // Check for Prisma unique constraint errors (e.g., duplicate slug)
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'A product with this slug already exists. Please use a different name or slug.' },
          { status: 400 }
        )
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
