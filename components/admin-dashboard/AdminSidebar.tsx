'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'
import { useSidebar } from './SidebarContext'
import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import type { UserRole } from '@/types/user'
import {
  IconDashboard,
  IconDocuments,
  IconUpload,
  IconStats,
  IconUsers,
  IconSubadmins,
  IconDownload,
  IconSettings,
  IconChevronDown
} from '@/components/ui/icons'

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
      icon: <IconDashboard className="w-5 h-5" />,
    },
    {
      id: 'documents-list',
      label: t('dashboard.documents'),
      href: ADMIN_DASHBOARD.ROUTE_ADMIN_DOCUMENTS_LIST,
      icon: <IconDocuments className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} />,
    },
    {
      id: 'documents',
      label: t('dashboard.manageDocuments'),
      href: ADMIN_DASHBOARD.ROUTE_ADMIN_DOCUMENTS,
      icon: <IconUpload className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} />,
    },
    {
      id: 'stats',
      label: t('dashboard.statistics'),
      href: ADMIN_DASHBOARD.ROUTE_ADMIN_STATS,
      icon: <IconStats className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} />,
    },
    ...(userRole === 'admin'
      ? [
          {
            id: 'users',
            label: t('dashboard.users'),
            href: ADMIN_DASHBOARD.ROUTE_ADMIN_USERS,
            icon: <IconUsers className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} />,
          } as NavItem,
          {
            id: 'subadmins',
            label: t('dashboard.manageSubadmins'),
            href: ADMIN_DASHBOARD.ROUTE_ADMIN_SUBADMINS,
            icon: <IconSubadmins className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} />,
          } as NavItem,
        ]
      : []),
    {
      id: 'downloads',
      label: t('dashboard.downloadCenter'),
      href: ADMIN_DASHBOARD.ROUTE_DOWNLOADS,
      icon: <IconDownload className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} />,
    },
    {
      id: 'settings',
      label: t('common.settings'),
      href: ADMIN_DASHBOARD.ROUTE_ADMIN_SETTINGS,
      icon: <IconSettings className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} />,
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
                <IconChevronDown
                  className={`${ADMIN_DASHBOARD.ICON_SIZE_SMALL} transition-transform ${isExpanded ? ADMIN_DASHBOARD.ROTATION_EXPANDED : ''}`}
                />
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

