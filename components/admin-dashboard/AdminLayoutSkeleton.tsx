'use client'

import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import AdminSidebar from './AdminSidebar'
import AdminTopNav from './AdminTopNav'
import { SidebarProvider, useSidebar } from './SidebarContext'
import type { UserRole } from '@/types/user'

interface AdminLayoutSkeletonProps {
  userRole: UserRole
  permissions: {
    canUpload: boolean
    canViewStats: boolean
  }
  userName?: string
  userAvatar?: string
  userEmail?: string
}

function AdminLayoutSkeletonContent({
  userRole,
  permissions,
  userName,
  userAvatar,
  userEmail,
}: AdminLayoutSkeletonProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Real Sidebar - not skeleton */}
      <AdminSidebar userRole={userRole} permissions={permissions} />

      {/* Main Content Skeleton */}
      <div className={`flex-1 ${ADMIN_DASHBOARD.TRANSITION_ALL} ${ADMIN_DASHBOARD.TRANSITION_DURATION} ${
        isCollapsed 
          ? ADMIN_DASHBOARD.CONTENT_MARGIN_COLLAPSED 
          : ADMIN_DASHBOARD.CONTENT_MARGIN_EXPANDED
      }`}>
          {/* Real Top Nav - not skeleton */}
          <AdminTopNav 
            userName={userName} 
            userAvatar={userAvatar}
            userEmail={userEmail}
            userRole={userRole}
          />

          {/* Content Skeleton */}
          <div className={ADMIN_DASHBOARD.CONTENT_PADDING}>
          <div className="bg-white rounded-lg shadow-md">
            {/* Header Skeleton */}
            <div className={`${ADMIN_DASHBOARD.COLOR_GRAY_DARKER_BG} ${ADMIN_DASHBOARD.HEADER_PADDING} rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.HEADER_TITLE} ${ADMIN_DASHBOARD.COLOR_GRAY_SKELETON_BG} rounded animate-pulse`}></div>
                <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.HEADER_BUTTON} bg-white rounded-lg animate-pulse`}></div>
              </div>
            </div>

            {/* Statistics Cards Skeleton */}
            <div className={`grid ${ADMIN_DASHBOARD.STATS_GRID_CLASSES} ${ADMIN_DASHBOARD.STATS_CARDS_GAP} ${ADMIN_DASHBOARD.STATS_CARDS_PADDING}`}>
              {ADMIN_DASHBOARD.SKELETON_STATS_CARDS_COUNT.map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.STATS_ICON} ${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTER_BG} rounded animate-pulse`}></div>
                  </div>
                  <div className="relative z-10">
                    <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.STATS_TITLE} ${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTER_BG} rounded animate-pulse mb-2`}></div>
                    <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.STATS_VALUE} ${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTER_BG} rounded animate-pulse mb-1`}></div>
                    <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.STATS_SUBTITLE} ${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTER_BG} rounded animate-pulse`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Skeleton */}
            <div className="px-8 pb-8">
              <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.TABLE_HEADER} ${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTER_BG} rounded animate-pulse mb-4`}></div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTEST_BG} h-12`}></div>
                <div className="divide-y divide-gray-200">
                  {ADMIN_DASHBOARD.SKELETON_TABLE_ROWS_COUNT.map((i) => (
                    <div key={i} className="h-16 flex items-center px-6">
                      <div className="flex-1 space-y-2">
                        <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.TABLE_CELL_LARGE} ${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTER_BG} rounded animate-pulse`}></div>
                        <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.TABLE_CELL_MEDIUM} ${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTER_BG} rounded animate-pulse`}></div>
                      </div>
                      <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.TABLE_CELL_SMALL} ${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTER_BG} rounded animate-pulse mx-4`}></div>
                      <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.TABLE_CELL_MEDIUM_BADGE} ${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTER_BG} rounded-full animate-pulse mx-4`}></div>
                      <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.TABLE_CELL_BUTTON} ${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTER_BG} rounded-full animate-pulse mx-4`}></div>
                      <div className={`${ADMIN_DASHBOARD.SKELETON_DIMENSIONS.TABLE_CELL_PROGRESS} ${ADMIN_DASHBOARD.COLOR_GRAY_LIGHTER_BG} rounded-full animate-pulse mx-4`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayoutSkeleton(props: AdminLayoutSkeletonProps) {
  return (
    <SidebarProvider>
      <AdminLayoutSkeletonContent {...props} />
    </SidebarProvider>
  )
}

