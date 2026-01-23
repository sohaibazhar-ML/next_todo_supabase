/**
 * Document Upload Form Schema
 * 
 * Zod schema for validating document upload form data.
 * Used with react-hook-form and @hookform/resolvers/zod.
 */

import { z } from 'zod'
import { DEFAULT_VALUES, ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS } from '@/constants'

/**
 * Zod schema for document upload form
 */
export const documentUploadSchema = z.object({
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
  
  file: z
    .instanceof(File, { message: 'File is required' })
    .refine(
      (file) => file.size > 0,
      'File cannot be empty'
    )
    .refine(
      (file) => file.size <= DEFAULT_VALUES.MAX_FILE_SIZE,
      `File size must be less than ${DEFAULT_VALUES.MAX_FILE_SIZE / (1024 * 1024)}MB`
    )
    .refine(
      (file) => {
        // Check MIME type - ALLOWED_FILE_TYPES is readonly array
        const allowedTypes = ALLOWED_FILE_TYPES as readonly string[]
        if (allowedTypes.includes(file.type)) {
          return true
        }
        // Check file extension as fallback
        const fileName = file.name.toLowerCase()
        return ALLOWED_FILE_EXTENSIONS.some(ext => fileName.endsWith(ext))
      },
      'Invalid file type. Please upload PDF, DOCX, XLSX, or ZIP files only.'
    ),
  
  is_featured: z
    .boolean()
    .default(false)
    .optional(),
  
  searchable_content: z
    .string()
    .max(50000, 'Searchable content must be less than 50000 characters')
    .optional()
    .or(z.literal('')),
  
  parent_document_id: z
    .string()
    .optional()
    .nullable(),
})

/**
 * TypeScript type inferred from schema
 */
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>

