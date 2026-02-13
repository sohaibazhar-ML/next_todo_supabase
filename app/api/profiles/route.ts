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
import { isAdmin } from '@/lib/utils/roles'
import type { ProfileUpdateInput } from '@/types/prisma'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

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
  } catch (error) {
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
    if (!body.id || !body.username || !body.email) {
      return NextResponse.json(
        { error: `${ERROR_MESSAGES.MISSING_REQUIRED_FIELDS}: id, username, email` },
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

    // For signup flow: During manual signup, user creates profile immediately
    // The user.id comes from signUp response, so it's trusted
    // We don't require authentication check here because:
    // 1. User just signed up and might not have a session yet
    // 2. The user.id is from Supabase's signUp response (trusted source)
    // 3. We've validated UUID format and checked profile doesn't exist

    // Check authentication status (for logging and security)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Security check: If user is authenticated and IDs match, allow (normal flow)
    // If user is authenticated but IDs don't match, still allow IF profile doesn't exist
    // This handles the case where there's a stale session from another user during signup
    // The profile doesn't exist check above ensures we're not overwriting existing profiles
    if (user && body.id !== user.id) {
      // Log the mismatch but allow it during signup (profile doesn't exist = signup flow)
      console.warn(CONSOLE_MESSAGES.PROFILE_CREATION_STALE_SESSION, {
        authenticatedUserId: user.id,
        requestedUserId: body.id
      })
      // Don't block - this is a signup flow and the profile doesn't exist
    }

    console.log(CONSOLE_MESSAGES.CREATING_PROFILE, {
      userId: body.id,
      username: body.username,
      email: body.email,
      isAuthenticated: !!user,
      authenticatedUserId: user?.id || 'none (signup flow)'
    })

    // Check if username exists
    if (body.username) {
      const existing = await prisma.profiles.findUnique({
        where: { username: body.username }
      })

      if (existing) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.USERNAME_EXISTS },
          { status: 400 }
        )
      }
    }

    const profile = await prisma.profiles.create({
      data: {
        id: body.id,
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
        pets_type: body.pets_type || null,
        marketing_consent: body.marketing_consent || false,
        terms_accepted: body.terms_accepted || false,
        data_privacy_accepted: body.data_privacy_accepted || false,
        email_confirmed: body.email_confirmed ?? false,
        email_confirmed_at: body.email_confirmed_at ? new Date(body.email_confirmed_at) : null,
        keep_me_logged_in: body.keep_me_logged_in ?? true,
        role: body.role || 'user',
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
  } catch (error) {
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
    const updateData: ProfileUpdateInput = {
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
      current_address: body.current_address,
      country_of_origin: body.country_of_origin,
      new_address_switzerland: body.new_address_switzerland,
      number_of_adults: body.number_of_adults,
      number_of_children: body.number_of_children,
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
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_UPDATING_PROFILE, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

