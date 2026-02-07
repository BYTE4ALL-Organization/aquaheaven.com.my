import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      brand
    })
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brand' },
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
    const { name, slug, logo } = body

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        slug,
        logo: logo || null
      }
    })

    return NextResponse.json({
      success: true,
      brand
    })
  } catch (error) {
    console.error('Error updating brand:', error)
    
    // Check for Prisma unique constraint errors (e.g., duplicate slug)
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'A brand with this slug already exists. Please use a different name or slug.' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update brand' },
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

    // Check if brand has products
    const productCount = await prisma.product.count({
      where: { brandId: id }
    })

    if (productCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete brand with products' },
        { status: 400 }
      )
    }

    await prisma.brand.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
}
