import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { ERROR_MESSAGES } from '@/constants'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    // Get distinct categories from documents that have been downloaded
    const categories = await prisma.$queryRaw<Array<{ category: string }>>`
      SELECT DISTINCT d.category 
      FROM download_logs dl
      JOIN documents d ON dl.document_id = d.id
      WHERE d.category IS NOT NULL AND d.category != ''
      ORDER BY d.category ASC
    `

    const uniqueCategories = categories.map(row => row.category)

    return NextResponse.json({
      categories: uniqueCategories,
    })
  } catch (error) {
    console.error('[Admin DownloadLogs Filter API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
