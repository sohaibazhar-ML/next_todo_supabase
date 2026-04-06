/**
 * Profiles API Route
 * 
 * Handles profile CRUD operations:
 * - GET: Fetch profile(s)
 * - POST: Create profile
 * - PUT: Update profile
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Use Prisma types for filters and updates
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/website/utils/roles'
import type { Prisma } from '@prisma/client'
import { isErrorWithMessage } from '@/website/utils'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/website/constants'

// GET - Get profile(s)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    // If userId is provided, get specific profile
    if (userId) {
      const admin = await isAdmin(user.id)

      // Users can only view their own profile unless they're admin
      if (!admin && user.id !== userId) {
        return NextResponse.json({ error: ERROR_MESSAGES.FORBIDDEN }, { status: 403 })
      }

      const profile = await prisma.profiles.findUnique({
        where: { id: userId }
      })

      if (!profile) {
        return NextResponse.json({ error: ERROR_MESSAGES.PROFILE_NOT_FOUND }, { status: 404 })
      }

      return NextResponse.json(profile)
    }

    // Admin-only: Get all profiles with filters (role, search, date range)
    const admin = await isAdmin(user.id)
    if (!admin) {
      // Non-admin: get current user's profile only
      const profile = await prisma.profiles.findUnique({
        where: { id: user.id }
      })
      return NextResponse.json(profile)
    }

    // Build where clause for filtering
    const where: {
      role?: string
      created_at?: {
        gte?: Date
        lte?: Date
      }
      OR?: Array<{
        username?: { contains: string; mode: 'insensitive' }
        email?: { contains: string; mode: 'insensitive' }
        first_name?: { contains: string; mode: 'insensitive' }
        last_name?: { contains: string; mode: 'insensitive' }
      }>
    } = {}

    // Role filter
    if (role && role !== 'all') {
      where.role = role
    }

    // Date range filter
    if (fromDate || toDate) {
      where.created_at = {}
      if (fromDate) {
        where.created_at.gte = new Date(fromDate)
      }
      if (toDate) {
        const toDateEnd = new Date(toDate)
        toDateEnd.setHours(23, 59, 59, 999)
        where.created_at.lte = toDateEnd
      }
    }

    // Search filter (search across username, email, first_name, last_name)
    if (search && search.trim()) {
      const searchTerm = search.trim()
      where.OR = [
        { username: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { first_name: { contains: searchTerm, mode: 'insensitive' } },
        { last_name: { contains: searchTerm, mode: 'insensitive' } },
      ]
    }

    const profiles = await prisma.profiles.findMany({
      where,
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(profiles)
  } catch (error: unknown) {
    console.error(CONSOLE_MESSAGES.ERROR_FETCHING_PROFILE, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// POST - Create profile
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.id || !body.email) {
      return NextResponse.json(
        { error: `${ERROR_MESSAGES.MISSING_REQUIRED_FIELDS}: id, email` },
        { status: 400 }
      )
    }

    // Validate user ID format (must be valid UUID)
    if (!body.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json({ error: ERROR_MESSAGES.INVALID_USER_ID_FORMAT }, { status: 400 })
    }

    // Check if profile already exists
    const existingProfile = await prisma.profiles.findUnique({
      where: { id: body.id }
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PROFILE_ALREADY_EXISTS },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // SECURITY: Enforce authentication and ownership
    if (!user || body.id !== user.id) {
      console.warn(CONSOLE_MESSAGES.PROFILE_CREATION_STALE_SESSION, {
        authenticatedUserId: user?.id || 'none',
        requestedUserId: body.id
      })
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    console.log(CONSOLE_MESSAGES.CREATING_PROFILE, {
      userId: body.id,
      username: body.username,
      email: body.email,
      isAuthenticated: !!user,
      authenticatedUserId: user?.id || 'none (signup flow)'
    })

    // Check if username exists (only if provided)
    if (body.username) {
      const existing = await prisma.profiles.findFirst({
        where: { username: body.username }
      })

      if (existing) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.USERNAME_EXISTS },
          { status: 400 }
        )
      }
    }

    // SECURITY: Strict whitelisting of fields to prevent mass assignment (e.g., 'role')
    const profile = await prisma.profiles.create({
      data: {
        id: user.id, // Use authenticated user.id for safety
        username: body.username,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone_number: body.phone_number,
        current_address: body.current_address,
        country_of_origin: body.country_of_origin,
        new_address_switzerland: body.new_address_switzerland,
        number_of_adults: body.number_of_adults || 1,
        number_of_children: body.number_of_children || 0,
        total_persons: body.total_persons || 1,
        gender: body.gender || null,
        preferred_call_time: body.preferred_call_time || null,
        pets_type: body.pets_type || null,
        marketing_consent: body.marketing_consent || false,
        terms_accepted: body.terms_accepted || false,
        data_privacy_accepted: body.data_privacy_accepted || false,
        email_confirmed: body.email_confirmed ?? false,
        email_confirmed_at: body.email_confirmed_at ? new Date(body.email_confirmed_at) : null,
        keep_me_logged_in: body.keep_me_logged_in ?? true,
        role: 'user', // Always default to 'user' for new self-created profiles
      }
    })

    // Convert Date objects to ISO strings for JSON serialization
    const profileResponse = {
      ...profile,
      email_confirmed_at: profile.email_confirmed_at?.toISOString() || null,
      created_at: profile.created_at.toISOString(),
      updated_at: profile.updated_at.toISOString(),
    }

    console.log(CONSOLE_MESSAGES.PROFILE_CREATED, profileResponse.id)
    return NextResponse.json(profileResponse, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: unknown) {
    console.error(CONSOLE_MESSAGES.ERROR_CREATING_PROFILE, error)

    // Handle unique constraint violations (Prisma error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.USERNAME_OR_EMAIL_EXISTS },
        { status: 400 }
      )
    }

    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// PUT - Update profile
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const body = await request.json()
    const profileId = body.id || user.id

    const admin = await isAdmin(user.id)

    // Users can only update their own profile unless they're admin
    if (!admin && user.id !== profileId) {
      return NextResponse.json({ error: ERROR_MESSAGES.FORBIDDEN }, { status: 403 })
    }

    // Check if profile exists
    const existing = await prisma.profiles.findUnique({
      where: { id: profileId }
    })

    if (!existing) {
      return NextResponse.json({ error: ERROR_MESSAGES.PROFILE_NOT_FOUND }, { status: 404 })
    }

    // Prepare update data (exclude fields that shouldn't be updated)
    const updateData: Prisma.profilesUpdateInput = {
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
      current_address: body.current_address,
      country_of_origin: body.country_of_origin,
      new_address_switzerland: body.new_address_switzerland,
      number_of_adults: body.number_of_adults,
      number_of_children: body.number_of_children,
      total_persons: body.total_persons,
      gender: body.gender,
      preferred_call_time: body.preferred_call_time,
      pets_type: body.pets_type,
      marketing_consent: body.marketing_consent,
      keep_me_logged_in:
        body.keep_me_logged_in !== undefined
          ? body.keep_me_logged_in
          : existing.keep_me_logged_in,
      updated_at: new Date(),
    }

    // Only admins can update role, and prevent changing to/from subadmin via this endpoint
    // Subadmin role changes should go through /api/admin/subadmins
    if (admin && body.role !== undefined) {
      const currentRole = existing.role
      const newRole = body.role

      // Prevent changing to/from subadmin via profile update
      // Subadmin assignment must go through dedicated subadmin API
      if ((currentRole === 'subadmin' || newRole === 'subadmin') && currentRole !== newRole) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.CANNOT_CHANGE_SUBADMIN_ROLE },
          { status: 400 }
        )
      }

      updateData.role = body.role
    } else if (!admin && body.role !== undefined) {
      // Non-admins cannot change roles at all
      return NextResponse.json(
        { error: ERROR_MESSAGES.ONLY_ADMINS_CAN_CHANGE_ROLES },
        { status: 403 }
      )
    }

    const profile = await prisma.profiles.update({
      where: { id: profileId },
      data: updateData
    })

    return NextResponse.json(profile)
  } catch (error: unknown) {
    console.error(CONSOLE_MESSAGES.ERROR_UPDATING_PROFILE, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

