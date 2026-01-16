/**
 * Download Logs API Route
 * 
 * Handles download log operations:
 * - GET: Fetch download logs
 * - POST: Create download log
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Use Prisma types for filters
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/utils/roles'
import type { DownloadLogWhereInput } from '@/types/prisma'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

// GET - Get download logs
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const userId = searchParams.get('userId')

    const admin = await isAdmin(user.id)

    // Build where clause with proper typing
    const where: DownloadLogWhereInput = {}
    if (documentId) where.document_id = documentId
    if (userId) where.user_id = userId
    // Users can only see their own logs unless admin
    if (!admin) {
      where.user_id = user.id
    }

    const logs = await prisma.download_logs.findMany({
      where,
      orderBy: { downloaded_at: 'desc' },
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            file_name: true
          }
        }
      }
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_FETCHING_DOWNLOAD_LOGS, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// POST - Create download log
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Users can only log their own downloads
    if (body.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Extract IP and user agent from request headers (server-side)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip_address = forwardedFor?.split(',')[0]?.trim() || null
    const user_agent = request.headers.get('user-agent') || null

    const log = await prisma.download_logs.create({
      data: {
        document_id: body.document_id,
        user_id: body.user_id,
        ip_address: ip_address,
        user_agent: user_agent,
        context: body.context || null,
        metadata: body.metadata || null,
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_CREATING_DOWNLOAD_LOG, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

