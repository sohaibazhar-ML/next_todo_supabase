/**
 * Subadmin Form Schema
 * 
 * Zod schema for validating subadmin form data.
 * Used with react-hook-form and @hookform/resolvers/zod.
 */

import { z } from 'zod'

/**
 * Schema for creating a new subadmin
 */
export const createSubadminSchema = z.object({
  userId: z
    .string()
    .min(1, 'User selection is required'),
  
  can_upload_documents: z
    .boolean()
    .default(false),
  
  can_view_stats: z
    .boolean()
    .default(false),
  
  is_active: z
    .boolean()
    .default(true),
})

/**
 * Schema for updating subadmin permissions
 */
export const updateSubadminSchema = z.object({
  can_upload_documents: z
    .boolean()
    .default(false),
  
  can_view_stats: z
    .boolean()
    .default(false),
  
  is_active: z
    .boolean()
    .default(true),
})

/**
 * TypeScript types inferred from schemas
 */
export type CreateSubadminFormData = z.infer<typeof createSubadminSchema>
export type UpdateSubadminFormData = z.infer<typeof updateSubadminSchema>

