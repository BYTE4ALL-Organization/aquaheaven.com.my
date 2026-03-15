import { NextResponse } from 'next/server'
import { requireAdminApi } from '../_utils'

export async function POST(request: Request) {
  const forbidden = await requireAdminApi(request)
  if (forbidden) return forbidden

  try {
    // Import the seed function dynamically to avoid issues
    const { main } = await import('../../../../prisma/seed')
    await main()
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!'
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
