import { NextResponse } from 'next/server'

export async function POST() {
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
