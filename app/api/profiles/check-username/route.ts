/**
 * Check Username API Route
 * 
 * Handles username availability checking:
 * - GET: Check if username exists
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Improve error handling
 */

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

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
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_CHECKING_USERNAME, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

