import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/** Must match `MediaConfig.id` / `@default("default")` in prisma/schema.prisma */
const MEDIA_CONFIG_SINGLETON_ID = 'default' as const

/** Env URL endpoint (no trailing slash), e.g. https://ik.imagekit.io/your_id */
function urlEndpointFromEnv(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.trim()
  if (!raw) return undefined
  return raw.replace(/\/$/, '')
}

/**
 * Resolves ImageKit URL endpoint: `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` first, then optional `MediaConfig` row.
 */
export async function getImageKitUrlEndpoint(): Promise<string | undefined> {
  const fromEnv = urlEndpointFromEnv()
  if (fromEnv) return fromEnv

  try {
    // Use $queryRaw so this file does not depend on generated `prisma.mediaConfig` typings
    // (fixes TS when the IDE/client is out of sync — run `npx prisma generate`).
    const rows = await prisma.$queryRaw<Array<{ imagekitUrlEndpoint: string | null }>>(
      Prisma.sql`
        SELECT "imagekitUrlEndpoint"
        FROM "media_config"
        WHERE "id" = ${MEDIA_CONFIG_SINGLETON_ID}
        LIMIT 1
      `
    )
    const fromDb = rows[0]?.imagekitUrlEndpoint?.trim()
    return fromDb ? fromDb.replace(/\/$/, '') : undefined
  } catch {
    return undefined
  }
}

/** Server-side upload to ImageKit uses the private API key only. */
export function isImageKitServerUploadConfigured(): boolean {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY?.trim())
}

/** Folder path on ImageKit (leading slash). Override with IMAGEKIT_UPLOAD_FOLDER. */
export function getImageKitUploadFolder(): string {
  const f = process.env.IMAGEKIT_UPLOAD_FOLDER?.trim() || '/aquaheaven/uploads'
  return f.startsWith('/') ? f : `/${f}`
}
