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

    const documents = await prisma.documents.findMany({
      select: {
        category: true,
        file_type: true,
        tags: true
      }
    })

    const uniqueCategories = Array.from(new Set(documents.map(doc => doc.category))).sort()
    const uniqueFileTypes = Array.from(new Set(documents.map(doc => doc.file_type))).sort()
    
    // Extract all unique tags
    const allTags = new Set<string>()
    documents.forEach(doc => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach(tag => allTags.add(tag))
      }
    })
    const uniqueTags = Array.from(allTags).sort()

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

