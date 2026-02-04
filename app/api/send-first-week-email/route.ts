import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createAdminClient } from '@/lib/supabase-server'
import { decryptTokens } from '@/lib/encryption'
import { GarminAdapter } from '@/lib/platforms/garmin/adapter'
import { StravaAdapter } from '@/lib/platforms/strava/adapter'
import { analyzeTrainingData } from '@/lib/training/analyzer'
import { generateTrainingPlan } from '@/lib/training/planner'
import { generateFirstWeekEmailHtml, generateFirstWeekEmailSubject } from '@/lib/training/first-week-emailer'
import { Resend } from 'resend'
import type { Database, UserProfile, TrainingConfig, PlatformConnection } from '@/lib/database.types'
import type { GarminTokens, StravaTokens } from '@/lib/platforms/interface'

// Lazy initialize Resend
let resend: Resend | null = null
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

/**
 * POST /api/send-first-week-email
 *
 * Sends a training plan email for the rest of the current week.
 * Called after user completes onboarding (connects platform + sets goals).
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Use admin client for full access
    const adminClient = createAdminClient()

    // Get user profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileError } = await (adminClient as any)
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single() as { data: UserProfile | null; error: any }

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get training config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: config, error: configError } = await (adminClient as any)
      .from('training_configs')
      .select('*')
      .eq('user_id', user.id)
      .single() as { data: TrainingConfig | null; error: any }

    if (configError || !config) {
      console.error('Config error:', configError)
      return NextResponse.json({ error: 'Training config not found' }, { status: 404 })
    }

    // Get platform connection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: connections, error: connError } = await (adminClient as any)
      .from('platform_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active') as { data: PlatformConnection[] | null; error: any }

    if (connError || !connections || connections.length === 0) {
      console.error('Connection error:', connError)
      return NextResponse.json({ error: 'No active platform connection' }, { status: 404 })
    }

    // Use preferred platform or first available
    const preferredPlatform = profile.preferred_platform || 'strava'
    const connection = connections.find(c => c.platform === preferredPlatform) || connections[0]

    console.log(`Fetching data from ${connection.platform} for first week email...`)

    // Fetch platform data
    let platformData
    if (connection.platform === 'garmin') {
      const tokens = decryptTokens<GarminTokens>(connection.tokens_encrypted, connection.iv)
      const adapter = new GarminAdapter()
      platformData = await adapter.getAllData(tokens, 7)
    } else {
      const tokens = decryptTokens<StravaTokens>(connection.tokens_encrypted, connection.iv)
      const adapter = new StravaAdapter()
      platformData = await adapter.getAllData(tokens, 7)
    }

    console.log(`Fetched ${platformData.activities.length} activities`)

    // Analyze data
    const analysis = analyzeTrainingData(platformData)

    // Generate full training plan
    const plan = generateTrainingPlan(config as any, analysis)

    // Generate email with partial week
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://runplan.fun'
    const dashboardUrl = `${appUrl}/dashboard`

    const emailHtml = generateFirstWeekEmailHtml(
      profile,
      config,
      analysis,
      plan,
      platformData,
      dashboardUrl
    )
    const emailSubject = generateFirstWeekEmailSubject(profile.name)

    // Send email
    console.log(`Sending first week email to: ${profile.email}`)

    const { data: sendData, error: sendError } = await getResend().emails.send({
      from: 'RunPlan <onboarding@resend.dev>',
      to: profile.email,
      subject: emailSubject,
      html: emailHtml,
    })

    if (sendError) {
      console.error('Send error:', sendError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    console.log('First week email sent successfully:', sendData?.id)

    // Record in email history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any).from('email_history').insert({
      user_id: user.id,
      platform: connection.platform,
      status: 'sent',
    })

    return NextResponse.json({
      success: true,
      messageId: sendData?.id,
    })
  } catch (error) {
    console.error('First week email error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
