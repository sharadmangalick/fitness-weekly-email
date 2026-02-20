import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { exchangeCodeForTokens } from '@/lib/platforms/strava/client'
import { encryptTokens } from '@/lib/encryption'
import { generateFlowId, createOAuthLogger } from '@/lib/logging'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  // We'll extract flowId from state, but generate a backup in case state parsing fails
  let flowId = generateFlowId('strava-callback')
  let logger = createOAuthLogger(flowId, 'strava')

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

    // Handle OAuth error from Strava (user denied access, etc.)
    if (error) {
      logger.warn('Strava returned error', { stravaError: error })
      await logger.record({
        step: 'callback_received',
        status: 'failed',
        errorCode: 'strava_error',
        errorMessage: error,
      })
      return NextResponse.redirect(new URL(`/dashboard?error=strava_denied&flow=${flowId}`, request.url))
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
        logger = createOAuthLogger(flowId, 'strava')
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

    // Check state age
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
      metadata: { stateAgeMinutes },
    })

    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    // Check session user matches state user
    const sessionUserId = user?.id
    const stateUserId = stateData.user_id
    const userMatch = sessionUserId === stateUserId

    logger.info('Session check', {
      hasSessionUser: !!sessionUserId,
      userMatch,
      sessionUserPrefix: sessionUserId?.substring(0, 8) || 'none',
    })

    if (!user || !userMatch) {
      logger.error('User mismatch or no session', { userMatch, hasSession: !!user })
      await logger.record({
        userId: stateUserId,
        step: 'state_validation',
        status: 'failed',
        errorCode: 'user_mismatch',
        errorMessage: user ? 'Session user does not match state user' : 'No authenticated session',
        metadata: { hasSession: !!user, userMatch },
      })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Exchange code for tokens
    logger.info('Starting token exchange')
    await logger.record({
      userId: user.id,
      step: 'token_exchange',
      status: 'started',
    })

    let tokens
    let measurementPreference: string | undefined
    try {
      const exchangeResult = await exchangeCodeForTokens(code, flowId)
      tokens = exchangeResult.tokens
      measurementPreference = exchangeResult.measurement_preference
      logger.info('Token exchange successful', { athleteId: tokens.athlete_id, measurementPreference })
      await logger.record({
        userId: user.id,
        step: 'token_exchange',
        status: 'success',
        metadata: { athleteId: tokens.athlete_id },
      })
    } catch (tokenError) {
      const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown error'
      logger.error('Token exchange failed', { error: errorMessage })
      await logger.record({
        userId: user.id,
        step: 'token_exchange',
        status: 'failed',
        errorCode: 'token_exchange_error',
        errorMessage,
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

    let encryptedData
    try {
      encryptedData = encryptTokens(tokens)
      logger.info('Token encryption successful')
      await logger.record({
        userId: user.id,
        step: 'token_encryption',
        status: 'success',
      })
    } catch (encryptError) {
      const errorMessage = encryptError instanceof Error ? encryptError.message : 'Unknown error'
      logger.error('Token encryption failed', { error: errorMessage })
      await logger.record({
        userId: user.id,
        step: 'token_encryption',
        status: 'failed',
        errorCode: 'encryption_error',
        errorMessage,
      })
      return NextResponse.redirect(new URL(`/dashboard?error=encryption_failed&flow=${flowId}`, request.url))
    }

    const { tokens_encrypted, iv } = encryptedData

    // Calculate expiration
    const expiresAt = new Date(tokens.expires_at * 1000)

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
        platform: 'strava',
        tokens_encrypted,
        iv,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      }, { onConflict: 'user_id,platform' })

    if (dbError) {
      logger.error('Database upsert failed', {
        error: dbError.message,
        code: dbError.code,
        details: dbError.details,
      })
      await logger.record({
        userId: user.id,
        step: 'db_storage',
        status: 'failed',
        errorCode: dbError.code || 'db_error',
        errorMessage: dbError.message,
        metadata: { details: dbError.details },
      })
      return NextResponse.redirect(new URL(`/dashboard?error=db_error&flow=${flowId}`, request.url))
    }

    logger.info('Database upsert successful')
    await logger.record({
      userId: user.id,
      step: 'db_storage',
      status: 'success',
    })

    // Verification query - confirm connection actually exists
    logger.info('Verifying connection exists')
    await logger.record({
      userId: user.id,
      step: 'verification',
      status: 'started',
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: verifyData, error: verifyError } = await (supabase as any)
      .from('platform_connections')
      .select('id, status, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('platform', 'strava')
      .single()

    if (verifyError || !verifyData) {
      logger.error('Verification query failed', {
        error: verifyError?.message,
        hasData: !!verifyData,
      })
      await logger.record({
        userId: user.id,
        step: 'verification',
        status: 'failed',
        errorCode: 'verification_error',
        errorMessage: verifyError?.message || 'No connection found after upsert',
      })
      return NextResponse.redirect(new URL(`/dashboard?error=verification_failed&flow=${flowId}`, request.url))
    }

    logger.info('Verification successful', {
      connectionId: verifyData.id.substring(0, 8) + '...',
      status: verifyData.status,
    })
    await logger.record({
      userId: user.id,
      step: 'verification',
      status: 'success',
      metadata: { connectionStatus: verifyData.status },
    })

    // Auto-detect distance unit from Strava measurement preference
    if (measurementPreference) {
      const distanceUnit = measurementPreference === 'meters' ? 'km' : 'mi'
      logger.info('Auto-detected distance unit from Strava', { measurementPreference, distanceUnit })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('user_profiles')
        .update({ distance_unit: distanceUnit })
        .eq('id', user.id)
    }

    // Mark flow as completed
    logger.info('OAuth flow completed successfully')
    await logger.record({
      userId: user.id,
      step: 'completed',
      status: 'success',
      metadata: { athleteId: tokens.athlete_id },
    })

    return NextResponse.redirect(new URL(`/dashboard?success=strava_connected&flow=${flowId}`, request.url))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Strava callback unhandled error', { error: errorMessage })
    await logger.record({
      step: 'callback_received',
      status: 'failed',
      errorCode: 'unhandled_exception',
      errorMessage,
    })
    return NextResponse.redirect(new URL(`/dashboard?error=strava_callback_failed&flow=${flowId}`, request.url))
  }
}
