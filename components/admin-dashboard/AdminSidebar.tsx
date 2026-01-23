'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'
import { useSidebar } from './SidebarContext'
import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import type { UserRole } from '@/types/user'

interface AdminSidebarProps {
  userRole: UserRole
  permissions: {
    canUpload: boolean
    canViewStats: boolean
  }
}

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  children?: NavItem[]
}

export default function AdminSidebar({ userRole, permissions }: AdminSidebarProps) {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const { isCollapsed } = useSidebar()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const getLocalizedHref = (href: string) => {
    return `/${locale}${href}`
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const isActive = (href: string) => {
    const localizedHref = getLocalizedHref(href)
    return pathname === localizedHref || pathname?.startsWith(localizedHref + '/')
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: t('common.dashboard'),
      href: ADMIN_DASHBOARD.ROUTE_ADMIN_DASHBOARD,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'documents-list',
      label: t('dashboard.documents'),
      href: ADMIN_DASHBOARD.ROUTE_ADMIN_DOCUMENTS_LIST,
      icon: (
        <svg className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'documents',
      label: t('dashboard.manageDocuments'),
      href: ADMIN_DASHBOARD.ROUTE_ADMIN_DOCUMENTS,
      icon: (
        <svg className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      children: permissions.canUpload ? undefined : undefined,
    },
    {
      id: 'stats',
      label: t('dashboard.statistics'),
      href: ADMIN_DASHBOARD.ROUTE_ADMIN_STATS,
      icon: (
        <svg className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    ...(userRole === 'admin'
      ? [
          {
            id: 'users',
            label: t('dashboard.users'),
            href: ADMIN_DASHBOARD.ROUTE_ADMIN_USERS,
            icon: (
              <svg className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
          } as NavItem,
          {
            id: 'subadmins',
            label: t('dashboard.manageSubadmins'),
            href: ADMIN_DASHBOARD.ROUTE_ADMIN_SUBADMINS,
            icon: (
              <svg className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
          } as NavItem,
        ]
      : []),
    {
      id: 'downloads',
      label: t('dashboard.downloadCenter'),
      href: ADMIN_DASHBOARD.ROUTE_DOWNLOADS,
      icon: (
        <svg className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: t('common.settings'),
      href: ADMIN_DASHBOARD.ROUTE_ADMIN_SETTINGS,
      icon: (
        <svg className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const active = isActive(item.href)

    if (isCollapsed) {
      return (
        <Link
          key={item.id}
          href={getLocalizedHref(item.href)}
          className={`flex items-center justify-center p-3 rounded-lg transition-colors group relative ${
            active
              ? `${ADMIN_DASHBOARD.COLOR_GRAY_DARK_BG} ${ADMIN_DASHBOARD.COLOR_WHITE_TEXT}`
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title={item.label}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {/* Tooltip on hover when collapsed */}
          {!active && (
            <span className={`absolute left-full ${ADMIN_DASHBOARD.TOOLTIP_MARGIN} px-2 py-1 ${ADMIN_DASHBOARD.COLOR_GRAY_DARKER_BG} ${ADMIN_DASHBOARD.COLOR_WHITE_TEXT} text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${ADMIN_DASHBOARD.Z_INDEX_TOOLTIP}`}>
              {item.label}
            </span>
          )}
        </Link>
      )
    }

    return (
      <div key={item.id}>
        <div className="flex items-center">
          <Link
            href={getLocalizedHref(item.href)}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors ${
              active
                ? `${ADMIN_DASHBOARD.COLOR_GRAY_DARK_BG} ${ADMIN_DASHBOARD.COLOR_WHITE_TEXT}`
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            style={{ paddingLeft: `${1 + level * 1}rem` }}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  toggleExpanded(item.id)
                }}
                className="ml-auto"
              >
                <svg
                  className={`${ADMIN_DASHBOARD.ICON_SIZE_SMALL} transition-transform ${isExpanded ? ADMIN_DASHBOARD.ROTATION_EXPANDED : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </Link>
        </div>
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={`${ADMIN_DASHBOARD.COLOR_GRAY_DARKER_BG} min-h-screen fixed left-0 top-0 ${ADMIN_DASHBOARD.TRANSITION_ALL} ${ADMIN_DASHBOARD.TRANSITION_DURATION} ${
        isCollapsed 
          ? `${ADMIN_DASHBOARD.SIDEBAR_WIDTH_COLLAPSED} overflow-hidden` 
          : `${ADMIN_DASHBOARD.SIDEBAR_WIDTH_EXPANDED} overflow-y-auto`
      }`}
    >
      <div className={`${ADMIN_DASHBOARD.SIDEBAR_PADDING_EXPANDED} ${ADMIN_DASHBOARD.TRANSITION_ALL} ${ADMIN_DASHBOARD.TRANSITION_DURATION} ${
        isCollapsed ? ADMIN_DASHBOARD.SIDEBAR_PADDING_COLLAPSED : ''
      }`}>
        {!isCollapsed && (
          <h1 className={`text-2xl font-bold ${ADMIN_DASHBOARD.COLOR_WHITE_TEXT} mb-8`}>{ADMIN_DASHBOARD.BRAND_NAME}</h1>
        )}
        {isCollapsed && (
          <div className="flex justify-center mb-8">
            <div className={`${ADMIN_DASHBOARD.LOGO_ICON_SIZE} rounded-lg ${ADMIN_DASHBOARD.COLOR_PRIMARY_SOLID} flex items-center justify-center`}>
              <span className={`${ADMIN_DASHBOARD.COLOR_WHITE_TEXT} font-bold text-lg`}>{ADMIN_DASHBOARD.LOGO_LETTER}</span>
            </div>
          </div>
        )}
        <nav className={isCollapsed ? ADMIN_DASHBOARD.NAV_SPACING_COLLAPSED : ADMIN_DASHBOARD.NAV_SPACING_EXPANDED}>
          {navItems
            .filter((item) => {
              // Hide manage documents (upload) if user doesn't have upload permission
              if (item.id === 'documents' && !permissions.canUpload) return false
              // Hide statistics if user doesn't have view stats permission
              if (item.id === 'stats' && !permissions.canViewStats) return false
              // documents-list is visible to all admins/subadmins (view-only)
              return true
            })
            .map((item) => renderNavItem(item))}
        </nav>
      </div>
    </aside>
  )
}

