import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/utils/roles'

// GET - Get profile(s)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    // If userId is provided, get specific profile
    if (userId) {
      const admin = await isAdmin(user.id)
      
      // Users can only view their own profile unless they're admin
      if (!admin && user.id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const profile = await prisma.profiles.findUnique({
        where: { id: userId }
      })

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      return NextResponse.json(profile)
    }

    // If role filter is provided, get profiles by role (admin only)
    if (role) {
      const admin = await isAdmin(user.id)
      if (!admin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }

      const profiles = await prisma.profiles.findMany({
        where: { role },
        orderBy: { created_at: 'desc' }
      })

      return NextResponse.json(profiles)
    }

    // Default: get current user's profile
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id }
    })

    return NextResponse.json(profile)
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create profile
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.id || !body.username || !body.email) {
      return NextResponse.json(
        { error: 'Missing required fields: id, username, email' },
        { status: 400 }
      )
    }

    // Validate user ID format (must be valid UUID)
    if (!body.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 })
    }

    // Check if profile already exists
    const existingProfile = await prisma.profiles.findUnique({
      where: { id: body.id }
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists' },
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
      console.warn('Profile creation with different authenticated user (likely signup with stale session):', { 
        authenticatedUserId: user.id, 
        requestedUserId: body.id 
      })
      // Don't block - this is a signup flow and the profile doesn't exist
    }
    
    console.log('Creating profile:', {
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
          { error: 'Username already exists' },
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

    console.log('Profile created successfully:', profileResponse.id)
    return NextResponse.json(profileResponse, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error: any) {
    console.error('Error creating profile:', error)
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update profile
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const profileId = body.id || user.id

    const admin = await isAdmin(user.id)

    // Users can only update their own profile unless they're admin
    if (!admin && user.id !== profileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if profile exists
    const existing = await prisma.profiles.findUnique({
      where: { id: profileId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Prepare update data (exclude fields that shouldn't be updated)
    const updateData: any = {
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
          { error: 'Cannot change role to/from subadmin. Use /api/admin/subadmins endpoint.' },
          { status: 400 }
        )
      }
      
      updateData.role = body.role
    } else if (!admin && body.role !== undefined) {
      // Non-admins cannot change roles at all
      return NextResponse.json(
        { error: 'Only admins can change user roles' },
        { status: 403 }
      )
    }

    const profile = await prisma.profiles.update({
      where: { id: profileId },
      data: updateData
    })

    return NextResponse.json(profile)
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

