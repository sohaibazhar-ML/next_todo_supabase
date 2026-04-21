/**
 * Document Download URL API Route
 * 
 * Handles generating signed download URLs:
 * - GET: Get signed download URL for a document
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin, isSubadmin } from '@/utils/roles'
import { isErrorWithMessage } from '@/utils'
import { CONSOLE_MESSAGES, ERROR_MESSAGES, STORAGE_BUCKETS, STORAGE_CONFIG } from '@/constants'

// GET - Get signed download URL for a document
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    // SECURITY: Enforce admin/subadmin role for the admin namespace
    const userIsAdmin = await isAdmin(user.id)
    const userIsSubadmin = await isSubadmin(user.id)

    if (!userIsAdmin && !userIsSubadmin) {
      return NextResponse.json({ error: ERROR_MESSAGES.FORBIDDEN }, { status: 403 })
    }

    const { id } = await params

    // Validate UUID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_DOCUMENT_ID },
        { status: 400 }
      )
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      console.error('Invalid UUID format:', id)
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_DOCUMENT_ID_FORMAT },
        { status: 400 }
      )
    }

    // Get document to get file path
    const document = await prisma.documents.findUnique({
      where: { id },
      select: { file_path: true, id: true }
    })

    if (!document || !document.file_path) {
      return NextResponse.json({ error: ERROR_MESSAGES.DOCUMENT_NOT_FOUND }, { status: 404 })
    }

    // AUDIT: Create download log entry server-side during URL generation
    // This ensures every generated link is tracked regardless of client behavior
    try {
      const forwardedFor = request.headers.get('x-forwarded-for')
      const ip_address = forwardedFor?.split(',')[0]?.trim() || null
      const user_agent = request.headers.get('user-agent') || null

      await prisma.download_logs.create({
        data: {
          document_id: document.id,
          user_id: user.id,
          ip_address,
          user_agent,
          context: 'Admin Download URL Generation',
          metadata: { source: 'api/admin/documents/[id]/download-url' }
        }
      })
    } catch (logError) {
      console.error('Failed to create audit log for download:', logError)
      // We don't block the download if logging fails, but we error it in production monitoring
    }

    // Get signed URL from Supabase Storage using centralized configuration
    const { data: urlData, error: urlError } = await supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .createSignedUrl(document.file_path, STORAGE_CONFIG.SIGNED_URL_EXPIRY)

    if (urlError) {
      console.error('Error creating signed URL:', urlError)
      return NextResponse.json(
        { error: `Failed to generate download URL: ${urlError.message}` },
        { status: 500 }
      )
    }

    if (!urlData || !urlData.signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate download URL: No URL returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({ signedUrl: urlData.signedUrl })
  } catch (error: unknown) {
    console.error(CONSOLE_MESSAGES.ERROR_GENERATING_DOWNLOAD_URL, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

