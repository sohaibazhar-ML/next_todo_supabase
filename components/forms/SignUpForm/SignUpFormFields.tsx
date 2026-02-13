/**
 * Sign-Up Form Fields
 * 
 * Reusable form fields component for sign-up form.
 * Uses react-hook-form for form state management.
 */

import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { UseFormReturn } from 'react-hook-form'
import type { SignUpFormData } from './signUpFormSchema'
import { Input, Textarea, Checkbox, Button, IconSpinner, IconGoogle } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

export interface SignUpFormFieldsProps {
  /**
   * React Hook Form instance
   */
  form: UseFormReturn<SignUpFormData>
  
  /**
   * Whether form is in loading state
   */
  isLoading?: boolean
  
  /**
   * Whether Google signup is in progress
   */
  isGoogleLoading?: boolean
  
  /**
   * Callback for Google signup
   */
  onGoogleSignUp?: () => void
}

export default function SignUpFormFields({
  form,
  isLoading = false,
  isGoogleLoading = false,
  onGoogleSignUp,
}: SignUpFormFieldsProps) {
  const t = useTranslations()
  
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="space-y-6">
      {/* Google Sign-Up Button */}
      {onGoogleSignUp && (
        <>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onGoogleSignUp}
            disabled={isLoading || isGoogleLoading}
            fullWidth
            className="flex items-center justify-center gap-3"
          >
            {isGoogleLoading ? (
              <>
                <IconSpinner className="h-5 w-5" />
                {t('signup.signingUpWithGoogle')}
              </>
            ) : (
              <>
                <IconGoogle className="w-5 h-5" />
                {t('auth.continueWithGoogle')}
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {t('signup.orFillForm')}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Personal Information Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('signup.personalInfo')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('firstName')}
            label={t('signup.firstName')}
            placeholder={t('signup.firstNamePlaceholder')}
            error={errors.firstName?.message}
            required
            disabled={isLoading || isGoogleLoading}
          />

          <Input
            {...register('lastName')}
            label={t('signup.lastName')}
            placeholder={t('signup.lastNamePlaceholder')}
            error={errors.lastName?.message}
            required
            disabled={isLoading || isGoogleLoading}
          />

          <Input
            {...register('username')}
            label={t('signup.username')}
            placeholder={t('signup.usernamePlaceholder')}
            error={errors.username?.message}
            helperText={t('signup.validation.usernameMinLength')}
            required
            disabled={isLoading || isGoogleLoading}
          />

          <Input
            {...register('email')}
            type="email"
            label={t('signup.email')}
            placeholder={t('signup.emailPlaceholder')}
            error={errors.email?.message}
            required
            disabled={isLoading || isGoogleLoading}
          />

          <div className="md:col-span-2">
            <Input
              {...register('phoneNumber')}
              type="tel"
              label={t('signup.phoneNumber')}
              placeholder={t('signup.phoneNumberPlaceholder')}
              error={errors.phoneNumber?.message}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('signup.addressInfo')}
        </h3>
        
        <div className="space-y-4">
          <Textarea
            {...register('currentAddress')}
            label={t('signup.currentAddress')}
            placeholder={t('signup.currentAddressPlaceholder')}
            error={errors.currentAddress?.message}
            rows={3}
            required
            disabled={isLoading || isGoogleLoading}
          />

          <Input
            {...register('countryOfOrigin')}
            label={t('signup.countryOfOrigin')}
            placeholder={t('signup.countryOfOriginPlaceholder')}
            error={errors.countryOfOrigin?.message}
            required
            disabled={isLoading || isGoogleLoading}
          />

          <Textarea
            {...register('newAddressSwitzerland')}
            label={t('signup.newAddressSwitzerland')}
            placeholder={t('signup.newAddressSwitzerlandPlaceholder')}
            error={errors.newAddressSwitzerland?.message}
            rows={3}
            required
            disabled={isLoading || isGoogleLoading}
          />
        </div>
      </div>

      {/* Family Information Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('signup.familyInfo')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('numberOfAdults', { valueAsNumber: true })}
            type="number"
            label={t('signup.numberOfAdults')}
            placeholder="1"
            error={errors.numberOfAdults?.message}
            required
            min={1}
            disabled={isLoading || isGoogleLoading}
          />

          <Input
            {...register('numberOfChildren', { valueAsNumber: true })}
            type="number"
            label={t('signup.numberOfChildren')}
            placeholder="0"
            error={errors.numberOfChildren?.message}
            required
            min={0}
            disabled={isLoading || isGoogleLoading}
          />

          <div className="md:col-span-2">
            <Input
              {...register('petsType')}
              label={t('signup.petsType')}
              placeholder={t('signup.petsPlaceholder')}
              error={errors.petsType?.message}
              disabled={isLoading || isGoogleLoading}
            />
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('signup.passwordSection')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('password')}
            type="password"
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            error={errors.password?.message}
            required
            disabled={isLoading || isGoogleLoading}
          />

          <Input
            {...register('confirmPassword')}
            type="password"
            label={t('signup.confirmPassword')}
            placeholder={t('signup.confirmPasswordPlaceholder')}
            error={errors.confirmPassword?.message}
            required
            disabled={isLoading || isGoogleLoading}
          />
        </div>
      </div>

      {/* Consents Section */}
      <div className="space-y-4">
        <Checkbox
          {...register('termsAccepted')}
          label={
            <>
              {t('signup.termsAccept')}{' '}
              <Link href={ROUTES.TERMS} className="text-indigo-600 hover:underline">
                {t('signup.termsAndConditions')}
              </Link>
            </>
          }
          error={errors.termsAccepted?.message}
          required
          disabled={isLoading || isGoogleLoading}
        />

        <Checkbox
          {...register('dataPrivacyAccepted')}
          label={
            <>
              {t('signup.dataPrivacyAccept')}{' '}
              <Link href={ROUTES.PRIVACY} className="text-indigo-600 hover:underline">
                {t('signup.dataPrivacyPolicy')}
              </Link>
            </>
          }
          error={errors.dataPrivacyAccepted?.message}
          required
          disabled={isLoading || isGoogleLoading}
        />

        <Checkbox
          {...register('marketingConsent')}
          label={t('signup.marketingConsent')}
          disabled={isLoading || isGoogleLoading}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          disabled={isLoading || isGoogleLoading}
          fullWidth
        >
          {isLoading ? t('signup.creatingAccount') : t('signup.createAccount')}
        </Button>
      </div>
    </div>
  )
}

