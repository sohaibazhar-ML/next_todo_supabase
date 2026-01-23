/**
 * Routes Constants
 * 
 * This file contains all route paths used throughout the application.
 * All hardcoded routes should be replaced with constants from this file.
 * 
 * Usage:
 *   import { ROUTES } from '@/constants/routes'
 *   router.push(ROUTES.DOCUMENTS_EDIT(locale, documentId))
 *   <Link href={ROUTES.PROFILE(userId)}>Profile</Link>
 */

// ============================================================================
// Public Routes
// ============================================================================

/**
 * Public route paths
 */
export const ROUTES = {
  /**
   * Home page
   */
  HOME: '/',

  /**
   * Login page
   */
  LOGIN: '/login',

  /**
   * Sign up page
   */
  SIGNUP: '/signup',

  /**
   * Dashboard page
   * @param locale - Locale code (e.g., 'en', 'de')
   */
  DASHBOARD: (locale: string) => `/${locale}/dashboard`,

  /**
   * Profile page
   * @param userId - User ID (optional, defaults to current user)
   */
  PROFILE: (userId?: string) => userId ? `/profile/${userId}` : '/profile',

  /**
   * Documents list page
   * @param locale - Locale code
   */
  DOCUMENTS: (locale: string) => `/${locale}/documents`,

  /**
   * Document edit page
   * @param locale - Locale code
   * @param documentId - Document ID
   */
  DOCUMENTS_EDIT: (locale: string, documentId: string) => `/${locale}/documents/${documentId}/edit`,

  /**
   * Downloads page
   * @param locale - Locale code
   */
  DOWNLOADS: (locale: string) => `/${locale}/downloads`,

  /**
   * Terms and conditions page
   */
  TERMS: '/terms',

  /**
   * Privacy policy page
   */
  PRIVACY: '/privacy',

  // ============================================================================
  // Admin Routes
  // ============================================================================

  /**
   * Admin dashboard
   * @param locale - Locale code
   */
  ADMIN_DASHBOARD: (locale: string) => `/${locale}/admin`,

  /**
   * Admin documents list
   * @param locale - Locale code
   * @param uploadVersion - Optional parent document ID for version upload
   */
  ADMIN_DOCUMENTS: (locale: string, uploadVersion?: string) => {
    const base = `/${locale}/admin/documents`
    return uploadVersion ? `${base}?uploadVersion=${uploadVersion}` : base
  },

  /**
   * Admin users management
   * @param locale - Locale code
   */
  ADMIN_USERS: (locale: string) => `/${locale}/admin/users`,

  /**
   * Admin statistics
   * @param locale - Locale code
   */
  ADMIN_STATS: (locale: string) => `/${locale}/admin/stats`,

  /**
   * Admin settings
   * @param locale - Locale code
   */
  ADMIN_SETTINGS: (locale: string) => `/${locale}/admin/settings`,

  /**
   * Admin subadmins
   * @param locale - Locale code
   */
  ADMIN_SUBADMINS: (locale: string) => `/${locale}/admin/subadmins`,

  // ============================================================================
  // Auth Routes
  // ============================================================================

  /**
   * Auth callback
   */
  AUTH_CALLBACK: '/auth/callback',

  /**
   * Sign out
   */
  AUTH_SIGNOUT: '/auth/signout',
} as const

/**
 * Type helper for route functions
 */
export type RouteFunction = typeof ROUTES[keyof typeof ROUTES]

