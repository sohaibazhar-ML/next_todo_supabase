import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CONSOLE_MESSAGES } from '@/constants'
import { createServiceClient } from '@/lib/supabase/service'
import type { User, Session, AuthError, EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const origin = requestUrl.origin

  // Get the locale from cookie or default to 'de'
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'de'

  // Standard PKCE Code Flow
  if (code) {
    const supabase = await createClient()

    // Retry logic for exchangeCodeForSession to handle network blips
    let data: { user: User | null; session: Session | null } | null = null
    let error: AuthError | null = null
    let retries = 3;
    while (retries > 0) {
      const result = await supabase.auth.exchangeCodeForSession(code)
      data = result.data
      error = result.error

      if (!error) break;

      // If it's a network error, retry
      if (error.message?.includes('fetch failed') || error.message?.includes('timeout')) {
        retries--;
        if (retries > 0) {
          console.warn(`Auth exchange failed, retrying... (${3 - retries}/3)`)
          await new Promise(r => setTimeout(r, 1500)); // Wait before retry
          continue;
        }
      }
      break;
    }

    const finalData = data;
    if (error || !finalData) {
      console.error(CONSOLE_MESSAGES.ERROR_SESSION_EXCHANGE, error || 'No session data')
      return NextResponse.redirect(`${origin}/${locale}/login?error=${encodeURIComponent(error?.message || 'Authentication failed')}`)
    }

    // If user just confirmed email (first opt-in), OAuth signin, or Password Recovery
    if (finalData.user) {
      const userId = finalData.user.id;

      // Update Prisma profile to confirmed (Recovery also proves control over email)
      await prisma.profiles.update({
        where: { id: userId },
        data: {
          email_confirmed: true,
          email_confirmed_at: new Date()
        }
      });

      // Update the session JWT metadata using the authenticated user client
      await supabase.auth.updateUser({
        data: { email_confirmed: true }
      });

      // Sync confirmation status to Supabase metadata
      const admin = createServiceClient();
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { email_confirmed: true }
      });

      // Branch redirect based on flow type
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/${locale}/reset-password`)
      }

      return NextResponse.redirect(`${origin}/${locale}/login?confirmed=true`)
    }
  }

  // Token Hash Flow (for manual email confirmation links)
  if (token_hash && type) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    })

    if (error || !data.user) {
      console.error(CONSOLE_MESSAGES.ERROR_SESSION_EXCHANGE, error || 'Verification failed')
      return NextResponse.redirect(`${origin}/${locale}/login?error=${encodeURIComponent(error?.message || 'Verification failed')}`)
    }

    const userId = data.user.id;

    // Update Prisma profile to confirmed
    await prisma.profiles.update({
      where: { id: userId },
      data: {
        email_confirmed: true,
        email_confirmed_at: new Date()
      }
    });

    // Update the session JWT metadata using the authenticated user client
    await supabase.auth.updateUser({
      data: { email_confirmed: true }
    });

    // Sync confirmation status to Supabase metadata
    const admin = createServiceClient();
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { email_confirmed: true }
    });

    // Branch redirect based on flow type
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/${locale}/reset-password`)
    }

    return NextResponse.redirect(`${origin}/${locale}/login?confirmed=true`)
  }

  // Password recovery
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/${locale}/reset-password`)
  }

  // Default redirect to dashboard
  return NextResponse.redirect(`${origin}/${locale}/dashboard`)
}
