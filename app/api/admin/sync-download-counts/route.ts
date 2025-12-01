import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/utils/roles'

// POST - Sync download_count field with actual download_logs counts
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all documents
    const documents = await prisma.documents.findMany({
      select: { id: true },
    })

    let syncedCount = 0
    let errors: string[] = []

    // Update each document's download_count based on actual download_logs
    for (const doc of documents) {
      try {
        const actualCount = await prisma.download_logs.count({
          where: { document_id: doc.id },
        })

        await prisma.documents.update({
          where: { id: doc.id },
          data: { download_count: actualCount },
        })

        syncedCount++
      } catch (error: any) {
        errors.push(`Failed to sync document ${doc.id}: ${error.message}`)
        console.error(`Error syncing document ${doc.id}:`, error)
      }
    }

    return NextResponse.json({
      message: `Synced download counts for ${syncedCount} documents`,
      synced: syncedCount,
      total: documents.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error syncing download counts:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

