import { NextResponse } from 'next/server'
import { generateRandomReviews } from '@/lib/seed-reviews'

export async function POST() {
  try {
    // Import the seed function dynamically to avoid issues
    const { default: seed } = await import('../../../../prisma/seed')
    
    // Run the seed function
    await seed()
    
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
