/**
 * Document Edit Form Schema
 * 
 * Zod schema for validating document edit form data.
 * Used with react-hook-form and @hookform/resolvers/zod.
 */

import { z } from 'zod'

/**
 * Zod schema for document edit form
 * Note: File upload is not included as document editing only updates metadata
 */
export const documentEditSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  
  category: z
    .string()
    .min(1, 'Category is required'),
  
  tags: z
    .array(z.string().min(1))
    .default([])
    .optional(),
  
  is_featured: z
    .boolean()
    .default(false)
    .optional(),
})

/**
 * TypeScript type inferred from schema
 */
export type DocumentEditFormData = z.infer<typeof documentEditSchema>

