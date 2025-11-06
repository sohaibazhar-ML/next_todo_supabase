import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    // If user just confirmed email (first opt-in)
    if (data.user && type !== 'recovery') {
      // Check if this is the first email confirmation
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_confirmed, email_confirmed_at')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        // First confirmation - update profile and send second confirmation email
        if (!profile.email_confirmed) {
          // Update profile to mark first confirmation
          await supabase
            .from('profiles')
            .update({ email_confirmed: true })
            .eq('id', data.user.id)

          // Send second confirmation email
          const { error: emailError } = await supabase.auth.resend({
            type: 'signup',
            email: data.user.email!,
            options: {
              emailRedirectTo: `${origin}/auth/callback?type=double-confirm`,
            }
          })

          if (!emailError) {
            return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent('First confirmation successful. Please check your email for the second confirmation.')}`)
          }
        } 
        // Second confirmation - mark as fully confirmed
        else if (profile.email_confirmed && !profile.email_confirmed_at) {
          await supabase
            .from('profiles')
            .update({ 
              email_confirmed: true,
              email_confirmed_at: new Date().toISOString()
            })
            .eq('id', data.user.id)

          return NextResponse.redirect(`${origin}/dashboard?message=${encodeURIComponent('Account fully confirmed!')}`)
        }
        // Already fully confirmed, just redirect to dashboard
        else {
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }
    }
  }

  // Password recovery
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password`)
  }

  // Default redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`)
}
