'use client'

import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import AdminSidebar from './AdminSidebar'
import AdminTopNav from './AdminTopNav'
import AdminDashboardHeader from './AdminDashboardHeader'
import StatisticsCards from './StatisticsCards'
import type { DashboardStatistics, Project } from '@/types/admin-dashboard'
import type { UserRole, UserInfo } from '@/types/user'

interface AdminDashboardProps {
  statistics: DashboardStatistics
  projects: Project[]
  userRole: UserRole
  permissions: {
    canUpload: boolean
    canViewStats: boolean
  }
  user: UserInfo
}

export default function AdminDashboard({
  statistics,
  projects,
  userRole,
  permissions,
  user,
}: AdminDashboardProps) {
  const handleCreateProject = () => {
    // TODO: Implement create project functionality
    console.log(ADMIN_DASHBOARD.CONSOLE_MESSAGES.CREATE_PROJECT_CLICKED)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar userRole={userRole} permissions={permissions} />
      <div className={`flex-1 ${ADMIN_DASHBOARD.CONTENT_MARGIN_EXPANDED}`}>
        <AdminTopNav user={user} userRole={userRole} />
        <div className="bg-white rounded-lg shadow-md mt-8 mr-8 mb-8">
          <AdminDashboardHeader onCreateProject={handleCreateProject} />
          <StatisticsCards statistics={statistics} />
        </div>
      </div>
    </div>
  )
}

