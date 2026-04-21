/**
 * Website Document Download URL API Route
 * 
 * Securely handles generating signed download URLs for non-admin users.
 * Logs download activity automatically.
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isErrorWithMessage } from '@/utils'
import { CONSOLE_MESSAGES, ERROR_MESSAGES, STORAGE_BUCKETS, STORAGE_CONFIG } from '@/constants'

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

    const { id } = await params

    // Validate UUID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_DOCUMENT_ID },
        { status: 400 }
      )
    }

    // Get document to get file path
    const document = await prisma.documents.findUnique({
      where: { id },
      select: { file_path: true, id: true }
    })

    if (!document) {
      return NextResponse.json({ error: ERROR_MESSAGES.DOCUMENT_NOT_FOUND }, { status: 404 })
    }

    // AUDIT: Create download log entry
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
          context: 'Website Download URL Generation',
          metadata: { source: 'api/website/documents/[id]/download-url' }
        }
      })

      // Increment download count on the document
      await prisma.documents.update({
        where: { id: document.id },
        data: { download_count: { increment: 1 } }
      })
    } catch (logError) {
      console.error('Failed to create audit log or increment download count:', logError);
    }

    // Get signed URL from Supabase Storage
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
    console.error('Error in website download URL route:', error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
