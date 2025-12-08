import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/roles'

// GET - Get specific subadmin's permissions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await requireAdmin(user.id)

    const { userId } = await params

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      include: {
        subadmin_permissions: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (profile.role !== 'subadmin') {
      return NextResponse.json(
        { error: 'User is not a subadmin' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      id: profile.id,
      username: profile.username,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role,
      permissions: profile.subadmin_permissions || {
        can_upload_documents: false,
        can_view_stats: false,
        is_active: false,
      },
    })
  } catch (error: any) {
    console.error('Error fetching subadmin:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    )
  }
}

// PATCH - Update subadmin permissions or activate/deactivate
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await requireAdmin(user.id)

    const { userId } = await params
    const body = await request.json()
    const { can_upload_documents, can_view_stats, is_active } = body

    // Verify user is a subadmin
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (profile.role !== 'subadmin') {
      return NextResponse.json(
        { error: 'User is not a subadmin' },
        { status: 400 }
      )
    }

    // Update permissions
    const updateData: any = {
      updated_at: new Date(),
    }

    if (can_upload_documents !== undefined) {
      updateData.can_upload_documents = can_upload_documents
    }
    if (can_view_stats !== undefined) {
      updateData.can_view_stats = can_view_stats
    }
    if (is_active !== undefined) {
      updateData.is_active = is_active
    }

    const permissions = await prisma.subadmin_permissions.update({
      where: { user_id: userId },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Subadmin permissions updated successfully',
      permissions,
    })
  } catch (error: any) {
    console.error('Error updating subadmin:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Subadmin permissions not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    )
  }
}

// DELETE - Remove subadmin role (convert back to user)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await requireAdmin(user.id)

    const { userId } = await params

    // Verify user is a subadmin
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (profile.role !== 'subadmin') {
      return NextResponse.json(
        { error: 'User is not a subadmin' },
        { status: 400 }
      )
    }

    // Delete subadmin permissions (cascade will handle it, but explicit is better)
    await prisma.subadmin_permissions.deleteMany({
      where: { user_id: userId },
    })

    // Convert back to regular user
    await prisma.profiles.update({
      where: { id: userId },
      data: { role: 'user' },
    })

    return NextResponse.json({
      message: 'Subadmin role removed successfully',
    })
  } catch (error: any) {
    console.error('Error removing subadmin:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    )
  }
}

