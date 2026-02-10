import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function test() {
  try {
    console.log('Testing Prisma connection with encoded password...')
    const profilesCount = await prisma.profiles.count()
    console.log(`Success! Found ${profilesCount} profiles.`)
  } catch (error) {
    console.error('Prisma connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

test()
