'use client'

import AdminSidebar from './AdminSidebar'
import AdminTopNav from './AdminTopNav'
import { SidebarProvider, useSidebar } from './SidebarContext'
import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import type { UserRole } from '@/types/user'

interface AdminLayoutProps {
  children: React.ReactNode
  userRole: UserRole
  permissions: {
    canUpload: boolean
    canViewStats: boolean
  }
  userName?: string
  userAvatar?: string
  userEmail?: string
}

function AdminLayoutContent({
  children,
  userRole,
  permissions,
  userName,
  userAvatar,
  userEmail,
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
          userName={userName} 
          userAvatar={userAvatar}
          userEmail={userEmail}
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

