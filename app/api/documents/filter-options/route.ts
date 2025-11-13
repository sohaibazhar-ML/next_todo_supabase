import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Get filter options (categories, file types, tags)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Optimized: Use DISTINCT queries with proper index usage
    // Using partial index scan with WHERE clause for better performance
    const [categories, fileTypes, tags] = await Promise.all([
      // Get distinct categories (only from root documents, not versions)
      // Uses composite index (parent_document_id, category) for fast lookup
      prisma.$queryRaw<Array<{ category: string }>>`
        SELECT DISTINCT category 
        FROM documents 
        WHERE parent_document_id IS NULL
        ORDER BY category ASC
        LIMIT 1000
      `,
      // Get distinct file types
      // Uses composite index (parent_document_id, file_type) for fast lookup
      prisma.$queryRaw<Array<{ file_type: string }>>`
        SELECT DISTINCT file_type 
        FROM documents 
        WHERE parent_document_id IS NULL
        ORDER BY file_type ASC
        LIMIT 1000
      `,
      // Get all unique tags using GIN index for array operations
      // Using array_to_string and string_to_array for better performance with GIN index
      prisma.$queryRaw<Array<{ tag: string }>>`
        SELECT DISTINCT tag
        FROM (
          SELECT unnest(tags) as tag
          FROM documents
          WHERE parent_document_id IS NULL 
            AND tags IS NOT NULL 
            AND tags != '{}'
        ) AS tag_list
        WHERE tag IS NOT NULL AND tag != ''
        ORDER BY tag ASC
        LIMIT 1000
      `
    ])

    const uniqueCategories = categories.map(row => row.category)
    const uniqueFileTypes = fileTypes.map(row => row.file_type)
    const uniqueTags = tags.map(row => row.tag).filter(Boolean)

    return NextResponse.json({
      categories: uniqueCategories,
      fileTypes: uniqueFileTypes,
      tags: uniqueTags
    })
  } catch (error: any) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

