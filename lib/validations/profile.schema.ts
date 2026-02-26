/**
 * Profile Zod Validation Schemas
 *
 * Validates API inputs for profile operations.
 * Used in API routes to ensure type-safe request handling.
 */

import { z } from 'zod'

// ============================================================================
// Shared field schemas
// ============================================================================

const uuidSchema = z
    .string()
    .regex(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        'Invalid UUID format'
    )

const roleSchema = z.enum(['user', 'admin', 'subadmin']).default('user')

// ============================================================================
// Profile Create Schema (POST /api/profiles)
// ============================================================================

export const profileCreateSchema = z.object({
    id: uuidSchema,
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email format'),
    first_name: z.string().optional().default(''),
    last_name: z.string().optional().default(''),
    phone_number: z.string().optional().default(''),
    current_address: z.string().optional().default(''),
    country_of_origin: z.string().optional().default(''),
    new_address_switzerland: z.string().optional().default(''),
    number_of_adults: z.number().int().min(0).optional().default(1),
    number_of_children: z.number().int().min(0).optional().default(0),
    pets_type: z.string().nullable().optional().default(null),
    marketing_consent: z.boolean().optional().default(false),
    terms_accepted: z.boolean().optional().default(false),
    data_privacy_accepted: z.boolean().optional().default(false),
    email_confirmed: z.boolean().optional().default(false),
    email_confirmed_at: z.string().nullable().optional().default(null),
    keep_me_logged_in: z.boolean().optional().default(true),
    role: roleSchema.optional().default('user'),
})

export type ProfileCreateInput = z.infer<typeof profileCreateSchema>

// ============================================================================
// Profile Update Schema (PUT /api/profiles)
// ============================================================================

export const profileUpdateSchema = z.object({
    id: uuidSchema.optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone_number: z.string().optional(),
    current_address: z.string().optional(),
    country_of_origin: z.string().optional(),
    new_address_switzerland: z.string().optional(),
    number_of_adults: z.number().int().min(0).optional(),
    number_of_children: z.number().int().min(0).optional(),
    pets_type: z.string().nullable().optional(),
    marketing_consent: z.boolean().optional(),
    keep_me_logged_in: z.boolean().optional(),
    role: z.string().optional(),
})

export type ProfileUpdatePayload = z.infer<typeof profileUpdateSchema>

// ============================================================================
// Profile Query Schema (GET /api/profiles)
// ============================================================================

export const profileQuerySchema = z.object({
    userId: uuidSchema.optional(),
    role: z.string().optional(),
    search: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
})

export type ProfileQueryParams = z.infer<typeof profileQuerySchema>
