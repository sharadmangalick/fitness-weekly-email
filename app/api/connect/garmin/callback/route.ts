import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { exchangeCodeForTokens } from '@/lib/platforms/garmin/oauth-client'
import { encryptTokens } from '@/lib/encryption'
import { generateFlowId, createOAuthLogger } from '@/lib/logging'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  // Generate backup flowId in case state parsing fails
  let flowId = generateFlowId('garmin-callback')
  let logger = createOAuthLogger(flowId, 'garmin')

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    logger.info('Callback received', {
      hasCode: !!code,
      hasState: !!state,
      hasError: !!error,
      codeLength: code?.length || 0,
    })

    // Handle OAuth error from Garmin (user denied access, etc.)
    if (error) {
      logger.warn('Garmin returned error', { garminError: error })
      await logger.record({
        step: 'callback_received',
        status: 'failed',
        errorCode: 'garmin_error',
        errorMessage: error,
      })
      return NextResponse.redirect(new URL(`/dashboard?error=garmin_denied&flow=${flowId}`, request.url))
    }

    if (!code) {
      logger.error('No authorization code received')
      await logger.record({
        step: 'callback_received',
        status: 'failed',
        errorCode: 'no_code',
        errorMessage: 'No authorization code in callback',
      })
      return NextResponse.redirect(new URL(`/dashboard?error=no_code&flow=${flowId}`, request.url))
    }

    // Verify state
    if (!state) {
      logger.error('No state parameter received')
      await logger.record({
        step: 'state_validation',
        status: 'failed',
        errorCode: 'no_state',
        errorMessage: 'Missing state parameter',
      })
      return NextResponse.redirect(new URL(`/dashboard?error=invalid_state&flow=${flowId}`, request.url))
    }

    let stateData: { user_id: string; timestamp: number; flow_id?: string }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
      // If state contains flowId, use it for consistent tracing
      if (stateData.flow_id) {
        flowId = stateData.flow_id
        logger = createOAuthLogger(flowId, 'garmin')
        logger.info('Recovered flowId from state')
      }
    } catch {
      logger.error('Failed to parse state', { stateLength: state.length })
      await logger.record({
        step: 'state_validation',
        status: 'failed',
        errorCode: 'state_parse_error',
        errorMessage: 'Could not parse state parameter',
      })
      return NextResponse.redirect(new URL(`/dashboard?error=invalid_state&flow=${flowId}`, request.url))
    }

    // Check state age (5 minutes max)
    const stateAge = Date.now() - stateData.timestamp
    const stateAgeMinutes = Math.round(stateAge / 1000 / 60)
    logger.info('State validated', { stateAgeMinutes, userId: stateData.user_id.substring(0, 8) + '...' })

    if (stateAge > 5 * 60 * 1000) {
      logger.warn('State expired', { stateAgeMinutes })
      await logger.record({
        userId: stateData.user_id,
        step: 'state_validation',
        status: 'failed',
        errorCode: 'state_expired',
        errorMessage: `State expired after ${stateAgeMinutes} minutes`,
      })
      return NextResponse.redirect(new URL(`/dashboard?error=state_expired&flow=${flowId}`, request.url))
    }

    await logger.record({
      userId: stateData.user_id,
      step: 'state_validation',
      status: 'success',
    })

    // Get current user session
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logger.error('Failed to get user session', { error: userError })
      await logger.record({
        userId: stateData.user_id,
        step: 'state_validation',
        status: 'failed',
        errorCode: 'no_session',
        errorMessage: userError?.message || 'No user session',
      })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify user matches state
    if (user.id !== stateData.user_id) {
      logger.error('User mismatch', {
        sessionUserId: user.id.substring(0, 8) + '...',
        stateUserId: stateData.user_id.substring(0, 8) + '...',
      })
      await logger.record({
        userId: stateData.user_id,
        step: 'state_validation',
        status: 'failed',
        errorCode: 'user_mismatch',
        errorMessage: 'Logged in user does not match state user',
      })
      return NextResponse.redirect(new URL(`/dashboard?error=session_mismatch&flow=${flowId}`, request.url))
    }

    logger.info('Session verified', { userId: user.id.substring(0, 8) + '...' })
    await logger.record({
      userId: user.id,
      step: 'state_validation',
      status: 'success',
    })

    // Exchange code for tokens
    logger.info('Exchanging code for tokens')
    await logger.record({
      userId: user.id,
      step: 'token_exchange',
      status: 'started',
    })

    let tokens
    try {
      tokens = await exchangeCodeForTokens(code, flowId)
      logger.info('Token exchange successful', {
        userId: user.id.substring(0, 8) + '...',
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiresAt: tokens.expires_at,
        garminUserId: tokens.user_id,
      })
      await logger.record({
        userId: user.id,
        step: 'token_exchange',
        status: 'success',
        metadata: {
          garminUserId: tokens.user_id,
          expiresAt: tokens.expires_at,
        },
      })
    } catch (error) {
      logger.error('Token exchange failed', { error })
      await logger.record({
        userId: user.id,
        step: 'token_exchange',
        status: 'failed',
        errorCode: 'exchange_error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      return NextResponse.redirect(new URL(`/dashboard?error=token_exchange_failed&flow=${flowId}`, request.url))
    }

    // Encrypt tokens
    logger.info('Encrypting tokens')
    await logger.record({
      userId: user.id,
      step: 'token_encryption',
      status: 'started',
    })

    let tokensEncrypted: string
    let iv: string
    try {
      const encrypted = encryptTokens(tokens)
      tokensEncrypted = encrypted.tokens_encrypted
      iv = encrypted.iv
      logger.info('Tokens encrypted successfully')
      await logger.record({
        userId: user.id,
        step: 'token_encryption',
        status: 'success',
      })
    } catch (error) {
      logger.error('Token encryption failed', { error })
      await logger.record({
        userId: user.id,
        step: 'token_encryption',
        status: 'failed',
        errorCode: 'encryption_error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      return NextResponse.redirect(new URL(`/dashboard?error=encryption_failed&flow=${flowId}`, request.url))
    }

    // Calculate expiration date
    const expiresAt = new Date(tokens.expires_at * 1000)
    logger.info('Token expiration', { expiresAt: expiresAt.toISOString() })

    // Store connection in database
    logger.info('Storing connection in database')
    await logger.record({
      userId: user.id,
      step: 'db_storage',
      status: 'started',
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from('platform_connections')
      .upsert({
        user_id: user.id,
        platform: 'garmin',
        tokens_encrypted: tokensEncrypted,
        iv,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      }, { onConflict: 'user_id,platform' })

    if (dbError) {
      logger.error('Database write failed', { error: dbError })
      await logger.record({
        userId: user.id,
        step: 'db_storage',
        status: 'failed',
        errorCode: 'db_error',
        errorMessage: dbError.message,
      })
      return NextResponse.redirect(new URL(`/dashboard?error=db_write_failed&flow=${flowId}`, request.url))
    }

    logger.info('Connection stored successfully')
    await logger.record({
      userId: user.id,
      step: 'db_storage',
      status: 'success',
    })

    // Verify write
    logger.info('Verifying database write')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: verification } = await (supabase as any)
      .from('platform_connections')
      .select('id, platform, status')
      .eq('user_id', user.id)
      .eq('platform', 'garmin')
      .single()

    if (verification) {
      logger.info('Database write verified', { connectionId: verification.id })
      await logger.record({
        userId: user.id,
        step: 'verification',
        status: 'success',
        metadata: { connectionId: verification.id },
      })
    } else {
      logger.warn('Could not verify database write')
    }

    // Success!
    logger.info('OAuth flow completed successfully')
    await logger.record({
      userId: user.id,
      step: 'completed',
      status: 'success',
    })

    return NextResponse.redirect(new URL(`/dashboard?success=garmin_connected&flow=${flowId}`, request.url))

  } catch (error) {
    logger.error('Unexpected error in callback', { error })
    await logger.record({
      step: 'callback_received',
      status: 'failed',
      errorCode: 'unhandled_exception',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.redirect(new URL(`/dashboard?error=garmin_callback_failed&flow=${flowId}`, request.url))
  }
}
