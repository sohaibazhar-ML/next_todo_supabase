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
import { Input, Textarea, Checkbox, Button } from '@/components/ui'

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
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t('signup.signingUpWithGoogle')}
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
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

