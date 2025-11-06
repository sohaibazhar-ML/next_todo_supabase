import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      // Redirect to login on error
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  // If it's a password recovery, redirect to reset password page
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password`)
  }

  // For OAuth (Google, etc.), redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`)
}