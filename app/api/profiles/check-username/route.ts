import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const existing = await prisma.profiles.findUnique({
      where: { username },
      select: { id: true }
    })

    return NextResponse.json({ exists: !!existing })
  } catch (error: any) {
    console.error('Error checking username:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

