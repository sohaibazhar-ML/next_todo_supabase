'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const supabase = createClient()
  
  const isCreating = initialProfile === null
  
  // Initialize profile state - if creating, use empty/default values, otherwise use initialProfile
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
      email_confirmed: true, // OAuth users have confirmed email
      email_confirmed_at: new Date().toISOString(),
      role: 'user',
    }
  )
  const [isEditing, setIsEditing] = useState(isCreating) // Start in edit mode if creating
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  const [currentPassword, setCurrentPassword] = useState('')
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
    if (isCreating) {
      // Can't cancel profile creation - it's required
      return
    }
    setIsEditing(false)
    setProfile(initialProfile!) // Reset to original values
    setError(null)
    setMessage(null)
  }

  const validateProfile = (): string | null => {
    if (!profile.first_name?.trim()) return 'First name is required'
    if (!profile.last_name?.trim()) return 'Last name is required'
    if (isCreating && !profile.username?.trim()) return 'Username is required'
    if (isCreating && profile.username && profile.username.length < 3) return 'Username must be at least 3 characters'
    if (!profile.email?.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email || '')) return 'Invalid email format'
    if (!profile.phone_number?.trim()) return 'Phone number is required'
    if (!profile.current_address?.trim()) return 'Current address is required'
    if (!profile.country_of_origin?.trim()) return 'Country of origin is required'
    if (!profile.new_address_switzerland?.trim()) return 'New address in Switzerland is required'
    if (!profile.number_of_adults || profile.number_of_adults < 1) return 'Number of adults must be at least 1'
    if (isCreating && !profile.terms_accepted) return 'You must accept Terms & Conditions'
    if (isCreating && !profile.data_privacy_accepted) return 'You must accept Data Privacy policy'
    return null
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // Validate profile data
    const validationError = validateProfile()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    if (isCreating) {
      // Create new profile
      // Generate username from email if not provided
      let username = profile.username?.trim()
      if (!username) {
        username = profile.email?.split('@')[0] || `user_${Date.now()}`
      }

      // Check if username already exists
      const usernameCheckRes = await fetch(`/api/profiles/check-username?username=${encodeURIComponent(username)}`)
      const usernameCheck = await usernameCheckRes.json()

      if (usernameCheck.exists) {
        setError('Username already exists. Please choose a different username.')
        setLoading(false)
        return
      }

      // Create profile via API
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
          role: 'user',
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create profile')
        setLoading(false)
        return
      }

      setMessage('Profile created successfully! Redirecting to dashboard...')
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } else {
      // Update existing profile via API
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
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update profile')
        setLoading(false)
        return
      }

      setMessage('Profile updated successfully!')
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
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
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

    setMessage('Password updated successfully!')
    setCurrentPassword('')
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
        /* READ-ONLY VIEW */
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Username</p>
                <p className="text-base text-gray-900">{profile.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                <p className="text-base text-gray-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">First Name</p>
                <p className="text-base text-gray-900">{profile.first_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Last Name</p>
                <p className="text-base text-gray-900">{profile.last_name}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                <p className="text-base text-gray-900">{profile.phone_number}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Current Address</p>
                <p className="text-base text-gray-900 whitespace-pre-line">{profile.current_address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Country of Origin</p>
                <p className="text-base text-gray-900">{profile.country_of_origin}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">New Address in Switzerland</p>
                <p className="text-base text-gray-900 whitespace-pre-line">{profile.new_address_switzerland}</p>
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Number of Adults</p>
                <p className="text-base text-gray-900">{profile.number_of_adults}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Number of Children</p>
                <p className="text-base text-gray-900">{profile.number_of_children}</p>
              </div>
              {profile.pets_type && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Pets and Type</p>
                  <p className="text-base text-gray-900">{profile.pets_type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Marketing Consent */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Marketing Consent</p>
            <p className="text-base text-gray-900">
              {profile.marketing_consent ? (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Yes
                </span>
              ) : (
                <span className="text-gray-500">No</span>
              )}
            </p>
          </div>
        </div>
      ) : (
        /* EDIT FORM */
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Personal Information */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isCreating ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username || ''}
                    onChange={handleInputChange}
                    required
                    minLength={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="Choose a username"
                  />
                  <p className="mt-1 text-xs text-gray-500">Must be at least 3 characters</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!isCreating}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400 ${
                    !isCreating ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                />
                {!isCreating && <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={profile.phone_number}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="current_address"
                  value={profile.current_address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country of Origin <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country_of_origin"
                  value={profile.country_of_origin}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Address in Switzerland <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="new_address_switzerland"
                  value={profile.new_address_switzerland}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Adults <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="number_of_adults"
                  value={profile.number_of_adults}
                  onChange={handleInputChange}
                  required
                  min={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Children
                </label>
                <input
                  type="number"
                  name="number_of_children"
                  value={profile.number_of_children}
                  onChange={handleInputChange}
                  min={0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pets and Type
                </label>
                <input
                  type="text"
                  name="pets_type"
                  value={profile.pets_type || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 dogs, 1 cat"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Marketing Consent */}
          <div>
            <div className="flex items-start">
              <input
                type="checkbox"
                name="marketing_consent"
                checked={profile.marketing_consent || false}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                I consent to receive marketing communications
              </label>
            </div>
          </div>

          {/* Terms and Privacy - Only show when creating */}
          {isCreating && (
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={profile.terms_accepted || false}
                  onChange={handleInputChange}
                  required
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  I accept the <a href="/terms" target="_blank" className="text-indigo-600 hover:underline">Terms & Conditions</a> <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="data_privacy_accepted"
                  checked={profile.data_privacy_accepted || false}
                  onChange={handleInputChange}
                  required
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  I accept the <a href="/privacy" target="_blank" className="text-indigo-600 hover:underline">Data Privacy Policy</a> <span className="text-red-500">*</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200"
            >
              {loading 
                ? (isCreating ? 'Creating Profile...' : 'Updating...') 
                : (isCreating ? 'Create Profile' : 'Save Changes')
              }
            </button>
            {!isCreating && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Password Change Section */}
      <div className="border-t pt-8">
        <button
          type="button"
          onClick={() => setShowPasswordChange(!showPasswordChange)}
          className="text-indigo-600 hover:underline font-medium"
        >
          {showPasswordChange ? 'Cancel Password Change' : 'Change Password'}
        </button>

        {showPasswordChange && (
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  )
}