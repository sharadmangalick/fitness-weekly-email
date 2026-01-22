import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { exchangeCodeForTokens } from '@/lib/platforms/strava/client'
import { encryptTokens } from '@/lib/encryption'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('Strava OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard?error=strava_denied', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard?error=no_code', request.url))
    }

    // Verify state
    if (!state) {
      return NextResponse.redirect(new URL('/dashboard?error=invalid_state', request.url))
    }

    let stateData
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      return NextResponse.redirect(new URL('/dashboard?error=invalid_state', request.url))
    }

    // Check state is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(new URL('/dashboard?error=state_expired', request.url))
    }

    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== stateData.user_id) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Encrypt tokens
    const { tokens_encrypted, iv } = encryptTokens(tokens)

    // Calculate expiration
    const expiresAt = new Date(tokens.expires_at * 1000)

    // Store connection in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from('platform_connections')
      .upsert({
        user_id: user.id,
        platform: 'strava',
        tokens_encrypted,
        iv,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      }, { onConflict: 'user_id,platform' })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.redirect(new URL('/dashboard?error=db_error', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard?success=strava_connected', request.url))
  } catch (error) {
    console.error('Strava callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=strava_callback_failed', request.url))
  }
}
