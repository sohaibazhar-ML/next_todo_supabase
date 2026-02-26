/**
 * Documents API Route
 *
 * Handles document CRUD operations:
 * - GET: Fetch documents with optional filters
 * - POST: Create document (admin only)
 *
 * Delegates all database operations to DocumentService.
 * Validates inputs via Zod schemas.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/utils/roles'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'
import { documentCreateSchema } from '@/lib/validations'
import * as DocumentService from '@/services/server/document.service'

// GET - Get documents with optional filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const fileType = searchParams.get('fileType')
    const featuredOnly = searchParams.get('featuredOnly') === 'true'
    const searchQuery = searchParams.get('searchQuery')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const sort = searchParams.get('sort') || 'created_at_desc'

    // If search query exists, use full-text search
    if (searchQuery && searchQuery.trim()) {
      const documents = await DocumentService.searchDocuments({
        searchQuery,
        category,
        fileType,
        fromDate,
        toDate,
        tags,
      })
      return NextResponse.json(documents)
    }

    // Regular query - only show root documents (not versions)
    const documents = await DocumentService.getDocuments({
      category,
      fileType,
      featuredOnly,
      tags,
      fromDate,
      toDate,
      sort,
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_FETCHING_DOCUMENTS, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// POST - Create document (admin only)
export async function POST(request: Request) {
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

    const body = await request.json()

    // Validate input with Zod
    const parsed = documentCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      )
    }

    const document = await DocumentService.createDocument(parsed.data, user.id)

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_CREATING_DOCUMENT, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
