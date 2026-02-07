import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      isActive,
      isFeatured,
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

    // Slug must be unique only among *other* products (allow keeping current product's own slug)
    const existingWithSlug = await prisma.product.findFirst({
      where: {
        slug: resolvedSlug,
        id: { not: id },
      },
    })
    if (existingWithSlug) {
      return NextResponse.json(
        { success: false, error: 'A product with this slug already exists. Please use a different name or slug.' },
        { status: 400 }
      )
    }

    // SKU must be unique only among *other* products (allow empty or keeping current product's SKU)
    const resolvedSku = sku != null && String(sku).trim() !== '' ? String(sku).trim() : null
    if (resolvedSku) {
      const existingWithSku = await prisma.product.findFirst({
        where: {
          sku: resolvedSku,
          id: { not: id },
        },
      })
      if (existingWithSku) {
        return NextResponse.json(
          { success: false, error: 'A product with this SKU already exists. Please use a different SKU.' },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug: resolvedSlug,
        description,
        price: Number(price),
        quantity: Number(quantity),
        images,
        thumbnail,
        categoryId: categoryId || null,
        brandId: brandId || null,
        isActive,
        isFeatured,
        sku: resolvedSku,
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
    console.error('Error updating product:', error)
    
    // Check for Prisma unique constraint errors (e.g., duplicate slug or SKU)
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        const meta = (error as { meta?: { target?: string[] } }).meta
        const target = Array.isArray(meta?.target) ? meta.target : []
        const isSku = target.includes('sku')
        const message = isSku
          ? 'A product with this SKU already exists. Please use a different SKU.'
          : 'A product with this slug already exists. Please use a different name or slug.'
        return NextResponse.json(
          { success: false, error: message },
          { status: 400 }
        )
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        )
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
