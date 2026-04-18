import { NextResponse } from 'next/server'
import { getUploadAuthParams } from '@imagekit/next/server'
import { requireAdminApi } from '@/app/api/admin/_utils'

/**
 * ImageKit client upload auth (admin-only). See https://imagekit.io/docs/integration/nextjs
 */
export async function GET(request: Request) {
  const forbidden = await requireAdminApi(request)
  if (forbidden) return forbidden

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim()
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY?.trim()
  if (!privateKey || !publicKey) {
    return NextResponse.json(
      { error: 'ImageKit keys are not configured (IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY)' },
      { status: 503 }
    )
  }

  const { token, expire, signature } = getUploadAuthParams({
    privateKey,
    publicKey,
  })

  return NextResponse.json({
    token,
    expire,
    signature,
    publicKey,
  })
}
