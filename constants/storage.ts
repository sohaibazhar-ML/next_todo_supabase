/**
 * Supabase Storage Configuration
 * 
 * Centralized storage bucket names and configuration.
 * All storage operations should use these constants.
 */

export const STORAGE_BUCKETS = {
    /**
     * Main documents storage bucket
     * Stores uploaded documents (PDF, DOCX, XLSX, ZIP)
     * 
     * Controlled by environment variable: NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_DOCUMENTS
     * Default: 'documents'
     */
    DOCUMENTS: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_DOCUMENTS || 'documents',
} as const

export const STORAGE_PATHS = {
    /**
     * User-uploaded documents path
     * Format: {userId}/{timestamp}_{random}.{ext}
     */
    USER_DOCUMENTS: (userId: string, filename: string) => `${userId}/${filename}`,

    /**
     * User-edited/exported documents path
     * Format: user-edits/{userId}/{filename}
     */
    USER_EXPORTS: (userId: string, filename: string) => `user-edits/${userId}/${filename}`,
} as const

export const STORAGE_CONFIG = {
    /**
     * Signed URL expiry time (in seconds)
     * Default: 1 hour
     */
    SIGNED_URL_EXPIRY: 3600,

    /**
     * File upload cache control header
     */
    CACHE_CONTROL: '3600',
} as const
