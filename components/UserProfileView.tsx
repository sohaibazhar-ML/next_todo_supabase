'use client'

import type { UserProfile } from '@/types/user'

interface UserProfileViewProps {
  profile: UserProfile
  isOwnProfile: boolean
}

export default function UserProfileView({ profile, isOwnProfile }: UserProfileViewProps) {
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
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

      {/* Account Information */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              profile.role === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {profile.role}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Email Confirmed</p>
            <span className={`inline-flex items-center gap-1 ${
              profile.email_confirmed ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {profile.email_confirmed ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Yes
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  No
                </>
              )}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Marketing Consent</p>
            <p className="text-base text-gray-900">
              {profile.marketing_consent ? (
                <span className="text-green-600">Yes</span>
              ) : (
                <span className="text-gray-500">No</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Account Created</p>
            <p className="text-base text-gray-900">
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

