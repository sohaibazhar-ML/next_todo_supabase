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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Users can only create their own profile
    if (body.id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
        email_confirmed: body.email_confirmed ?? true,
        email_confirmed_at: body.email_confirmed_at ? new Date(body.email_confirmed_at) : new Date(),
        role: body.role || 'user',
      }
    })

    return NextResponse.json(profile, { status: 201 })
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

    // Only admins can update role
    if (admin && body.role !== undefined) {
      updateData.role = body.role
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

