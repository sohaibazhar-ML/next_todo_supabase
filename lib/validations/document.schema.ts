/**
 * Document Zod Validation Schemas
 *
 * Validates API inputs for document operations.
 * Used in API routes to ensure type-safe request handling.
 */

import { z } from 'zod'

// ============================================================================
// Document Create Schema (POST /api/documents)
// ============================================================================

export const documentCreateSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().nullable().optional().default(null),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).optional().default([]),
    file_name: z.string().min(1, 'File name is required'),
    file_path: z.string().min(1, 'File path is required'),
    file_size: z.number().int().positive('File size must be positive'),
    file_type: z.string().min(1, 'File type is required'),
    mime_type: z.string().min(1, 'MIME type is required'),
    version: z.string().optional().default('1.0'),
    parent_document_id: z.string().uuid().nullable().optional().default(null),
    is_active: z.boolean().optional().default(true),
    is_featured: z.boolean().optional().default(false),
    searchable_content: z.string().nullable().optional().default(null),
})

export type DocumentCreatePayload = z.infer<typeof documentCreateSchema>

// ============================================================================
// Document Query Schema (GET /api/documents)
// ============================================================================

export const documentQuerySchema = z.object({
    category: z.string().nullable().optional(),
    fileType: z.string().nullable().optional(),
    featuredOnly: z.enum(['true', 'false']).optional(),
    searchQuery: z.string().nullable().optional(),
    tags: z.string().nullable().optional(), // comma-separated
    fromDate: z.string().nullable().optional(),
    toDate: z.string().nullable().optional(),
    sort: z
        .enum([
            'created_at_desc',
            'created_at_asc',
            'title_asc',
            'title_desc',
            'download_count_asc',
            'download_count_desc',
        ])
        .optional()
        .default('created_at_desc'),
})

export type DocumentQueryParams = z.infer<typeof documentQuerySchema>
