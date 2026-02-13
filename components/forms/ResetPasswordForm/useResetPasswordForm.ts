/**
 * Reset Password Form Hook
 * 
 * Custom hook for handling reset password form logic.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordFormSchema, type ResetPasswordFormData } from './resetPasswordFormSchema'
import { DEFAULT_VALUES } from '@/constants/defaults'

export interface UseResetPasswordFormOptions {
  onSuccess?: () => void
}

export function useResetPasswordForm({ onSuccess }: UseResetPasswordFormOptions = {}) {
  const t = useTranslations()
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  // Check if user has a valid session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/forgot-password')
      }
    })
  }, [router, supabase.auth])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: data.password })

      if (updateError) {
        setError(updateError.message)
        setIsLoading(false)
        return
      }

      setMessage(t('resetPassword.passwordReset') || 'Password reset successfully')
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/login')
        }
      }, DEFAULT_VALUES.TIMEOUTS.REDIRECT)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred'
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
    message,
  }
}
