import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CONSOLE_MESSAGES } from '@/constants/console'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const origin = requestUrl.origin

  // Get the locale from cookie or default to 'de'
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'de'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error(CONSOLE_MESSAGES.ERROR_SESSION_EXCHANGE, error)
      return NextResponse.redirect(`${origin}/${locale}/login?error=${encodeURIComponent(error.message)}`)
    }

    // If user just confirmed email (first opt-in) or OAuth signin
    if (data.user && type !== 'recovery') {
      // Check if profile exists using Prisma
      const profile = await prisma.profiles.findUnique({
        where: { id: data.user.id },
        select: { email_confirmed: true, email_confirmed_at: true }
      })

      // If no profile exists (e.g., Google OAuth signup), redirect to profile creation
      if (!profile) {
        return NextResponse.redirect(`${origin}/${locale}/profile?setup=true`)
      }

      // Profile exists - this means manual signup (profile was created during signup)
      // Handle email confirmation flow for manual signup
      // First confirmation - update profile and send second confirmation email
      if (!profile.email_confirmed) {
        // Update profile to mark first confirmation
        await prisma.profiles.update({
          where: { id: data.user.id },
          data: { email_confirmed: true }
        })

        // Send second confirmation email
        const { error: emailError } = await supabase.auth.resend({
          type: 'signup',
          email: data.user.email!,
          options: {
            emailRedirectTo: `${origin}/auth/callback?type=double-confirm`,
          }
        })

        if (!emailError) {
          return NextResponse.redirect(`${origin}/${locale}/login?message=${encodeURIComponent('First confirmation successful. Please check your email for the second confirmation.')}`)
        }
      }
      // Second confirmation - mark as fully confirmed
      else if (profile.email_confirmed && !profile.email_confirmed_at) {
        await prisma.profiles.update({
          where: { id: data.user.id },
          data: {
            email_confirmed: true,
            email_confirmed_at: new Date()
          }
        })

        return NextResponse.redirect(`${origin}/${locale}/dashboard?message=${encodeURIComponent('Account fully confirmed!')}`)
      }
      // Already fully confirmed, just redirect to dashboard
      else {
        return NextResponse.redirect(`${origin}/${locale}/dashboard`)
      }
    }
  }

  // Password recovery
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/${locale}/reset-password`)
  }

  // Default redirect to dashboard
  return NextResponse.redirect(`${origin}/${locale}/dashboard`)
}
