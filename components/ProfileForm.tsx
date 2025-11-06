'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { UserProfile } from '@/types/user'

interface ProfileFormProps {
  initialProfile: UserProfile
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [profile, setProfile] = useState(initialProfile)
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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
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
      .eq('id', profile.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setMessage('Profile updated successfully!')
    setLoading(false)
    router.refresh()
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

    // Update password
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
      {/* Profile Update Form */}
      <form onSubmit={handleProfileUpdate} className="space-y-6">
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

        {/* Personal Information */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
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
              checked={profile.marketing_consent}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              I consent to receive marketing communications
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

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

