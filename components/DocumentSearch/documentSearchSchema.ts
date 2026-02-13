/**
 * Document Search Form Schema
 * 
 * Zod schema for validating document search form data.
 */

import { z } from 'zod'
import type { DocumentFileType } from '@/types/document'

export const documentSearchSchema = z.object({
  searchQuery: z.string().optional(),
  category: z.string().optional(),
  fileType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featuredOnly: z.boolean().optional(),
})

export type DocumentSearchFormData = z.infer<typeof documentSearchSchema>

