/**
 * Profile Form Schema
 * 
 * Zod schema for validating profile form data.
 * Used with react-hook-form and @hookform/resolvers/zod.
 */

import { z } from 'zod'
import { DEFAULT_VALUES } from '@/constants'

/**
 * Base profile schema (for both create and edit)
 */
const baseProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .max(50, 'Phone number must be less than 50 characters'),
  
  current_address: z
    .string()
    .min(1, 'Current address is required')
    .max(500, 'Current address must be less than 500 characters'),
  
  country_of_origin: z
    .string()
    .min(1, 'Country of origin is required')
    .max(100, 'Country must be less than 100 characters'),
  
  new_address_switzerland: z
    .string()
    .min(1, 'New address in Switzerland is required')
    .max(500, 'Address must be less than 500 characters'),
  
  number_of_adults: z
    .number()
    .int('Number of adults must be a whole number')
    .min(1, 'Number of adults must be at least 1')
    .default(DEFAULT_VALUES.NUMBER_OF_ADULTS),
  
  number_of_children: z
    .number()
    .int('Number of children must be a whole number')
    .min(0, 'Number of children cannot be negative')
    .default(DEFAULT_VALUES.NUMBER_OF_CHILDREN),
  
  pets_type: z
    .string()
    .max(100, 'Pets type must be less than 100 characters')
    .nullable()
    .optional(),
  
  marketing_consent: z
    .boolean()
    .default(false),
  
  terms_accepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
  
  data_privacy_accepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the privacy policy'),
})

/**
 * Schema for creating a new profile (includes username)
 */
export const createProfileSchema = baseProfileSchema.extend({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
})

/**
 * Schema for editing an existing profile (username is optional/read-only)
 */
export const editProfileSchema = baseProfileSchema.extend({
  username: z
    .string()
    .optional(), // Username cannot be changed after creation
})

/**
 * Password change schema (separate from profile)
 */
export const passwordChangeSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

/**
 * TypeScript types inferred from schemas
 */
export type CreateProfileFormData = z.infer<typeof createProfileSchema>
export type EditProfileFormData = z.infer<typeof editProfileSchema>
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

/**
 * Union type for profile form data
 */
export type ProfileFormData = CreateProfileFormData | EditProfileFormData

