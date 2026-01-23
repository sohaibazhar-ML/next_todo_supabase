'use client'

import { useTranslations } from 'next-intl'
import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useSidebar } from './SidebarContext'
import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import type { UserRole } from '@/types/user'

interface AdminTopNavProps {
  userName?: string
  userAvatar?: string
  userEmail?: string
  userRole?: UserRole
}

export default function AdminTopNav({ userName, userAvatar, userEmail, userRole }: AdminTopNavProps) {
  const t = useTranslations()
  const locale = useLocale()
  const { toggleSidebar } = useSidebar()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  const handleSignOut = () => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = ADMIN_DASHBOARD.ROUTE_SIGNOUT
    document.body.appendChild(form)
    form.submit()
  }

  const getRoleLabel = (role?: UserRole) => {
    if (role === 'admin') return t('profile.adminAccount')
    if (role === 'subadmin') return ADMIN_DASHBOARD.DEFAULT_ROLE_LABELS.SUBADMIN
    return ADMIN_DASHBOARD.DEFAULT_ROLE_LABELS.USER
  }

  return (
    <div className={`bg-gray-50 border-b border-gray-200 ${ADMIN_DASHBOARD.TOP_NAV_PADDING} flex items-center justify-between`}>
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className={`${ADMIN_DASHBOARD.ICON_SIZE_LARGE} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div> */}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors relative">
          <svg className={`${ADMIN_DASHBOARD.ICON_SIZE_LARGE} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className={`absolute top-1 right-1 ${ADMIN_DASHBOARD.NOTIFICATION_BADGE_SIZE} ${ADMIN_DASHBOARD.COLOR_RED_BG} rounded-full`}></span>
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="User menu"
            aria-expanded={showDropdown}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName || ADMIN_DASHBOARD.DEFAULT_USER_TEXT}
                className={`${ADMIN_DASHBOARD.AVATAR_SIZE} rounded-full object-cover`}
              />
            ) : (
              <div className={`${ADMIN_DASHBOARD.AVATAR_SIZE} rounded-full ${ADMIN_DASHBOARD.COLOR_PRIMARY_SOLID} flex items-center justify-center ${ADMIN_DASHBOARD.COLOR_WHITE_TEXT} font-medium`}>
                {userName ? userName.charAt(0).toUpperCase() : ADMIN_DASHBOARD.DEFAULT_USER_TEXT.charAt(0)}
              </div>
            )}
            <svg
              className={`${ADMIN_DASHBOARD.ICON_SIZE_SMALL} text-gray-600 transition-transform ${ADMIN_DASHBOARD.DROPDOWN_TRANSITION_DURATION} ${
                showDropdown ? ADMIN_DASHBOARD.ROTATION_EXPANDED : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className={`absolute right-0 mt-2 ${ADMIN_DASHBOARD.DROPDOWN_WIDTH} bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${ADMIN_DASHBOARD.Z_INDEX_DROPDOWN}`}>
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">{userName || ADMIN_DASHBOARD.DEFAULT_USER_TEXT}</p>
                {userEmail && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{userEmail}</p>
                )}
                {userRole && (
                  <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${ADMIN_DASHBOARD.COLOR_PRIMARY_LIGHT_BG} ${ADMIN_DASHBOARD.COLOR_PRIMARY_LIGHT_TEXT}`}>
                    {getRoleLabel(userRole)}
                  </span>
                )}
              </div>

              {/* Settings Link */}
              <Link
                href={`/${locale}${ADMIN_DASHBOARD.ROUTE_ADMIN_SETTINGS}`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <svg className={`${ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{t('common.settings')}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${ADMIN_DASHBOARD.COLOR_RED_TEXT} hover:bg-red-50 transition-colors`}
              >
                <svg className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{t('common.signOut')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

