/**
 * Profile Form Hook
 * 
 * Custom hook for managing profile form state and submission.
 * Uses react-hook-form with Zod validation.
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  type CreateProfileFormData,
  type EditProfileFormData,
  type PasswordChangeFormData,
} from '@/website/types';
import {
  createProfileSchema,
  editProfileSchema,
  passwordChangeSchema,
} from '@/schemas/website/profile.schema';
import { 
    completeProfileSetup 
} from '@/services/website/profiles';
import { authService } from '@/services/website/auth-service';
import { QUERY_KEYS } from '@/website/constants/queryKeys';
import { DEFAULT_VALUES } from '@/website/constants';
import type { UserProfile } from '@/website/types/user';

export interface UseProfileFormOptions {
  /**
   * User ID
   */
  userId: string

  /**
   * Whether this is creating a new profile (true) or editing existing (false)
   */
  isCreating: boolean

  /**
   * Callback when profile update/create succeeds
   */
  onSuccess?: () => void

  /**
   * Initial form values (from existing profile)
   */
  defaultValues?: Partial<UserProfile>
}

export function useProfileForm({
  userId,
  isCreating,
  onSuccess,
  defaultValues,
}: UseProfileFormOptions) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Use appropriate schema based on create/edit mode
  const schema = isCreating ? createProfileSchema : editProfileSchema

  const form = useForm<CreateProfileFormData | EditProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: defaultValues?.first_name || '',
      last_name: defaultValues?.last_name || '',
      email: defaultValues?.email || '',
      phone_number: defaultValues?.phone_number || '',
      current_address: defaultValues?.current_address || '',
      country_of_origin: defaultValues?.country_of_origin || '',
      new_address_switzerland: defaultValues?.new_address_switzerland || '',
      number_of_adults: defaultValues?.number_of_adults ?? DEFAULT_VALUES.NUMBER_OF_ADULTS,
      number_of_children: defaultValues?.number_of_children ?? DEFAULT_VALUES.NUMBER_OF_CHILDREN,
      pets_type: defaultValues?.pets_type || null,
      marketing_consent: defaultValues?.marketing_consent || false,
      terms_accepted: defaultValues?.terms_accepted || false,
      data_privacy_accepted: defaultValues?.data_privacy_accepted || false,
      username: isCreating ? '' : (defaultValues?.username || ''),
    },
    mode: 'onChange',
  })

  // Profile create/update mutation
  const profileMutation = useMutation({
    mutationFn: (data: CreateProfileFormData | EditProfileFormData) => 
        completeProfileSetup(userId, data as CreateProfileFormData, isCreating),
    onSuccess: () => {
      // Invalidate user and profile queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profiles.byUserId(userId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.lists() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profiles.lists() })

      // Call success callback
      onSuccess?.()
    },
  })

  // Password change mutation
  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordChangeFormData) => 
        authService.updatePassword(supabase, data.newPassword),
    onSuccess: () => {
      passwordForm.reset()
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    profileMutation.mutate(data)
  })

  const onPasswordSubmit = passwordForm.handleSubmit((data) => {
    passwordMutation.mutate(data)
  })

  return {
    form,
    onSubmit,
    isLoading: profileMutation.isPending,
    error: profileMutation.error,
    isSuccess: profileMutation.isSuccess,

    // Password change
    passwordForm,
    onPasswordSubmit,
    isPasswordLoading: passwordMutation.isPending,
    passwordError: passwordMutation.error,
    isPasswordSuccess: passwordMutation.isSuccess,
  }
}

