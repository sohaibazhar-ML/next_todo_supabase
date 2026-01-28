/**
 * useFileUpload Hook
 * 
 * Centralized file upload logic with validation, progress tracking, and error handling.
 * Reusable across all file upload components.
 * 
 * @example
 * ```tsx
 * const upload = useFileUpload({
 *   maxSize: 10 * 1024 * 1024, // 10MB
 *   acceptedTypes: ['application/pdf', 'application/vnd.op   * @example
   * const { upload, isUploading } = useFileUpload({
   *   bucket: 'documents',
   *   onSuccess: (file) => console.log(CONSOLE_MESSAGES.UPLOAD_COMPLETE, file)
   * })
 * 
 * // Use in component
 * <input
 *   type="file"
 *   onChange={(e) => upload.handleFileSelect(e.target.files)}
 *   disabled={upload.isUploading}
 * />
 * {upload.progress > 0 && <Progress value={upload.progress} />}
 * ```
 */

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CONSOLE_MESSAGES } from '@/constants/console'

export interface FileUploadConfig {
    maxSize?: number // in bytes
    acceptedTypes?: string[]
    multiple?: boolean
    onSuccess?: (files: File[]) => void
    onError?: (error: Error) => void
    generatePreview?: boolean
}

export interface FileWithPreview extends File {
    preview?: string
}

export interface FileUploadState {
    files: FileWithPreview[]
    isUploading: boolean
    progress: number
    error: string | null

    // Actions
    handleFileSelect: (fileList: FileList | null) => void
    removeFile: (index: number) => void
    clearFiles: () => void
    clearError: () => void

    // Validation
    validateFile: (file: File) => { valid: boolean; error?: string }
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_ACCEPTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
]

/**
 * Hook for managing file uploads with validation and progress tracking
 */
export function useFileUpload(config: FileUploadConfig = {}): FileUploadState {
    const {
        maxSize = DEFAULT_MAX_SIZE,
        acceptedTypes = DEFAULT_ACCEPTED_TYPES,
        multiple = false,
        onSuccess,
        onError,
        generatePreview = false,
    } = config

    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    /**
     * Validate a single file
     */
    const validateFile = useCallback(
        (file: File): { valid: boolean; error?: string } => {
            // Check file size
            if (file.size > maxSize) {
                const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
                return {
                    valid: false,
                    error: `File size exceeds ${maxSizeMB}MB limit`,
                }
            }

            // Check file type
            if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
                return {
                    valid: false,
                    error: `File type ${file.type} is not accepted`,
                }
            }

            return { valid: true }
        },
        [maxSize, acceptedTypes]
    )

    /**
     * Generate preview URL for image files
     */
    const generatePreviewUrl = useCallback((file: File): Promise<string | undefined> => {
        return new Promise((resolve) => {
            if (!file.type.startsWith('image/')) {
                resolve(undefined)
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                resolve(reader.result as string)
            }
            reader.onerror = () => {
                resolve(undefined)
            }
            reader.readAsDataURL(file)
        })
    }, [])

    /**
     * Handle file selection
     */
    const handleFileSelect = useCallback(
        async (fileList: FileList | null) => {
            if (!fileList || fileList.length === 0) return

            setError(null)
            setProgress(0)

            const selectedFiles = Array.from(fileList)

            // Validate files
            const validationResults = selectedFiles.map((file) => ({
                file,
                validation: validateFile(file),
            }))

            const invalidFile = validationResults.find((r) => !r.validation.valid)
            if (invalidFile) {
                const errorMsg = invalidFile.validation.error || 'Invalid file'
                setError(errorMsg)
                onError?.(new Error(errorMsg))
                return
            }

            // Check multiple files
            if (!multiple && selectedFiles.length > 1) {
                const errorMsg = 'Only one file is allowed'
                setError(errorMsg)
                onError?.(new Error(errorMsg))
                return
            }

            try {
                setIsUploading(true)

                // Generate previews if needed
                const filesWithPreviews: FileWithPreview[] = await Promise.all(
                    selectedFiles.map(async (file) => {
                        const fileWithPreview = file as FileWithPreview
                        if (generatePreview) {
                            fileWithPreview.preview = await generatePreviewUrl(file)
                        }
                        return fileWithPreview
                    })
                )

                setFiles(multiple ? [...files, ...filesWithPreviews] : filesWithPreviews)
                setProgress(100)
                onSuccess?.(filesWithPreviews)
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Failed to process files'
                setError(errorMsg)
                onError?.(err instanceof Error ? err : new Error(errorMsg))
            } finally {
                setIsUploading(false)
            }
        },
        [files, multiple, validateFile, generatePreview, generatePreviewUrl, onSuccess, onError]
    )

    /**
     * Remove a file by index
     */
    const removeFile = useCallback((index: number) => {
        setFiles((current) => {
            const newFiles = [...current]
            // Revoke preview URL if it exists
            if (newFiles[index].preview) {
                URL.revokeObjectURL(newFiles[index].preview!)
            }
            newFiles.splice(index, 1)
            return newFiles
        })
        setProgress(0)
    }, [])

    /**
     * Clear all files
     */
    const clearFiles = useCallback(() => {
        // Revoke all preview URLs
        files.forEach((file) => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview)
            }
        })
        setFiles([])
        setProgress(0)
        setError(null)
    }, [files])

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        files,
        isUploading,
        progress,
        error,
        handleFileSelect,
        removeFile,
        clearFiles,
        clearError,
        validateFile,
    }
}
