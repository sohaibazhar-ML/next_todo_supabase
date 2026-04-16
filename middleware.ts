import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CONSOLE_MESSAGES } from '@/constants'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

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
    '/auth/callback',
    '/',
    '/about',
    '/faq',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/imprint',
    '/terms',
    '/privacy'
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

  if (error || !user) {
    const url = request.nextUrl.clone()
    const isAdminRoute = pathWithoutLocale.startsWith('/admin')
    const targetPath = `/${locale}${isAdminRoute ? '/admin' : '/login'}`
    
    // BREAK LOOP: If already at target, don't redirect again
    if (pathname === targetPath) {
        return intlResponse
    }

    url.pathname = targetPath
    return NextResponse.redirect(url)
  }

  // Check email confirmation status from Supabase user metadata
  // This is synchronized in the /auth/callback route
  if (user.user_metadata?.email_confirmed !== true) {
    console.warn(CONSOLE_MESSAGES.ERROR_SESSION_EXCHANGE, 'Email not confirmed, logging out user.')
    
    // Create redirect response to login
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('error', 'emailNotConfirmed')
    const response = NextResponse.redirect(loginUrl)
    
    // Effectively log out by clearing Supabase cookies in the response
    const cookieNames = request.cookies.getAll().map(c => c.name)
    cookieNames.forEach(name => {
      if (name.startsWith('sb-') || name.includes('supabase')) {
        response.cookies.delete(name)
      }
    })
    
    return response
  }

  // Check user preference for session persistence from cookie (set during login)
  // This avoids Prisma usage in Edge runtime
  // Default to true (keep logged in) if cookie doesn't exist
  const keepMeLoggedInCookie = request.cookies.get('keep_me_logged_in')
  const keepMeLoggedIn = keepMeLoggedInCookie?.value !== 'false' // Defaults to true if cookie missing or value is 'true'

  // If user doesn't want persistent sessions, modify auth cookies to be session-only
  if (!keepMeLoggedIn) {
    try {
      // Get all auth-related cookies that were just set or already exist in the response
      const authCookiePrefixes = ['sb-', 'supabase-auth-token'];
      const responseCookies = supabaseResponse.cookies.getAll();

      responseCookies.forEach(cookie => {
        const isAuthCookie = authCookiePrefixes.some(prefix => cookie.name.startsWith(prefix)) || 
                             cookie.name.includes('supabase');
        
        if (isAuthCookie) {
          // Re-set the cookie without maxAge to make it a session cookie
          supabaseResponse.cookies.set(cookie.name, cookie.value, {
            ...cookie,
            maxAge: undefined, // Remove maxAge to make it session-only
            expires: undefined,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
        }
      });
    } catch (err) {
      console.error(CONSOLE_MESSAGES.ERROR_MODIFYING_SESSION_COOKIES, err);
    }
  }

  // Sync NEXT_LOCALE with the user's preferred language setting.
  // The settings action writes 'user_locale' when the user changes language.
  const userLocaleCookie = request.cookies.get('user_locale');
  const nextLocaleCookie = request.cookies.get('NEXT_LOCALE');
  if (userLocaleCookie?.value && userLocaleCookie.value !== nextLocaleCookie?.value) {
    supabaseResponse.cookies.set('NEXT_LOCALE', userLocaleCookie.value, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
