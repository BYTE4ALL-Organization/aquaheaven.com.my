import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient(): PrismaClient {
  if (typeof process !== 'undefined' && !process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Add it to your .env file or run prisma generate and ensure .env is loaded.'
    )
  }

  const databaseUrl = process.env.DATABASE_URL?.replace(/^['"]|['"]$/g, '') || ''

  const pool =
    globalForPrisma.pool ?? new Pool({ connectionString: databaseUrl })
  globalForPrisma.pool = pool

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  })
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

globalForPrisma.prisma = prisma
