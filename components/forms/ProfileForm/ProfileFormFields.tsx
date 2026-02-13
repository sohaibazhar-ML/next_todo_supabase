/**
 * Profile Form Fields
 * 
 * Reusable form fields component for profile form.
 * Uses react-hook-form for form state management.
 */

import React from 'react'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import type { CreateProfileFormData, EditProfileFormData } from './profileFormSchema'
import { Input, Textarea, Select, Checkbox, Button } from '@/components/ui'

export interface ProfileFormFieldsProps {
  /**
   * React Hook Form instance
   */
  form: UseFormReturn<CreateProfileFormData | EditProfileFormData>
  
  /**
   * Whether form is in loading state
   */
  isLoading?: boolean
  
  /**
   * Whether this is creating a new profile
   */
  isCreating: boolean
  
  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void
}

export default function ProfileFormFields({
  form,
  isLoading = false,
  isCreating,
  onCancel,
}: ProfileFormFieldsProps) {
  const t = useTranslations('profileForm')
  
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('personalInfo')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Username (only for creation) */}
          {isCreating ? (
            <Input
              {...register('username')}
              label={t('username')}
              placeholder={t('chooseUsername')}
              error={errors.username?.message}
              helperText={t('usernameMinLength')}
              required
              disabled={isLoading}
            />
          ) : (
            <Input
              value={form.watch('username') || ''}
              label={t('username')}
              disabled
              helperText={t('usernameCannotChange')}
            />
          )}

          {/* Email */}
          <Input
            {...register('email')}
            type="email"
            label={t('email')}
            placeholder={t('emailPlaceholder')}
            error={errors.email?.message}
            required
            disabled={isLoading}
          />

          {/* First Name */}
          <Input
            {...register('first_name')}
            label={t('firstName')}
            placeholder={t('firstNamePlaceholder')}
            error={errors.first_name?.message}
            required
            disabled={isLoading}
          />

          {/* Last Name */}
          <Input
            {...register('last_name')}
            label={t('lastName')}
            placeholder={t('lastNamePlaceholder')}
            error={errors.last_name?.message}
            required
            disabled={isLoading}
          />

          {/* Phone Number */}
          <div className="md:col-span-2">
            <Input
              {...register('phone_number')}
              type="tel"
              label={t('phoneNumber')}
              placeholder={t('phoneNumberPlaceholder')}
              error={errors.phone_number?.message}
              required
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('addressInfo')}
        </h3>
        
        <div className="space-y-4">
          {/* Current Address */}
          <Textarea
            {...register('current_address')}
            label={t('currentAddress')}
            placeholder={t('currentAddressPlaceholder')}
            error={errors.current_address?.message}
            rows={3}
            required
            disabled={isLoading}
          />

          {/* Country of Origin */}
          <Input
            {...register('country_of_origin')}
            label={t('countryOfOrigin')}
            placeholder={t('countryOfOriginPlaceholder')}
            error={errors.country_of_origin?.message}
            required
            disabled={isLoading}
          />

          {/* New Address in Switzerland */}
          <Textarea
            {...register('new_address_switzerland')}
            label={t('newAddressSwitzerland')}
            placeholder={t('newAddressSwitzerlandPlaceholder')}
            error={errors.new_address_switzerland?.message}
            rows={3}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Family Information Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('familyInfo')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Number of Adults */}
          <Input
            {...register('number_of_adults', { valueAsNumber: true })}
            type="number"
            label={t('numberOfAdults')}
            placeholder="1"
            error={errors.number_of_adults?.message}
            required
            min={1}
            disabled={isLoading}
          />

          {/* Number of Children */}
          <Input
            {...register('number_of_children', { valueAsNumber: true })}
            type="number"
            label={t('numberOfChildren')}
            placeholder="0"
            error={errors.number_of_children?.message}
            required
            min={0}
            disabled={isLoading}
          />

          {/* Pets Type */}
          <div className="md:col-span-2">
            <Input
              {...register('pets_type')}
              label={t('petsType')}
              placeholder={t('petsTypePlaceholder')}
              error={errors.pets_type?.message}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Consents Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('consents')}
        </h3>
        
        <div className="space-y-3">
          {/* Marketing Consent */}
          <Checkbox
            {...register('marketing_consent')}
            label={t('marketingConsent')}
            disabled={isLoading}
          />

          {/* Terms Accepted */}
          <Checkbox
            {...register('terms_accepted')}
            label={t('termsAccepted')}
            error={errors.terms_accepted?.message}
            required
            disabled={isLoading}
          />

          {/* Data Privacy Accepted */}
          <Checkbox
            {...register('data_privacy_accepted')}
            label={t('dataPrivacyAccepted')}
            error={errors.data_privacy_accepted?.message}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading
            ? t('saving')
            : isCreating
            ? t('createProfile')
            : t('save')}
        </Button>
      </div>
    </div>
  )
}

