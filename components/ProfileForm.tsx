'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { UserProfile } from '@/types/user'

interface ProfileFormProps {
  initialProfile: UserProfile | null
  userEmail?: string
  userFirstName?: string
  userLastName?: string
  userId?: string
}

export default function ProfileForm({ 
  initialProfile, 
  userEmail = '', 
  userFirstName = '', 
  userLastName = '',
  userId = ''
}: ProfileFormProps) {
  const t = useTranslations('profileForm')
  const router = useRouter()
  const supabase = createClient()
  
  const isCreating = initialProfile === null
  
  const [profile, setProfile] = useState<UserProfile | Partial<UserProfile>>(
    initialProfile || {
      id: userId,
      username: '',
      first_name: userFirstName,
      last_name: userLastName,
      email: userEmail,
      phone_number: '',
      current_address: '',
      country_of_origin: '',
      new_address_switzerland: '',
      number_of_adults: 1,
      number_of_children: 0,
      pets_type: null,
      marketing_consent: false,
      terms_accepted: false,
      data_privacy_accepted: false,
      email_confirmed: true,
      email_confirmed_at: new Date().toISOString(),
      keep_me_logged_in: true,
      role: 'user',
    }
  )
  const [isEditing, setIsEditing] = useState(isCreating)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordChange, setShowPasswordChange] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }))
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
    setMessage(null)
  }

  const handleCancel = () => {
    if (isCreating) return
    setIsEditing(false)
    setProfile(initialProfile!)
    setError(null)
    setMessage(null)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isCreating) {
      let username = profile.username?.trim()
      if (!username) {
        username = profile.email?.split('@')[0] || `user_${Date.now()}`
      }

      const usernameCheckRes = await fetch(`/api/profiles/check-username?username=${encodeURIComponent(username)}`)
      const usernameCheck = await usernameCheckRes.json()

      if (usernameCheck.exists) {
        setError(t('usernameExists'))
        setLoading(false)
        return
      }

      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          username: username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone_number: profile.phone_number,
          current_address: profile.current_address,
          country_of_origin: profile.country_of_origin,
          new_address_switzerland: profile.new_address_switzerland,
          number_of_adults: profile.number_of_adults || 1,
          number_of_children: profile.number_of_children || 0,
          pets_type: profile.pets_type || null,
          marketing_consent: profile.marketing_consent || false,
          terms_accepted: profile.terms_accepted || false,
          data_privacy_accepted: profile.data_privacy_accepted || false,
          email_confirmed: true,
          email_confirmed_at: new Date().toISOString(),
          keep_me_logged_in: profile.keep_me_logged_in ?? true,
          role: 'user',
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create profile')
        setLoading(false)
        return
      }

      setMessage(t('profileCreated'))
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } else {
      const response = await fetch('/api/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number,
          current_address: profile.current_address,
          country_of_origin: profile.country_of_origin,
          new_address_switzerland: profile.new_address_switzerland,
          number_of_adults: profile.number_of_adults,
          number_of_children: profile.number_of_children,
          pets_type: profile.pets_type,
          marketing_consent: profile.marketing_consent,
          keep_me_logged_in: profile.keep_me_logged_in ?? true,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update profile')
        setLoading(false)
        return
      }

      setMessage(t('profileUpdated'))
      setIsEditing(false)
      router.refresh()
    }

    setLoading(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'))
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError(t('passwordMinLength'))
      setLoading(false)
      return
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (passwordError) {
      setError(passwordError.message)
      setLoading(false)
      return
    }

    setMessage(t('passwordUpdated'))
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordChange(false)
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-6">
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('personalInfo')}</h3>
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('edit')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('username')}</p>
                <p className="text-base text-gray-900">{profile.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('email')}</p>
                <p className="text-base text-gray-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('firstName')}</p>
                <p className="text-base text-gray-900">{profile.first_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('lastName')}</p>
                <p className="text-base text-gray-900">{profile.last_name}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1">{t('phoneNumber')}</p>
                <p className="text-base text-gray-900">{profile.phone_number}</p>
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('addressInfo')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('currentAddress')}</p>
                <p className="text-base text-gray-900 whitespace-pre-line">{profile.current_address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('countryOfOrigin')}</p>
                <p className="text-base text-gray-900">{profile.country_of_origin}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('newAddressSwitzerland')}</p>
                <p className="text-base text-gray-900 whitespace-pre-line">{profile.new_address_switzerland}</p>
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('familyInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('numberOfAdults')}</p>
                <p className="text-base text-gray-900">{profile.number_of_adults}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('numberOfChildren')}</p>
                <p className="text-base text-gray-900">{profile.number_of_children}</p>
              </div>
              {profile.pets_type && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">{t('petsType')}</p>
                  <p className="text-base text-gray-900">{profile.pets_type}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('marketingConsent')}</p>
            <p className="text-base text-gray-900">
              {profile.marketing_consent ? (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('yes')}
                </span>
              ) : (
                <span className="text-gray-500">{t('no')}</span>
              )}
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sessionSettings')}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{t('keepMeLoggedIn')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('keepMeLoggedInDescription')}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile.keep_me_logged_in ?? true
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {profile.keep_me_logged_in ?? true ? t('enabled') : t('disabled')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('preferenceTakesEffectOnNextLogin')}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('personalInfo')}</h3>
              {!isCreating && (
                <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  {t('cancel')}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isCreating ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('username')} <span className="text-red-500">*</span></label>
                  <input type="text" name="username" value={profile.username || ''} onChange={handleInputChange} required minLength={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" placeholder={t('chooseUsername')} />
                  <p className="mt-1 text-xs text-gray-500">{t('usernameMinLength')}</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('username')}</label>
                  <input type="text" value={profile.username} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
                  <p className="mt-1 text-xs text-gray-500">{t('usernameCannotChange')}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
                <input type="email" name="email" value={profile.email || ''} onChange={handleInputChange} required disabled={!isCreating}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 ${!isCreating ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} />
                {!isCreating && <p className="mt-1 text-xs text-gray-500">{t('emailCannotChange')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('firstName')} <span className="text-red-500">*</span></label>
                <input type="text" name="first_name" value={profile.first_name} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('lastName')} <span className="text-red-500">*</span></label>
                <input type="text" name="last_name" value={profile.last_name} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('phoneNumber')} <span className="text-red-500">*</span></label>
                <input type="tel" name="phone_number" value={profile.phone_number} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('addressInfo')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('currentAddress')} <span className="text-red-500">*</span></label>
                <textarea name="current_address" value={profile.current_address} onChange={handleInputChange} required rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('countryOfOrigin')} <span className="text-red-500">*</span></label>
                <input type="text" name="country_of_origin" value={profile.country_of_origin} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('newAddressSwitzerland')} <span className="text-red-500">*</span></label>
                <textarea name="new_address_switzerland" value={profile.new_address_switzerland} onChange={handleInputChange} required rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('familyInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfAdults')} <span className="text-red-500">*</span></label>
                <input type="number" name="number_of_adults" value={profile.number_of_adults} onChange={handleInputChange} required min={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfChildren')}</label>
                <input type="number" name="number_of_children" value={profile.number_of_children} onChange={handleInputChange} min={0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('petsType')}</label>
                <input type="text" name="pets_type" value={profile.pets_type || ''} onChange={handleInputChange} placeholder={t('petsPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-start">
              <input type="checkbox" name="marketing_consent" checked={profile.marketing_consent || false} onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500" />
              <label className="ml-2 text-sm text-gray-700">{t('marketingConsentLabel')}</label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sessionSettings')}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{t('keepMeLoggedIn')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('keepMeLoggedInDescription')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="keep_me_logged_in"
                  checked={profile.keep_me_logged_in ?? true}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('preferenceTakesEffectOnNextLogin')}
            </p>
          </div>

          {isCreating && (
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-start">
                <input type="checkbox" name="terms_accepted" checked={profile.terms_accepted || false} onChange={handleInputChange} required
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500" />
                <label className="ml-2 text-sm text-gray-700">
                  {t('termsAccept')} <a href="/terms" target="_blank" className="text-indigo-600 hover:underline">{t('termsAndConditions')}</a> <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex items-start">
                <input type="checkbox" name="data_privacy_accepted" checked={profile.data_privacy_accepted || false} onChange={handleInputChange} required
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500" />
                <label className="ml-2 text-sm text-gray-700">
                  {t('dataPrivacyAccept')} <a href="/privacy" target="_blank" className="text-indigo-600 hover:underline">{t('dataPrivacyPolicy')}</a> <span className="text-red-500">*</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-semibold transition-all">
              {loading ? (isCreating ? t('creatingProfile') : t('updating')) : (isCreating ? t('createProfile') : t('saveChanges'))}
            </button>
            {!isCreating && (
              <button type="button" onClick={handleCancel} disabled={loading}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium">
                {t('cancel')}
              </button>
            )}
          </div>
        </form>
      )}

      <div className="border-t pt-8">
        <button type="button" onClick={() => setShowPasswordChange(!showPasswordChange)} className="text-indigo-600 hover:underline font-medium">
          {showPasswordChange ? t('cancelPasswordChange') : t('changePassword')}
        </button>

        {showPasswordChange && (
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('newPassword')}</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('confirmNewPassword')}</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" />
            </div>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
              {t('updatePassword')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
