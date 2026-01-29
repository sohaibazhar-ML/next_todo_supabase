/**
 * Sign-Up Form Hook
 * 
 * Custom hook for managing sign-up form state and submission.
 * Uses react-hook-form with Zod validation.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { signUpFormSchema, type SignUpFormData } from './signUpFormSchema'
import { API_ENDPOINTS, CONTENT_TYPES, ERROR_MESSAGES } from '@/constants'
import { DEFAULT_VALUES } from '@/constants'

export interface UseSignUpFormOptions {
  /**
   * Callback when sign-up succeeds
   */
  onSuccess?: () => void
}

export function useSignUpForm({ onSuccess }: UseSignUpFormOptions = {}) {
  const supabase = createClient()

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      currentAddress: '',
      countryOfOrigin: '',
      newAddressSwitzerland: '',
      numberOfAdults: DEFAULT_VALUES.NUMBER_OF_ADULTS,
      numberOfChildren: DEFAULT_VALUES.NUMBER_OF_CHILDREN,
      petsType: '',
      marketingConsent: false,
      termsAccepted: false,
      dataPrivacyAccepted: false,
    },
    mode: 'onChange',
  })

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      // Sign out any existing session first
      try {
        await supabase.auth.signOut()
      } catch {
        // Ignore sign out errors
      }

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: data.username,
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      if (!authData.user) {
        throw new Error(ERROR_MESSAGES.CREATE_USER_FAILED)
      }

      // Create profile
      const profileResponse = await fetch(API_ENDPOINTS.PROFILES, {
        method: 'POST',
        headers: { 'Content-Type': CONTENT_TYPES.JSON },
        body: JSON.stringify({
          id: authData.user.id,
          username: data.username,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone_number: data.phoneNumber,
          current_address: data.currentAddress,
          country_of_origin: data.countryOfOrigin,
          new_address_switzerland: data.newAddressSwitzerland,
          number_of_adults: data.numberOfAdults,
          number_of_children: data.numberOfChildren,
          pets_type: data.petsType || null,
          marketing_consent: data.marketingConsent,
          terms_accepted: data.termsAccepted,
          data_privacy_accepted: data.dataPrivacyAccepted,
          email_confirmed: false,
          role: 'user',
        }),
      })

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({
          error: ERROR_MESSAGES.CREATE_PROFILE,
        }))
        throw new Error(errorData.error || ERROR_MESSAGES.CREATE_PROFILE)
      }

      return {
        user: authData.user,
        profile: await profileResponse.json(),
      }
    },
    onSuccess: () => {
      // Reset form
      form.reset()

      // Call success callback
      onSuccess?.()
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    signUpMutation.mutate(data)
  })

  return {
    form,
    onSubmit,
    isLoading: signUpMutation.isPending,
    error: signUpMutation.error,
    isSuccess: signUpMutation.isSuccess,
  }
}

