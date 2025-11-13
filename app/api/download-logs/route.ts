import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/utils/roles'

// GET - Get download logs
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const userId = searchParams.get('userId')

    const admin = await isAdmin(user.id)

    // Build where clause
    const where: any = {}
    if (documentId) where.document_id = documentId
    if (userId) where.user_id = userId
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
        }
      }
    })

    return NextResponse.json(logs)
  } catch (error: any) {
    console.error('Error fetching download logs:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create download log
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Users can only log their own downloads
    if (body.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const log = await prisma.download_logs.create({
      data: {
        document_id: body.document_id,
        user_id: body.user_id,
        ip_address: body.ip_address || null,
        user_agent: body.user_agent || null,
        context: body.context || null,
        metadata: body.metadata || null,
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error: any) {
    console.error('Error creating download log:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

