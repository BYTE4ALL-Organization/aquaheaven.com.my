import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings'

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { currencySymbol: 'RM' },
      { status: 200 }
    )
  }
}
