import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { getStravaAuthUrl } from '@/lib/platforms/strava/client'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Generate state token for CSRF protection
    const state = Buffer.from(JSON.stringify({
      user_id: user.id,
      timestamp: Date.now(),
    })).toString('base64')

    // Redirect to Strava authorization
    const authUrl = getStravaAuthUrl(state)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Strava auth error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=strava_auth_failed', request.url))
  }
}
