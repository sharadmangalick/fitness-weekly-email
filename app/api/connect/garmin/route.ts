import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { GarminAdapter } from '@/lib/platforms/garmin/adapter'
import { encryptTokens } from '@/lib/encryption'
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

    // Generate state token (CSRF protection)
    const state = Buffer.from(JSON.stringify({
      user_id: user.id,
      timestamp: Date.now(),
      flow_id: flowId,
    })).toString('base64')

    // Log initiation
    await logger.record({
      userId: user.id,
      step: 'initiation',
      status: 'success',
      metadata: { flowId },
    })

    // Redirect to Garmin OAuth
    const authUrl = getGarminAuthUrl(state)
    logger.info('Redirecting to Garmin OAuth', { authUrl: authUrl.substring(0, 50) + '...' })

    return NextResponse.redirect(authUrl)

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

/**
 * POST endpoint - Legacy email/password authentication
 * Kept for backwards compatibility during migration
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Connect to Garmin
    const adapter = new GarminAdapter()
    const result = await adapter.connect({ email, password })

    if (!result.success || !result.tokens) {
      return NextResponse.json(
        { error: result.error || 'Failed to connect to Garmin' },
        { status: 400 }
      )
    }

    // Encrypt tokens
    const { tokens_encrypted, iv } = encryptTokens(result.tokens)

    // Calculate expiration (Garmin tokens typically last ~30 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Store connection in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from('platform_connections')
      .upsert({
        user_id: user.id,
        platform: 'garmin',
        tokens_encrypted,
        iv,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      }, { onConflict: 'user_id,platform' })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save connection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Garmin connect error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
