'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import type { SignUpFormData } from '@/types/user'

export default function SignUpPage() {
  const t = useTranslations()
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '', lastName: '', username: '', email: '', phoneNumber: '',
    password: '', confirmPassword: '', currentAddress: '', countryOfOrigin: '',
    newAddressSwitzerland: '', numberOfAdults: 1, numberOfChildren: 0, petsType: '',
    marketingConsent: false, termsAccepted: false, dataPrivacyAccepted: false,
  })
  
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return t('signup.validation.firstNameRequired')
    if (!formData.lastName.trim()) return t('signup.validation.lastNameRequired')
    if (!formData.username.trim()) return t('signup.validation.usernameRequired')
    if (formData.username.length < 3) return t('signup.validation.usernameMinLength')
    if (!formData.email.trim()) return t('signup.validation.emailRequired')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return t('signup.validation.invalidEmail')
    if (!formData.phoneNumber.trim()) return t('signup.validation.phoneRequired')
    if (!formData.password) return t('signup.validation.passwordRequired')
    if (formData.password.length < 6) return t('signup.validation.passwordMinLength')
    if (formData.password !== formData.confirmPassword) return t('signup.validation.passwordsDoNotMatch')
    if (!formData.currentAddress.trim()) return t('signup.validation.currentAddressRequired')
    if (!formData.countryOfOrigin.trim()) return t('signup.validation.countryRequired')
    if (!formData.newAddressSwitzerland.trim()) return t('signup.validation.swissAddressRequired')
    if (formData.numberOfAdults < 1) return t('signup.validation.adultsMin')
    if (!formData.termsAccepted) return t('signup.validation.termsRequired')
    if (!formData.dataPrivacyAccepted) return t('signup.validation.privacyRequired')
    return null
  }

  const handleGoogleSignUp = async () => {
    setSocialLoading('google')
    setError(null)
    const { error: socialError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (socialError) {
      setError(socialError.message)
      setSocialLoading(null)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      try { await supabase.auth.signOut() } catch {}
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { username: formData.username, first_name: formData.firstName, last_name: formData.lastName }
        }
      })

      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      if (!authData.user) { setError('Failed to create user account'); setLoading(false); return }

      const profileResponse = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: authData.user.id, username: formData.username, first_name: formData.firstName,
          last_name: formData.lastName, email: formData.email, phone_number: formData.phoneNumber,
          current_address: formData.currentAddress, country_of_origin: formData.countryOfOrigin,
          new_address_switzerland: formData.newAddressSwitzerland, number_of_adults: formData.numberOfAdults,
          number_of_children: formData.numberOfChildren, pets_type: formData.petsType || null,
          marketing_consent: formData.marketingConsent, terms_accepted: formData.termsAccepted,
          data_privacy_accepted: formData.dataPrivacyAccepted, email_confirmed: false, role: 'user',
        })
      })

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({ error: 'Profile creation failed' }))
        setError(errorData.error || 'Profile creation failed')
        setLoading(false)
        return
      }

      setMessage(t('signup.registrationSuccess'))
      setLoading(false)
      setFormData({
        firstName: '', lastName: '', username: '', email: '', phoneNumber: '', password: '', confirmPassword: '',
        currentAddress: '', countryOfOrigin: '', newAddressSwitzerland: '', numberOfAdults: 1, numberOfChildren: 0,
        petsType: '', marketingConsent: false, termsAccepted: false, dataPrivacyAccepted: false,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-2xl w-full mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{t('signup.createAccount')}</h2>
          <p className="text-white/90 drop-shadow-md">{t('signup.fillAllInfo')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSignUp} className="space-y-6">
            {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"><p className="text-sm text-red-700">{error}</p></div>}
            {message && <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg"><p className="text-sm text-green-700">{message}</p></div>}

            <button type="button" onClick={handleGoogleSignUp} disabled={loading || socialLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
              {socialLoading === 'google' ? t('signup.signingUpWithGoogle') : t('auth.continueWithGoogle')}
            </button>

            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">{t('signup.orFillForm')}</span></div>
            </div>

            {/* Personal Information */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('signup.personalInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.firstName')} <span className="text-red-500">*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.lastName')} <span className="text-red-500">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.username')} <span className="text-red-500">*</span></label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required minLength={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.email')} <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.phoneNumber')} <span className="text-red-500">*</span></label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('signup.addressInfo')}</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.currentAddress')} <span className="text-red-500">*</span></label>
                  <textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} required rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.countryOfOrigin')} <span className="text-red-500">*</span></label>
                  <input type="text" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.newAddressSwitzerland')} <span className="text-red-500">*</span></label>
                  <textarea name="newAddressSwitzerland" value={formData.newAddressSwitzerland} onChange={handleInputChange} required rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
              </div>
            </div>

            {/* Family Information */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('signup.familyInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.numberOfAdults')} <span className="text-red-500">*</span></label>
                  <input type="number" name="numberOfAdults" value={formData.numberOfAdults} onChange={handleInputChange} required min={1} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.numberOfChildren')}</label>
                  <input type="number" name="numberOfChildren" value={formData.numberOfChildren} onChange={handleInputChange} min={0} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.petsType')}</label>
                  <input type="text" name="petsType" value={formData.petsType} onChange={handleInputChange} placeholder={t('signup.petsPlaceholder')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
              </div>
            </div>

            {/* Password */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('signup.passwordSection')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password')} <span className="text-red-500">*</span></label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} required minLength={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.confirmPassword')} <span className="text-red-500">*</span></label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required minLength={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" /></div>
              </div>
            </div>

            {/* Consents */}
            <div className="space-y-4">
              <div className="flex items-start"><input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange} required className="mt-1 h-4 w-4 text-indigo-600" />
                <label className="ml-2 text-sm text-gray-700">{t('signup.termsAccept')} <Link href="/terms" className="text-indigo-600 hover:underline">{t('signup.termsAndConditions')}</Link> <span className="text-red-500">*</span></label></div>
              <div className="flex items-start"><input type="checkbox" name="dataPrivacyAccepted" checked={formData.dataPrivacyAccepted} onChange={handleInputChange} required className="mt-1 h-4 w-4 text-indigo-600" />
                <label className="ml-2 text-sm text-gray-700">{t('signup.dataPrivacyAccept')} <Link href="/privacy" className="text-indigo-600 hover:underline">{t('signup.dataPrivacyPolicy')}</Link> <span className="text-red-500">*</span></label></div>
              <div className="flex items-start"><input type="checkbox" name="marketingConsent" checked={formData.marketingConsent} onChange={handleInputChange} className="mt-1 h-4 w-4 text-indigo-600" />
                <label className="ml-2 text-sm text-gray-700">{t('signup.marketingConsent')}</label></div>
            </div>

            <button type="submit" disabled={loading || socialLoading !== null}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-semibold transition-all">
              {loading ? t('signup.creatingAccount') : t('signup.createAccount')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-indigo-600 hover:underline">{t('signup.alreadyHaveAccount')}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

