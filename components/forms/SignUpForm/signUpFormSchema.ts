/**
 * Sign-Up Form Schema
 * 
 * Zod schema for validating sign-up form data.
 * Used with react-hook-form and @hookform/resolvers/zod.
 */

import { z } from 'zod'
import { DEFAULT_VALUES } from '@/constants'

/**
 * Zod schema for sign-up form
 * Matches SignUpFormData type from @/types/user
 */
export const signUpFormSchema = z.object({
  // Personal Information
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .max(50, 'Phone number must be less than 50 characters'),
  
  // Password
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  
  // Address Information
  currentAddress: z
    .string()
    .min(1, 'Current address is required')
    .max(500, 'Current address must be less than 500 characters'),
  
  countryOfOrigin: z
    .string()
    .min(1, 'Country of origin is required')
    .max(100, 'Country must be less than 100 characters'),
  
  newAddressSwitzerland: z
    .string()
    .min(1, 'New address in Switzerland is required')
    .max(500, 'Address must be less than 500 characters'),
  
  // Family Information
  numberOfAdults: z
    .number()
    .int('Number of adults must be a whole number')
    .min(1, 'Number of adults must be at least 1')
    .default(DEFAULT_VALUES.NUMBER_OF_ADULTS),
  
  numberOfChildren: z
    .number()
    .int('Number of children must be a whole number')
    .min(0, 'Number of children cannot be negative')
    .default(DEFAULT_VALUES.NUMBER_OF_CHILDREN),
  
  petsType: z
    .string()
    .max(100, 'Pets type must be less than 100 characters')
    .default('')
    .optional(),
  
  // Consents
  marketingConsent: z
    .boolean()
    .default(false),
  
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
  
  dataPrivacyAccepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the privacy policy'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

/**
 * TypeScript type inferred from schema
 */
export type SignUpFormData = z.infer<typeof signUpFormSchema>

