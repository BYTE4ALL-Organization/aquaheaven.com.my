import { NextRequest, NextResponse } from 'next/server'
import { setCurrencySymbol } from '@/lib/settings'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth(request)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { getSettings } = await import('@/lib/settings')
  const settings = await getSettings()
  return NextResponse.json({ success: true, settings })
}

export async function PUT(request: NextRequest) {
  const session = await auth(request)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { currencySymbol } = body
    if (currencySymbol != null) {
      await setCurrencySymbol(String(currencySymbol))
    }
    const { getSettings } = await import('@/lib/settings')
    const settings = await getSettings()
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
