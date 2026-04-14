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
import { isAdmin, getUserPermissions } from '@/utils/roles'
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

    // Parse filter from JSON if present
    const filterStr = searchParams.get('_filters') || searchParams.get('filter')
    let filterObj: any = {}
    if (filterStr) {
        try {
            // Support double-stringified JSON which can occur in some frontend environments
            filterObj = typeof filterStr === 'string' && filterStr.startsWith('"{') 
                ? JSON.parse(JSON.parse(filterStr)) 
                : JSON.parse(filterStr);
        } catch (e) {
            console.error('[Admin DownloadLogs API] Filter parse error:', e)
        }
    }

    const documentId = filterObj.document_id || filterObj.documentId || searchParams.get('document_id') || searchParams.get('documentId')
    const userId = filterObj.user_id || filterObj.userId || searchParams.get('user_id') || searchParams.get('userId')
    const searchQuery = filterObj.q || filterObj.searchQuery || searchParams.get('q')
    const category = filterObj.category || searchParams.get('category')
    const fromDate = filterObj.fromDate || searchParams.get('fromDate')
    const toDate = filterObj.toDate || searchParams.get('toDate')



    // Build where clause with proper typing
    const where: Prisma.download_logsWhereInput = {}
    if (documentId) {
      where.document_id = documentId
    }
    if (userId) {
      where.user_id = userId
    }
    
    // Category filter
    if (category) {
      where.documents = { category: { contains: category, mode: 'insensitive' } }
    }

    // Date range filter
    if (fromDate || toDate) {
      where.downloaded_at = {}
      if (fromDate) where.downloaded_at.gte = new Date(fromDate)
      if (toDate) where.downloaded_at.lte = new Date(toDate)
    }

    // Users can only see their own logs unless admin or subadmin
    const { isManager } = await getUserPermissions(user.id)
    if (!isManager) {
      where.user_id = user.id
    }

    // Search logic for download logs
    if (searchQuery && searchQuery.trim()) {
      const orConditions: Prisma.download_logsWhereInput[] = [
        { user_agent: { contains: searchQuery, mode: 'insensitive' } },
        { context: { contains: searchQuery, mode: 'insensitive' } },
        { documents: { title: { contains: searchQuery, mode: 'insensitive' } } },
        { documents: { category: { contains: searchQuery, mode: 'insensitive' } } },
        { profiles: { username: { contains: searchQuery, mode: 'insensitive' } } },
        { profiles: { email: { contains: searchQuery, mode: 'insensitive' } } },
        { profiles: { first_name: { contains: searchQuery, mode: 'insensitive' } } },
        { profiles: { last_name: { contains: searchQuery, mode: 'insensitive' } } },
      ]

      // IP address is an 'inet' type in Postgres. We must only query it if the search
      // query is a valid IP address to avoid 'AddrParseError'.
      const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
      if (ipv4Regex.test(searchQuery) || ipv6Regex.test(searchQuery)) {
        orConditions.push({ ip_address: { equals: searchQuery } })
      }

      where.OR = orConditions
    }

    // Pagination & Sorting (React Admin support)
    const page = parseInt(searchParams.get('_page') || '1')
    const perPage = parseInt(searchParams.get('_perPage') || '25')
    const sortField = searchParams.get('_sortField') || 'downloaded_at'
    const sortOrder = (searchParams.get('_sortOrder') || 'desc').toLowerCase()

    const logs = await prisma.download_logs.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { [sortField]: sortOrder },
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            file_name: true,
            category: true
          }
        },
        profiles: {
          select: {
            username: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      }
    })

    const total = await prisma.download_logs.count({ where })

    const serializedLogs = logs.map((log: any) => {
        const { documents, profiles, ...rest } = log;
        const firstName = profiles?.first_name || '';
        const lastName = profiles?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || profiles?.username || 'Unknown User';

        return {
            ...rest,
            document_title: documents?.title,
            document_category: documents?.category,
            full_name: fullName,
            email: profiles?.email,
        };
    })

    return NextResponse.json({
      data: serializedLogs,
      total: total
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

