/**
 * useSocialAuth Hook
 * 
 * Centralized hook for social authentication (Google OAuth).
 * Eliminates code duplication between LoginForm and SignUpForm.
 * 
 * @example
 * ```tsx
 * const { handleGoogleAuth, isLoading, error } = useSocialAuth()
 * 
 * <button onClick={handleGoogleAuth} disabled={isLoading}>
 *   {isLoading ? 'Loading...' : 'Sign in with Google'}
 * </button>
 * ```
 */

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UseSocialAuthOptions {
    /**
     * Custom redirect URL after authentication
     * @default `${window.location.origin}/auth/callback`
     */
    redirectTo?: string

    /**
     * Callback function called on successful authentication
     */
    onSuccess?: () => void

    /**
     * Callback function called on error
     */
    onError?: (error: string) => void
}

export interface UseSocialAuthReturn {
    /**
     * Handler for Google OAuth authentication
     */
    handleGoogleAuth: () => Promise<void>

    /**
     * Loading state - indicates which provider is currently authenticating
     */
    isLoading: string | null

    /**
     * Error message if authentication fails
     */
    error: string | null

    /**
     * Clear the error message
     */
    clearError: () => void
}

/**
 * Hook for handling social authentication
 */
export function useSocialAuth(options: UseSocialAuthOptions = {}): UseSocialAuthReturn {
    const {
        redirectTo = typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : '/auth/callback',
        onSuccess,
        onError,
    } = options

    const supabase = createClient()
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    const handleGoogleAuth = useCallback(async () => {
        setIsLoading('google')
        setError(null)

        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                },
            })

            if (authError) {
                const errorMessage = authError.message
                setError(errorMessage)
                setIsLoading(null)
                onError?.(errorMessage)
                return
            }

            // Success - OAuth will redirect, so we don't reset loading state
            onSuccess?.()
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to authenticate with Google'

            setError(errorMessage)
            setIsLoading(null)
            onError?.(errorMessage)
        }
    }, [supabase, redirectTo, onSuccess, onError])

    return {
        handleGoogleAuth,
        isLoading,
        error,
        clearError,
    }
}
