/**
 * Forgot Password Form Schema
 * 
 * Zod schema for validating forgot password form data.
 */

import { z } from 'zod'

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>
