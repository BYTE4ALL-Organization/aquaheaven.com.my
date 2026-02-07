import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      brands
    })
  } catch (error: any) {
    console.error('Error fetching brands:', error)
    
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
      { success: false, error: error?.message || 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, logo } = body

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        logo
      }
    })

    return NextResponse.json({
      success: true,
      brand
    })
  } catch (error) {
    console.error('Error creating brand:', error)
    
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
      { success: false, error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}
