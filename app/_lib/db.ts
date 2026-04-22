import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// Note: In Prisma 7, the constructor accepts an 'adapter' property.
// The TypeScript error 'never' usually means the types are not yet fully re-generated.
export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Prisma connects lazily by default - no need to call $connect() at import time
// This prevents Edge runtime issues and allows Prisma to only run in Node.js runtime
// Force reload of Prisma Client
// Last generated: 2026-04-21
// Last updated: Tue Apr 21 23:03:43 PKT 2026
