import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { getGarminAuthUrl } from '@/lib/platforms/garmin/oauth-client'
import { generateFlowId, createOAuthLogger } from '@/lib/logging'
import type { Database } from '@/lib/database.types'

/**
 * GET endpoint - OAuth 2.0 initiation
 * Redirects user to Garmin's OAuth authorization page
 */
export async function GET(request: NextRequest) {
  const flowId = generateFlowId('garmin-oauth')
  const logger = createOAuthLogger(flowId, 'garmin')

  try {
    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('OAuth initiation: user not authenticated')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    logger.info('OAuth initiation started', {
      userId: user.id.substring(0, 8) + '...',
    })

    // Generate OAuth URL with PKCE
    const { url: authUrl, codeVerifier } = getGarminAuthUrl()

    // Generate state token (CSRF protection) with code verifier
    const state = Buffer.from(JSON.stringify({
      user_id: user.id,
      timestamp: Date.now(),
      flow_id: flowId,
      code_verifier: codeVerifier, // Store PKCE verifier for token exchange
    })).toString('base64')

    // Add state to auth URL
    const authUrlWithState = `${authUrl}&state=${encodeURIComponent(state)}`

    // Log initiation
    await logger.record({
      userId: user.id,
      step: 'initiation',
      status: 'success',
      metadata: { flowId },
    })

    logger.info('Redirecting to Garmin OAuth', { authUrl: authUrlWithState.substring(0, 50) + '...' })

    return NextResponse.redirect(authUrlWithState)

  } catch (error) {
    logger.error('OAuth initiation failed', { error })
    await logger.record({
      step: 'initiation',
      status: 'failed',
      errorCode: 'exception',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.redirect(
      new URL('/dashboard?error=garmin_auth_failed', request.url)
    )
  }
}

