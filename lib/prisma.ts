import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Test connection on startup in development
if (process.env.NODE_ENV === 'development') {
  // Test connection asynchronously to avoid blocking startup
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connection successful')
    })
    .catch((error: any) => {
      console.error('❌ Database connection failed:', error.message)
      console.error('💡 Make sure:')
      console.error('   1. Your .env file has DATABASE_URL with sslmode=require')
      console.error('   2. Your Supabase database is active (not paused)')
      console.error('   3. Your database password is correct')
      console.error('   4. You have internet connectivity')
      console.error('   5. Check DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✓' : 'Missing ✗')
    })
}

