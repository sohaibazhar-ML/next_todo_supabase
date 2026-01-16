/**
 * Subadmins API Route
 * 
 * Handles subadmin management:
 * - GET: List all subadmins with permissions
 * - POST: Create/assign subadmin role
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/roles'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

// GET - List all subadmins with their permissions
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await requireAdmin(user.id)

    // Get all subadmins with their permissions and profile info
    const subadmins = await prisma.profiles.findMany({
      where: { role: 'subadmin' },
      include: {
        subadmin_permissions: true,
      },
      orderBy: { created_at: 'desc' },
    })

    const result = subadmins.map(subadmin => ({
      id: subadmin.id,
      username: subadmin.username,
      email: subadmin.email,
      first_name: subadmin.first_name,
      last_name: subadmin.last_name,
      role: subadmin.role,
      permissions: subadmin.subadmin_permissions || {
        can_upload_documents: false,
        can_view_stats: false,
        is_active: false,
      },
      created_at: subadmin.created_at,
      updated_at: subadmin.updated_at,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_FETCHING_SUBADMINS, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    const statusCode =
      isErrorWithMessage(error) && error.message === 'Admin access required'
        ? 403
        : 500
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

// POST - Create/assign subadmin role and set permissions
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await requireAdmin(user.id)

    const body = await request.json()
    const { userId, can_upload_documents, can_view_stats, is_active } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Verify the target user exists
    const targetUser = await prisma.profiles.findUnique({
      where: { id: userId },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent assigning subadmin to admin
    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot assign subadmin role to an admin' },
        { status: 400 }
      )
    }

    // Update user role to subadmin
    await prisma.profiles.update({
      where: { id: userId },
      data: { role: 'subadmin' },
    })

    // Create or update subadmin permissions
    const permissions = await prisma.subadmin_permissions.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        can_upload_documents: can_upload_documents ?? false,
        can_view_stats: can_view_stats ?? false,
        is_active: is_active ?? true,
      },
      update: {
        can_upload_documents: can_upload_documents ?? false,
        can_view_stats: can_view_stats ?? false,
        is_active: is_active ?? true,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Subadmin created successfully',
      permissions,
    })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_CREATING_SUBADMIN, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    const statusCode =
      isErrorWithMessage(error) && error.message === 'Admin access required'
        ? 403
        : 500
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

