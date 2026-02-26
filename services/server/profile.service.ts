/**
 * Profile Server Service
 *
 * Encapsulates all Prisma database operations for profile management.
 * API routes delegate to this service for data access.
 */

import { prisma } from '@/lib/prisma'
import type { ProfileUpdateInput } from '@/types/prisma'

// ============================================================================
// Types
// ============================================================================

export interface ProfileFilters {
    role?: string
    search?: string
    fromDate?: string
    toDate?: string
}

export interface ProfileCreateData {
    id: string
    username: string
    email: string
    first_name?: string
    last_name?: string
    phone_number?: string
    current_address?: string
    country_of_origin?: string
    new_address_switzerland?: string
    number_of_adults?: number
    number_of_children?: number
    pets_type?: string | null
    marketing_consent?: boolean
    terms_accepted?: boolean
    data_privacy_accepted?: boolean
    email_confirmed?: boolean
    email_confirmed_at?: string | null
    keep_me_logged_in?: boolean
    role?: string
}

// ============================================================================
// Service Methods
// ============================================================================

/**
 * Find a single profile by ID
 */
export async function getProfileById(userId: string) {
    return prisma.profiles.findUnique({
        where: { id: userId },
    })
}

/**
 * Find a profile by username
 */
export async function getProfileByUsername(username: string) {
    return prisma.profiles.findUnique({
        where: { username },
    })
}

/**
 * Get all profiles with optional filters (admin only)
 */
export async function getProfiles(filters: ProfileFilters) {
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
    if (filters.role && filters.role !== 'all') {
        where.role = filters.role
    }

    // Date range filter
    if (filters.fromDate || filters.toDate) {
        where.created_at = {}
        if (filters.fromDate) {
            where.created_at.gte = new Date(filters.fromDate)
        }
        if (filters.toDate) {
            const toDateEnd = new Date(filters.toDate)
            toDateEnd.setHours(23, 59, 59, 999)
            where.created_at.lte = toDateEnd
        }
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim()
        where.OR = [
            { username: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { first_name: { contains: searchTerm, mode: 'insensitive' } },
            { last_name: { contains: searchTerm, mode: 'insensitive' } },
        ]
    }

    return prisma.profiles.findMany({
        where,
        orderBy: { created_at: 'desc' },
    })
}

/**
 * Create a new profile
 * Returns a serialized profile with Date objects converted to ISO strings
 */
export async function createProfile(data: ProfileCreateData) {
    const profile = await prisma.profiles.create({
        data: {
            id: data.id,
            username: data.username,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email,
            phone_number: data.phone_number || '',
            current_address: data.current_address || '',
            country_of_origin: data.country_of_origin || '',
            new_address_switzerland: data.new_address_switzerland || '',
            number_of_adults: data.number_of_adults || 1,
            number_of_children: data.number_of_children || 0,
            pets_type: data.pets_type || null,
            marketing_consent: data.marketing_consent || false,
            terms_accepted: data.terms_accepted || false,
            data_privacy_accepted: data.data_privacy_accepted || false,
            email_confirmed: data.email_confirmed ?? false,
            email_confirmed_at: data.email_confirmed_at
                ? new Date(data.email_confirmed_at)
                : null,
            keep_me_logged_in: data.keep_me_logged_in ?? true,
            role: data.role || 'user',
        },
    })

    // Convert Date objects to ISO strings for JSON serialization
    return {
        ...profile,
        email_confirmed_at: profile.email_confirmed_at?.toISOString() || null,
        created_at: profile.created_at.toISOString(),
        updated_at: profile.updated_at.toISOString(),
    }
}

/**
 * Update an existing profile
 */
export async function updateProfile(
    profileId: string,
    data: ProfileUpdateInput
) {
    return prisma.profiles.update({
        where: { id: profileId },
        data,
    })
}
