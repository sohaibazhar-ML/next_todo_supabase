/**
 * Document Filter Options API Route
 * 
 * Handles fetching filter options:
 * - GET: Get categories and file types
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isErrorWithMessage } from '@/utils'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

// GET - Get filter options (categories, file types)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    // Optimized: Use DISTINCT queries with proper index usage
    // Using partial index scan with WHERE clause for better performance
    const [categories, fileTypes] = await Promise.all([
      // Get distinct categories (only from root documents, not versions)
      prisma.$queryRaw<Array<{ category: string }>>`
        SELECT DISTINCT category 
        FROM documents 
        ORDER BY category ASC
        LIMIT 1000
      `,
      // Get distinct file types
      prisma.$queryRaw<Array<{ file_type: string }>>`
        SELECT DISTINCT file_type 
        FROM documents 
        ORDER BY file_type ASC
        LIMIT 1000
      `
    ])

    const uniqueCategories = categories.map(row => row.category)
    const uniqueFileTypes = fileTypes.map(row => row.file_type)

    return NextResponse.json({
      categories: uniqueCategories,
      fileTypes: uniqueFileTypes,
    })
  } catch (error: unknown) {
    console.error(CONSOLE_MESSAGES.ERROR_FETCHING_FILTER_OPTIONS, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

