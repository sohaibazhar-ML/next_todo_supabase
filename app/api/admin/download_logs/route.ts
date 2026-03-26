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
import { isAdmin } from '@/utils/roles'
import type { Prisma } from '@prisma/client'
import { isErrorWithMessage } from '@/utils'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

// GET - Get download logs
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Single record by ID (getOne)
    if (id) {
        try {
            const log = await prisma.download_logs.findUnique({
                where: { id },
                include: {
                    documents: {
                        select: { title: true }
                    },
                    profiles: {
                        select: { username: true, email: true }
                    }
                }
            })
            if (!log) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 })
            }
            return NextResponse.json({
                ...log,
                document_title: log.documents?.title,
                username: log.profiles?.username,
                email: log.profiles?.email,
            })
        } catch (error) {
            console.error('[Admin DownloadLogs API] getOne error:', error)
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
        }
    }

    const ids = searchParams.get('ids')

    // List of records by IDs (getMany)
    if (ids) {
        try {
            const idList = JSON.parse(ids)
            const logs = await prisma.download_logs.findMany({
                where: { id: { in: idList } },
                include: {
                    documents: {
                      select: { title: true }
                    },
                    profiles: {
                      select: { username: true, email: true }
                    }
                }
            })
            const serialized = logs.map((log: any) => ({
                ...log,
                document_title: log.documents?.title,
                username: log.profiles?.username,
                email: log.profiles?.email,
            }))
            return NextResponse.json(serialized)
        } catch (error) {
            console.error('[Admin DownloadLogs API] getMany error:', error)
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
        }
    }

    const documentId = searchParams.get('documentId')
    const userId = searchParams.get('userId')

    const admin = await isAdmin(user.id)

    // Build where clause with proper typing
    const where: Prisma.download_logsWhereInput = {}
    if (documentId) {
      where.document_id = documentId
    }
    if (userId) {
      where.user_id = userId
    }
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
        },
        profiles: {
          select: {
            username: true,
            email: true
          }
        }
      }
    })

    const serializedLogs = logs.map((log: any) => ({
      ...log,
      document_title: log.documents?.title,
      username: log.profiles?.username,
      email: log.profiles?.email,
    }))

    return NextResponse.json({
      data: serializedLogs,
      total: logs.length
    })
  } catch (error: unknown) {
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
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const body = await request.json()

    // Users can only log their own downloads
    if (body.user_id !== user.id) {
      return NextResponse.json({ error: ERROR_MESSAGES.FORBIDDEN }, { status: 403 })
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
  } catch (error: unknown) {
    console.error(CONSOLE_MESSAGES.ERROR_CREATING_DOWNLOAD_LOG, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE - Delete download log (admin only)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: ERROR_MESSAGES.ADMIN_ACCESS_REQUIRED }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.download_logs.delete({
      where: { id }
    })

    return NextResponse.json({ id })
  } catch (error: unknown) {
    console.error('[Admin DownloadLogs API] delete error:', error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

