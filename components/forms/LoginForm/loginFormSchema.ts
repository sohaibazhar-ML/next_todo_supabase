/**
 * Login Form Schema
 * 
 * Zod schema for validating login form data.
 * Used with react-hook-form and @hookform/resolvers/zod.
 */

import { z } from 'zod'

/**
 * Zod schema for login form
 */
export const loginFormSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Email or username is required')
    .max(255, 'Email or username must be less than 255 characters'),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password must be less than 100 characters'),
  
  rememberMe: z
    .boolean()
    .default(false),
})

/**
 * TypeScript type inferred from schema
 */
export type LoginFormData = z.infer<typeof loginFormSchema>
