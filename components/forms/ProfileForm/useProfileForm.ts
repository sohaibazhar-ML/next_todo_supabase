/**
 * Profile Form Hook
 * 
 * Custom hook for managing profile form state and submission.
 * Uses react-hook-form with Zod validation.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  createProfileSchema,
  editProfileSchema,
  type CreateProfileFormData,
  type EditProfileFormData,
  type PasswordChangeFormData,
  passwordChangeSchema,
} from './profileFormSchema'
import { updateProfile, checkUsernameAvailability } from '@/services/api/profiles'
import { userKeys } from '@/hooks/api/useUsers'
import { DEFAULT_VALUES } from '@/constants'
import type { UserProfile } from '@/types'

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
    mutationFn: async (data: CreateProfileFormData | EditProfileFormData) => {
      if (isCreating) {
        // For creation, we need to create via API
        // Note: Profile creation is typically handled server-side during signup
        // This mutation is for the profile completion flow
        const createData = data as CreateProfileFormData
        
        // Check username availability
        const isAvailable = await checkUsernameAvailability(createData.username)
        if (!isAvailable) {
          throw new Error('Username already exists')
        }

        // Create profile via API
        const response = await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userId,
            username: createData.username,
            first_name: createData.first_name,
            last_name: createData.last_name,
            email: createData.email,
            phone_number: createData.phone_number,
            current_address: createData.current_address,
            country_of_origin: createData.country_of_origin,
            new_address_switzerland: createData.new_address_switzerland,
            number_of_adults: createData.number_of_adults,
            number_of_children: createData.number_of_children,
            pets_type: createData.pets_type || null,
            marketing_consent: createData.marketing_consent,
            terms_accepted: createData.terms_accepted,
            data_privacy_accepted: createData.data_privacy_accepted,
            email_confirmed: true,
            email_confirmed_at: new Date().toISOString(),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create profile')
        }

        const createdProfile = await response.json()
        // Normalize the response to match UserProfile type
        return {
          ...createdProfile,
          created_at: createdProfile.created_at || new Date().toISOString(),
          updated_at: createdProfile.updated_at || new Date().toISOString(),
        }
      } else {
        // For updates, use the service
        return updateProfile(userId, {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          current_address: data.current_address,
          country_of_origin: data.country_of_origin,
          new_address_switzerland: data.new_address_switzerland,
          number_of_adults: data.number_of_adults,
          number_of_children: data.number_of_children,
          pets_type: data.pets_type || null,
          marketing_consent: data.marketing_consent,
          terms_accepted: data.terms_accepted,
          data_privacy_accepted: data.data_privacy_accepted,
        })
      }
    },
    onSuccess: () => {
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      
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
    mutationFn: async (data: PasswordChangeFormData) => {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (error) {
        throw new Error(error.message || 'Failed to update password')
      }
    },
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

