import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

const STACK_WEBHOOK_SECRET = process.env.STACK_WEBHOOK_SECRET

export async function POST(request: Request) {
  if (!STACK_WEBHOOK_SECRET) {
    console.error('[webhook/stack] STACK_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing Svix headers' },
      { status: 400 }
    )
  }

  const rawBody = await request.text()

  let payload: { type: string; data: Record<string, unknown> }
  try {
    const wh = new Webhook(STACK_WEBHOOK_SECRET)
    payload = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: Record<string, unknown> }
  } catch (err) {
    console.error('[webhook/stack] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const { type, data } = payload
  const id = typeof data?.id === 'string' ? data.id : null
  const email =
    typeof (data?.primary_email ?? data?.email) === 'string'
      ? (data.primary_email ?? data.email) as string
      : (data?.email_address ?? data?.email) as string | undefined
  const name =
    typeof (data?.display_name ?? data?.name) === 'string'
      ? (data.display_name ?? data.name) as string
      : null
  const image =
    typeof (data?.profile_image_url ?? data?.image ?? data?.avatar_url) === 'string'
      ? (data.profile_image_url ?? data.image ?? data.avatar_url) as string
      : null

  try {
    switch (type) {
      case 'user.created': {
        if (!id) {
          return NextResponse.json(
            { error: 'user.created missing data.id' },
            { status: 400 }
          )
        }
        const emailValue = email ?? `user-${id}@stack.placeholder`
        await prisma.user.upsert({
          where: { id },
          create: {
            id,
            email: emailValue,
            name,
            image,
          },
          update: {
            email: emailValue,
            name,
            image,
          },
        })
        break
      }
      case 'user.updated': {
        if (!id) {
          return NextResponse.json(
            { error: 'user.updated missing data.id' },
            { status: 400 }
          )
        }
        const emailValue = email ?? `user-${id}@stack.placeholder`
        await prisma.user.upsert({
          where: { id },
          create: {
            id,
            email: emailValue,
            name,
            image,
          },
          update: {
            email: emailValue,
            ...(name !== undefined && { name }),
            ...(image !== undefined && { image }),
          },
        })
        break
      }
      case 'user.deleted': {
        if (!id) {
          return NextResponse.json(
            { error: 'user.deleted missing data.id' },
            { status: 400 }
          )
        }
        await prisma.user.delete({ where: { id } }).catch(() => {
          // User may already be missing (e.g. never synced)
        })
        break
      }
      default:
        // Ignore other event types (team.*, etc.)
        return NextResponse.json({ received: true })
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[webhook/stack] DB error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
