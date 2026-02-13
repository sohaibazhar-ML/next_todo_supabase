'use client'

import { useTranslations } from 'next-intl'
import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useSidebar } from './SidebarContext'
import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import type { UserRole, UserInfo } from '@/types/user'
import { IconButton } from '@/components/ui'
import {
  IconMenu,
  IconBell,
  IconSettings,
  IconLogout,
  IconChevronDown
} from '@/components/ui/icons'

interface AdminTopNavProps {
  user: UserInfo
  userRole?: UserRole
}

export default function AdminTopNav({ user, userRole }: AdminTopNavProps) {
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
        <IconButton
          onClick={toggleSidebar}
          icon={
            <IconMenu className={`${ADMIN_DASHBOARD.ICON_SIZE_LARGE} text-gray-600`} />
          }
          tooltip="Toggle sidebar"
          variant="ghost"
        />
        {/* <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <IconSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          />
        </div> */}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <IconButton
            icon={
              <IconBell className={`${ADMIN_DASHBOARD.ICON_SIZE_LARGE} text-gray-600`} />
            }
            tooltip="Notifications"
            variant="ghost"
          />
          <span className={`absolute top-1 right-1 ${ADMIN_DASHBOARD.NOTIFICATION_BADGE_SIZE} ${ADMIN_DASHBOARD.COLOR_RED_BG} rounded-full`}></span>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="User menu"
            aria-expanded={showDropdown}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || ADMIN_DASHBOARD.DEFAULT_USER_TEXT}
                className={`${ADMIN_DASHBOARD.AVATAR_SIZE} rounded-full object-cover`}
              />
            ) : (
              <div className={`${ADMIN_DASHBOARD.AVATAR_SIZE} rounded-full ${ADMIN_DASHBOARD.COLOR_PRIMARY_SOLID} flex items-center justify-center ${ADMIN_DASHBOARD.COLOR_WHITE_TEXT} font-medium`}>
                {user.name ? user.name.charAt(0).toUpperCase() : ADMIN_DASHBOARD.DEFAULT_USER_TEXT.charAt(0)}
              </div>
            )}
            <IconChevronDown
              className={`${ADMIN_DASHBOARD.ICON_SIZE_SMALL} text-gray-600 transition-transform ${ADMIN_DASHBOARD.DROPDOWN_TRANSITION_DURATION} ${
                showDropdown ? ADMIN_DASHBOARD.ROTATION_EXPANDED : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className={`absolute right-0 mt-2 ${ADMIN_DASHBOARD.DROPDOWN_WIDTH} bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${ADMIN_DASHBOARD.Z_INDEX_DROPDOWN}`}>
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">{user.name || ADMIN_DASHBOARD.DEFAULT_USER_TEXT}</p>
                {user.email && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
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
                <IconSettings className={`${ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} text-gray-500`} />
                <span>{t('common.settings')}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${ADMIN_DASHBOARD.COLOR_RED_TEXT} hover:bg-red-50 transition-colors`}
              >
                <IconLogout className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} />
                <span>{t('common.signOut')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

