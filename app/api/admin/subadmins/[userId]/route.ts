/**
 * Subadmin by User ID API Route
 * 
 * Handles subadmin operations by user ID:
 * - GET: Get specific subadmin's permissions
 * - PATCH: Update subadmin permissions
 * - DELETE: Remove subadmin role
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Use Prisma types for updates
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/roles'
import type { SubadminPermissionUpdateInput } from '@/types/prisma'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

// GET - Get specific subadmin's permissions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
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
      return NextResponse.json({ error: ERROR_MESSAGES.USER_NOT_FOUND }, { status: 404 })
    }

    if (profile.role !== 'subadmin') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.USER_NOT_SUBADMIN },
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
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_FETCHING_SUBADMIN, error)
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

// PATCH - Update subadmin permissions or activate/deactivate
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
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
      return NextResponse.json({ error: ERROR_MESSAGES.USER_NOT_FOUND }, { status: 404 })
    }

    if (profile.role !== 'subadmin') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.USER_NOT_SUBADMIN },
        { status: 400 }
      )
    }

    // Update permissions with proper typing
    const updateData: SubadminPermissionUpdateInput = {
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

    // Fetch the updated profile to return full subadmin object
    const updatedProfile = await prisma.profiles.findUnique({
      where: { id: userId },
      include: {
        subadmin_permissions: true,
      },
    })

    if (!updatedProfile) {
      return NextResponse.json({ error: ERROR_MESSAGES.USER_NOT_FOUND }, { status: 404 })
    }

    return NextResponse.json({
      id: updatedProfile.id,
      username: updatedProfile.username,
      email: updatedProfile.email,
      first_name: updatedProfile.first_name,
      last_name: updatedProfile.last_name,
      role: updatedProfile.role,
      permissions: updatedProfile.subadmin_permissions || {
        can_upload_documents: false,
        can_view_stats: false,
        is_active: false,
      },
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.updated_at,
    })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_UPDATING_SUBADMIN, error)
    // Handle Prisma not found error
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.SUBADMIN_PERMISSIONS_NOT_FOUND },
        { status: 404 }
      )
    }
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

// DELETE - Remove subadmin role (convert back to user)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    await requireAdmin(user.id)

    const { userId } = await params

    // Verify user is a subadmin
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
    })

    if (!profile) {
      return NextResponse.json({ error: ERROR_MESSAGES.USER_NOT_FOUND }, { status: 404 })
    }

    if (profile.role !== 'subadmin') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.USER_NOT_SUBADMIN },
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
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_REMOVING_SUBADMIN, error)
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

