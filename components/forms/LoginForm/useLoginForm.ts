/**
 * Login Form Hook
 * 
 * Custom hook for handling login form logic with React Hook Form and Zod validation.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loginFormSchema, type LoginFormData } from './loginFormSchema'
import { ERROR_MESSAGES } from '@/constants'
import { fetchProfileByUserId } from '@/services/api/profiles'

export interface UseLoginFormOptions {
  /**
   * Callback when login succeeds
   */
  onSuccess?: () => void
}

export function useLoginForm({ onSuccess }: UseLoginFormOptions = {}) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if input is email or username
      const isEmail = data.emailOrUsername.includes('@')
      let loginEmail = data.emailOrUsername

      if (!isEmail) {
        // Fetch email from username
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', data.emailOrUsername)
          .single()

        if (profileError || !profile) {
          setError(ERROR_MESSAGES.INVALID_CREDENTIALS ?? 'Invalid email or username')
          setIsLoading(false)
          return
        }

        loginEmail = profile.email
      }

      // Sign in with password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: data.password,
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      // Check if profile exists
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const profile = await fetchProfileByUserId(user.id).catch(() => null)
        if (!profile) {
          router.push('/profile?setup=true')
          router.refresh()
          return
        }

        // Check user preference and set cookie for middleware
        const keepMeLoggedIn = profile.keep_me_logged_in ?? true

        // Set preference cookie that middleware can read
        document.cookie = `keep_me_logged_in=${String(keepMeLoggedIn)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
      }

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during login'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
    error,
  }
}
