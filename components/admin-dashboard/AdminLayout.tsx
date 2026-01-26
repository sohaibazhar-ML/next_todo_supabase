'use client'

import AdminSidebar from './AdminSidebar'
import AdminTopNav from './AdminTopNav'
import { SidebarProvider, useSidebar } from './SidebarContext'
import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import type { UserRole, UserInfo } from '@/types/user'

interface AdminLayoutProps {
  children: React.ReactNode
  userRole: UserRole
  permissions: {
    canUpload: boolean
    canViewStats: boolean
  }
  user: UserInfo
}

function AdminLayoutContent({
  children,
  userRole,
  permissions,
  user,
}: AdminLayoutProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar userRole={userRole} permissions={permissions} />
      <div className={`flex-1 ${ADMIN_DASHBOARD.TRANSITION_ALL} ${ADMIN_DASHBOARD.TRANSITION_DURATION} ${
        isCollapsed 
          ? ADMIN_DASHBOARD.CONTENT_MARGIN_COLLAPSED 
          : ADMIN_DASHBOARD.CONTENT_MARGIN_EXPANDED
      }`}>
        <AdminTopNav 
          user={user}
          userRole={userRole}
        />
        <div className={ADMIN_DASHBOARD.CONTENT_PADDING}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout(props: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminLayoutContent {...props} />
    </SidebarProvider>
  )
}

