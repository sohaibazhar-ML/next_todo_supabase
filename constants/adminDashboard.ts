/**
 * Admin Dashboard Constants
 * 
 * This file contains all constants used in the admin dashboard layout and components.
 * All hardcoded values related to admin dashboard should be replaced with constants from this file.
 * 
 * Usage:
 *   import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
 *   className={ADMIN_DASHBOARD.SIDEBAR_WIDTH_EXPANDED}
 */

// ============================================================================
// Sidebar Dimensions
// ============================================================================

/**
 * Admin dashboard layout constants
 * Note: Using full Tailwind class names since Tailwind requires static class names for purging
 */
export const ADMIN_DASHBOARD = {
  /**
   * Sidebar width when expanded (256px = 16rem = w-64 in Tailwind)
   * Used in AdminSidebar, AdminLayout components
   */
  SIDEBAR_WIDTH_EXPANDED: 'w-64',

  /**
   * Sidebar width when collapsed (80px = 5rem = w-20 in Tailwind)
   * Used in AdminSidebar, AdminLayout components
   */
  SIDEBAR_WIDTH_COLLAPSED: 'w-20',

  /**
   * Main content margin left when sidebar is expanded (256px = 16rem = ml-64 in Tailwind)
   * Used in AdminLayout component
   */
  CONTENT_MARGIN_EXPANDED: 'ml-64',

  /**
   * Main content margin left when sidebar is collapsed (80px = 5rem = ml-20 in Tailwind)
   * Used in AdminLayout component
   */
  CONTENT_MARGIN_COLLAPSED: 'ml-20',

  // ============================================================================
  // Spacing & Padding
  // ============================================================================

  /**
   * Sidebar padding when expanded (24px = 1.5rem = p-6 in Tailwind)
   * Used in AdminSidebar component
   */
  SIDEBAR_PADDING_EXPANDED: 'p-6',

  /**
   * Sidebar padding when collapsed (12px = 0.75rem = px-3 in Tailwind)
   * Used in AdminSidebar component
   */
  SIDEBAR_PADDING_COLLAPSED: 'px-3',

  /**
   * Navigation item spacing when expanded (8px = 0.5rem = space-y-2 in Tailwind)
   * Used in AdminSidebar component
   */
  NAV_SPACING_EXPANDED: 'space-y-2',

  /**
   * Navigation item spacing when collapsed (4px = 0.25rem = space-y-1 in Tailwind)
   * Used in AdminSidebar component
   */
  NAV_SPACING_COLLAPSED: 'space-y-1',

  /**
   * Main content padding (32px = 2rem = p-8 in Tailwind)
   * Used in AdminLayout component
   */
  CONTENT_PADDING: 'p-8',

  /**
   * Top navigation padding (32px = 2rem = px-8 py-4 in Tailwind)
   * Used in AdminTopNav component
   */
  TOP_NAV_PADDING: 'px-8 py-4',

  /**
   * Header padding (32px = 2rem = px-8 py-6 in Tailwind)
   * Used in AdminDashboardHeader component
   */
  HEADER_PADDING: 'px-8 py-6',

  /**
   * Statistics cards padding (32px = 2rem = px-8 py-6 in Tailwind)
   * Used in StatisticsCards component
   */
  STATS_CARDS_PADDING: 'px-8 py-6',

  /**
   * Statistics cards gap (24px = 1.5rem = gap-6 in Tailwind)
   * Used in StatisticsCards component
   */
  STATS_CARDS_GAP: 'gap-6',

  /**
   * Settings content spacing (24px = 1.5rem = space-y-6 in Tailwind)
   * Used in SettingsContent component
   */
  SETTINGS_SPACING: 'space-y-6',

  /**
   * Settings tabs spacing (32px = 2rem = space-x-8 in Tailwind)
   * Used in SettingsContent component
   */
  SETTINGS_TABS_SPACING: 'space-x-8',

  // ============================================================================
  // Transitions
  // ============================================================================

  /**
   * Transition duration for sidebar collapse/expand (300ms)
   * Used in AdminSidebar, AdminLayout components
   */
  TRANSITION_DURATION: 'duration-300',

  /**
   * Transition duration for dropdown (200ms)
   * Used in AdminTopNav component
   */
  DROPDOWN_TRANSITION_DURATION: 'duration-200',

  /**
   * Transition all property
   * Used in AdminSidebar, AdminLayout components
   */
  TRANSITION_ALL: 'transition-all',

  // ============================================================================
  // UI Elements
  // ============================================================================

  /**
   * Logo icon size when collapsed (40px = 2.5rem = h-10 w-10 in Tailwind)
   * Used in AdminSidebar component
   */
  LOGO_ICON_SIZE: 'h-10 w-10',

  /**
   * Dropdown menu width (256px = 16rem = w-64 in Tailwind)
   * Used in AdminTopNav component
   */
  DROPDOWN_WIDTH: 'w-64',

  /**
   * Avatar size (40px = 2.5rem = h-10 w-10 in Tailwind)
   * Used in AdminTopNav component
   */
  AVATAR_SIZE: 'h-10 w-10',

  /**
   * Icon size small (16px = 1rem = w-4 h-4 in Tailwind)
   * Used in AdminTopNav, AdminSidebar components
   */
  ICON_SIZE_SMALL: 'w-4 h-4',

  /**
   * Icon size medium (20px = 1.25rem = w-5 h-5 in Tailwind)
   * Used in AdminSidebar, SettingsContent components
   */
  ICON_SIZE_MEDIUM: 'w-5 h-5',

  /**
   * Icon size large (24px = 1.5rem = w-6 h-6 in Tailwind)
   * Used in AdminTopNav component
   */
  ICON_SIZE_LARGE: 'w-6 h-6',

  /**
   * Icon size extra large (48px = 3rem = w-12 h-12 in Tailwind)
   * Used in StatisticsCards component
   */
  ICON_SIZE_XL: 'w-12 h-12',

  /**
   * Notification badge size (8px = 0.5rem = h-2 w-2 in Tailwind)
   * Used in AdminTopNav component
   */
  NOTIFICATION_BADGE_SIZE: 'h-2 w-2',

  // ============================================================================
  // Colors
  // ============================================================================

  /**
   * Primary purple background (bg-purple-600)
   * Used in AdminDashboardHeader component
   */
  COLOR_PRIMARY_BG: 'bg-purple-600',

  /**
   * Primary purple text (text-purple-600)
   * Used in AdminDashboardHeader, StatisticsCards components
   */
  COLOR_PRIMARY_TEXT: 'text-purple-600',

  /**
   * Primary purple light background (bg-purple-100)
   * Used in AdminTopNav component
   */
  COLOR_PRIMARY_LIGHT_BG: 'bg-purple-100',

  /**
   * Primary purple light text (text-purple-700)
   * Used in AdminTopNav component
   */
  COLOR_PRIMARY_LIGHT_TEXT: 'text-purple-700',

  /**
   * Primary purple solid (bg-purple-500)
   * Used in AdminSidebar component
   */
  COLOR_PRIMARY_SOLID: 'bg-purple-500',

  /**
   * Active tab border (border-purple-600)
   * Used in SettingsContent component
   */
  COLOR_ACTIVE_TAB_BORDER: 'border-purple-600',

  /**
   * Active tab text (text-purple-600)
   * Used in SettingsContent component
   */
  COLOR_ACTIVE_TAB_TEXT: 'text-purple-600',

  /**
   * Red background for notifications (bg-red-500)
   * Used in AdminTopNav component
   */
  COLOR_RED_BG: 'bg-red-500',

  /**
   * Red text (text-red-600)
   * Used in AdminTopNav component
   */
  COLOR_RED_TEXT: 'text-red-600',

  /**
   * Red light background (bg-red-50)
   * Used in AdminTopNav component
   */
  COLOR_RED_LIGHT_BG: 'bg-red-50',

  /**
   * Gray dark background (bg-gray-700)
   * Used in AdminSidebar component
   */
  COLOR_GRAY_DARK_BG: 'bg-gray-700',

  /**
   * Gray dark background for skeleton (bg-gray-800)
   * Used in AdminSidebar, AdminLayoutSkeleton components
   */
  COLOR_GRAY_DARKER_BG: 'bg-gray-800',

  /**
   * Gray background for skeleton items (bg-gray-700)
   * Used in AdminLayoutSkeleton component
   */
  COLOR_GRAY_SKELETON_BG: 'bg-gray-700',

  /**
   * Gray light background (bg-gray-300)
   * Used in AdminLayoutSkeleton component
   */
  COLOR_GRAY_LIGHT_BG: 'bg-gray-300',

  /**
   * Gray lighter background (bg-gray-200)
   * Used in AdminLayoutSkeleton component
   */
  COLOR_GRAY_LIGHTER_BG: 'bg-gray-200',

  /**
   * Gray lightest background (bg-gray-50)
   * Used in AdminLayoutSkeleton component
   */
  COLOR_GRAY_LIGHTEST_BG: 'bg-gray-50',

  /**
   * White text (text-white)
   * Used in AdminSidebar, AdminDashboardHeader components
   */
  COLOR_WHITE_TEXT: 'text-white',

  // ============================================================================
  // Routes & Paths
  // ============================================================================

  /**
   * Sign out path
   * Used in AdminTopNav component
   */
  ROUTE_SIGNOUT: '/auth/signout',

  /**
   * Admin dashboard route
   * Used in AdminSidebar component
   */
  ROUTE_ADMIN_DASHBOARD: '/admin/dashboard',

  /**
   * Admin documents list route
   * Used in AdminSidebar component
   */
  ROUTE_ADMIN_DOCUMENTS_LIST: '/admin/documents-list',

  /**
   * Admin documents route (upload/manage)
   * Used in AdminSidebar component
   */
  ROUTE_ADMIN_DOCUMENTS: '/admin/documents',

  /**
   * Admin users route
   * Used in AdminSidebar component
   */
  ROUTE_ADMIN_USERS: '/admin/users',

  /**
   * Admin stats route
   * Used in AdminSidebar component
   */
  ROUTE_ADMIN_STATS: '/admin/stats',

  /**
   * Admin subadmins route
   * Used in AdminSidebar component
   */
  ROUTE_ADMIN_SUBADMINS: '/admin/subadmins',

  /**
   * Admin settings route
   * Used in AdminSidebar, AdminTopNav components
   */
  ROUTE_ADMIN_SETTINGS: '/admin/settings',

  /**
   * Downloads route
   * Used in AdminSidebar component
   */
  ROUTE_DOWNLOADS: '/downloads',

  // ============================================================================
  // Branding
  // ============================================================================

  /**
   * Brand name displayed in sidebar
   * Used in AdminSidebar component
   */
  BRAND_NAME: 'Dash UI',

  /**
   * Logo letter when collapsed
   * Used in AdminSidebar component
   */
  LOGO_LETTER: 'D',

  // ============================================================================
  // Default Values
  // ============================================================================

  /**
   * Default user fallback text
   * Used in AdminTopNav component
   */
  DEFAULT_USER_TEXT: 'User',

  /**
   * Default role labels (fallback if translation missing)
   * Used in AdminTopNav component
   */
  DEFAULT_ROLE_LABELS: {
    SUBADMIN: 'Subadmin',
    USER: 'User',
  },

  /**
   * Default sidebar collapsed state
   * Used in SidebarContext component
   */
  DEFAULT_SIDEBAR_COLLAPSED: false,

  /**
   * Default active tab in settings
   * Used in SettingsContent component
   */
  DEFAULT_SETTINGS_TAB: 'profile' as 'profile' | 'language',

  // ============================================================================
  // Animation & Skeleton
  // ============================================================================

  /**
   * Animation delay increment for skeleton items (100ms)
   * Used in AdminLayoutSkeleton component
   */
  SKELETON_ANIMATION_DELAY: 100,

  /**
   * Skeleton navigation items count
   * Used in AdminLayoutSkeleton component
   */
  SKELETON_NAV_ITEMS_COUNT: [1, 2, 3, 4, 5],

  /**
   * Skeleton statistics cards count
   * Used in AdminLayoutSkeleton component
   */
  SKELETON_STATS_CARDS_COUNT: [1, 2, 3, 4],

  /**
   * Skeleton table rows count
   * Used in AdminLayoutSkeleton component
   */
  SKELETON_TABLE_ROWS_COUNT: [1, 2, 3, 4, 5],

  /**
   * Skeleton dimensions
   * Used in AdminLayoutSkeleton component
   */
  SKELETON_DIMENSIONS: {
    LOGO: 'h-8 w-24',
    AVATAR: 'h-10 w-10',
    SEARCH_BAR: 'h-10 w-64',
    HEADER_TITLE: 'h-8 w-32',
    HEADER_BUTTON: 'h-10 w-40',
    STATS_ICON: 'h-12 w-12',
    STATS_TITLE: 'h-4 w-20',
    STATS_VALUE: 'h-8 w-16',
    STATS_SUBTITLE: 'h-3 w-24',
    TABLE_HEADER: 'h-6 w-32',
    TABLE_CELL_LARGE: 'h-4 w-48',
    TABLE_CELL_MEDIUM: 'h-3 w-32',
    TABLE_CELL_SMALL: 'h-6 w-16',
    TABLE_CELL_MEDIUM_BADGE: 'h-6 w-20',
    TABLE_CELL_BUTTON: 'h-8 w-24',
    TABLE_CELL_PROGRESS: 'h-2 w-32',
  },

  // ============================================================================
  // Statistics Cards
  // ============================================================================

  /**
   * Statistics card titles
   * Used in StatisticsCards component
   */
  STATS_CARD_TITLES: {
    PROJECTS: 'Projects',
    ACTIVE_TASK: 'Active Task',
    TEAMS: 'Teams',
    PRODUCTIVITY: 'Productivity',
  },

  /**
   * Statistics cards grid classes
   * Used in StatisticsCards component
   */
  STATS_GRID_CLASSES: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',

  // ============================================================================
  // Console Messages
  // ============================================================================

  /**
   * Console log messages
   * Used in AdminDashboard component
   */
  CONSOLE_MESSAGES: {
    CREATE_PROJECT_CLICKED: 'Create project clicked',
  },

  // ============================================================================
  // Z-Index Values
  // ============================================================================

  /**
   * Z-index for dropdown menu
   * Used in AdminTopNav component
   */
  Z_INDEX_DROPDOWN: 'z-50',

  /**
   * Z-index for tooltip
   * Used in AdminSidebar component
   */
  Z_INDEX_TOOLTIP: 'z-50',

  // ============================================================================
  // Other UI Constants
  // ============================================================================

  /**
   * Rotation for expanded state (180 degrees)
   * Used in AdminSidebar component
   */
  ROTATION_EXPANDED: 'rotate-180',

  /**
   * Tooltip margin left
   * Used in AdminSidebar component
   */
  TOOLTIP_MARGIN: 'ml-2',
} as const

/**
 * Type helper for admin dashboard constant keys
 */
export type AdminDashboardKey = keyof typeof ADMIN_DASHBOARD

