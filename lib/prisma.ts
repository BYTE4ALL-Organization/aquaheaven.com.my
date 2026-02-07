import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  if (typeof process !== 'undefined' && !process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Add it to your .env file or run prisma generate and ensure .env is loaded.'
    )
  }
  
  // Clean DATABASE_URL - remove quotes if present
  const databaseUrl = process.env.DATABASE_URL?.replace(/^['"]|['"]$/g, '') || ''
  
  // Create Prisma client with connection pooling configuration for Neon
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
