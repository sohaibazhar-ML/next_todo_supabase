import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CONSOLE_MESSAGES } from '@/constants/console'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware entirely for API routes - they handle their own auth
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Skip auth routes (these are route handlers, not pages)
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next()
  }

  // Apply intl middleware first to get locale-prefixed response
  const intlResponse = intlMiddleware(request)

  // For intl redirects (e.g., / -> /de), return immediately
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse
  }

  // Extract locale from pathname
  const localeMatch = pathname.match(/^\/(de|en|fr|it)/)
  const locale = localeMatch ? localeMatch[1] : 'de'

  // Get the path without locale prefix
  const pathWithoutLocale = localeMatch
    ? pathname.replace(/^\/(de|en|fr|it)/, '') || '/'
    : pathname

  // Define public routes (without locale prefix)
  const publicRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    '/'
  ]

  const isPublicRoute = publicRoutes.some(route =>
    pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/')
  )

  // For public routes, just return the intl response (no auth check needed)
  if (isPublicRoute) {
    return intlResponse
  }

  // For protected routes, check authentication
  let supabaseResponse = intlResponse

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Copy cookies to intl response
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // If authentication fails (expired/invalid token), redirect to login
  if (error || !user) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  // Check user preference for session persistence from cookie (set during login)
  // This avoids Prisma usage in Edge runtime
  // Default to true (keep logged in) if cookie doesn't exist
  const keepMeLoggedInCookie = request.cookies.get('keep_me_logged_in')
  const keepMeLoggedIn = keepMeLoggedInCookie?.value !== 'false' // Defaults to true if cookie missing or value is 'true'

  // If user doesn't want persistent sessions, modify auth cookies to be session-only
  if (!keepMeLoggedIn) {
    try {
      // Get all Supabase auth cookies from the response
      const authCookieNames = ['sb-access-token', 'sb-refresh-token']

      // Create a new response based on the existing one
      const modifiedResponse = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })

      // Copy all existing cookies first
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        modifiedResponse.cookies.set(cookie.name, cookie.value, {
          ...cookie,
          // Preserve original options
        })
      })

      // Modify each auth cookie to be session-only (no maxAge)
      authCookieNames.forEach(cookieName => {
        const cookie = modifiedResponse.cookies.get(cookieName)
        if (cookie) {
          modifiedResponse.cookies.set(cookieName, cookie.value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            // No maxAge = session cookie (expires when browser closes)
          })
        }
      })

      // Also check for any cookies with 'sb-' prefix
      modifiedResponse.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
          modifiedResponse.cookies.set(cookie.name, cookie.value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            // No maxAge = session cookie
          })
        }
      })

      // Copy headers and status from original response
      supabaseResponse.headers.forEach((value, key) => {
        modifiedResponse.headers.set(key, value)
      })

      return modifiedResponse
    } catch (err) {
      // If error modifying cookies, just return original response
      console.error(CONSOLE_MESSAGES.ERROR_MODIFYING_SESSION_COOKIES, err)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
