import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { getStravaAuthUrl } from '@/lib/platforms/strava/client'
import { generateFlowId, createOAuthLogger } from '@/lib/logging'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  const flowId = generateFlowId('strava')
  const logger = createOAuthLogger(flowId, 'strava')

  try {
    logger.info('OAuth initiation started')
    await logger.record({ step: 'initiation', status: 'started' })

    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      logger.error('Auth check failed', { error: authError.message })
      await logger.record({
        step: 'initiation',
        status: 'failed',
        errorCode: 'auth_error',
        errorMessage: authError.message,
      })
      return NextResponse.redirect(new URL(`/login?error=auth_failed&flow=${flowId}`, request.url))
    }

    if (!user) {
      logger.warn('No authenticated user found')
      await logger.record({
        step: 'initiation',
        status: 'failed',
        errorCode: 'no_user',
        errorMessage: 'No authenticated user',
      })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    logger.info('User authenticated', { userId: user.id.substring(0, 8) + '...' })

    // Generate state token for CSRF protection (includes flowId for tracing)
    const state = Buffer.from(JSON.stringify({
      user_id: user.id,
      timestamp: Date.now(),
      flow_id: flowId,
    })).toString('base64')

    logger.info('State token generated')

    // Record initiation success with userId
    await logger.record({
      userId: user.id,
      step: 'initiation',
      status: 'success',
      metadata: { hasState: true },
    })

    // Redirect to Strava authorization
    const authUrl = getStravaAuthUrl(state)
    logger.info('Redirecting to Strava', { authUrlHost: new URL(authUrl).host })

    return NextResponse.redirect(authUrl)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Strava auth initiation error', { error: errorMessage })
    await logger.record({
      step: 'initiation',
      status: 'failed',
      errorCode: 'exception',
      errorMessage,
    })
    return NextResponse.redirect(new URL(`/dashboard?error=strava_auth_failed&flow=${flowId}`, request.url))
  }
}
