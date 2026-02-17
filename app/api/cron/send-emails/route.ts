import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { decryptTokens, encryptTokens } from '@/lib/encryption'
import { GarminAdapter } from '@/lib/platforms/garmin/adapter'
import { StravaAdapter } from '@/lib/platforms/strava/adapter'
import { analyzeTrainingData } from '@/lib/training/analyzer'
import { generateTrainingPlan } from '@/lib/training/planner'
import { generateEmailHtml, generateEmailSubject } from '@/lib/training/emailer'
import { calculateUpdatedBaseline } from '@/lib/training/mileage-calculator'
import { Resend } from 'resend'
import type { GarminOAuthTokens, StravaTokens, AllPlatformData } from '@/lib/platforms/interface'
import type { TrainingConfig, UserProfile, PlatformConnection } from '@/lib/database.types'

// Lazy initialize Resend to avoid build-time errors
let resend: Resend | null = null
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

// Verify cron secret for scheduled calls
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '')
  return cronSecret === process.env.CRON_SECRET
}

// Get day name
function getDayName(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()]
}

// Get current hour
function getCurrentHour(): number {
  return new Date().getHours()
}

export async function POST(request: NextRequest) {
  try {
    // Check for manual trigger
    const isManualTrigger = request.headers.get('x-manual-trigger') === 'true'
    let specificUserId: string | null = null

    if (isManualTrigger) {
      const body = await request.json().catch(() => ({}))
      specificUserId = body.user_id
    } else {
      // Verify cron secret for automated calls
      if (!verifyCronSecret(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabase = createAdminClient()
    const currentDay = getDayName()
    const currentHour = getCurrentHour()

    // Query training configs with user profiles
    let configQuery = supabase
      .from('training_configs')
      .select(`
        *,
        user_profiles!inner(id, email, name, preferred_platform)
      `)
      .eq('email_enabled', true)

    if (specificUserId) {
      configQuery = configQuery.eq('user_id', specificUserId)
    } else {
      configQuery = configQuery.eq('email_day', currentDay)
    }

    const { data: configsWithProfiles, error: configError } = await configQuery as { data: any[] | null; error: any }

    if (configError) {
      console.error('Config query error:', configError)
      return NextResponse.json({ error: `Database error: ${configError.message}` }, { status: 500 })
    }

    if (!configsWithProfiles || configsWithProfiles.length === 0) {
      return NextResponse.json({
        message: 'No users to email',
        day: currentDay,
        hour: currentHour,
      })
    }

    // Fetch platform connections for these users
    const userIds = configsWithProfiles.map((c: any) => c.user_id)
    const { data: allConnections, error: connError } = await supabase
      .from('platform_connections')
      .select('id, user_id, platform, tokens_encrypted, iv, status')
      .in('user_id', userIds)
      .eq('status', 'active') as { data: any[] | null; error: any }

    if (connError) {
      console.error('Connections query error:', connError)
      return NextResponse.json({ error: `Database error: ${connError.message}` }, { status: 500 })
    }

    // Combine the data
    const usersToEmail = configsWithProfiles.map((config: any) => ({
      ...config,
      platform_connections: allConnections?.filter((c: any) => c.user_id === config.user_id) || []
    })).filter((u: any) => u.platform_connections.length > 0)

    if (usersToEmail.length === 0) {
      return NextResponse.json({
        message: 'No users with active platform connections',
        day: currentDay,
        hour: currentHour,
      })
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process each user
    console.log(`Processing ${usersToEmail.length} users for email`)

    for (const userData of usersToEmail) {
      try {
        const config = userData as TrainingConfig & { user_profiles: UserProfile; platform_connections: PlatformConnection[] }
        const profile = config.user_profiles
        const connections = config.platform_connections

        console.log(`Processing user: ${profile.email}, connections: ${connections.length}`)

        // Find the preferred platform connection
        const preferredPlatform = profile.preferred_platform || 'garmin'
        const connection = connections.find(c => c.platform === preferredPlatform && c.status === 'active')
          || connections.find(c => c.status === 'active')

        if (!connection) {
          results.errors.push(`No active connection for user ${profile.email}`)
          results.failed++
          continue
        }

        // Fetch data from platform (30 days for baseline calculation)
        console.log(`Fetching data from ${connection.platform}...`)
        let platformData: AllPlatformData

        if (connection.platform === 'garmin') {
          let tokens = decryptTokens<GarminOAuthTokens>(connection.tokens_encrypted, connection.iv)
          const adapter = new GarminAdapter()
          if (!adapter.isTokenValid(tokens)) {
            const refreshResult = await adapter.refreshTokens(tokens)
            if (refreshResult.success && refreshResult.tokens) {
              tokens = refreshResult.tokens as GarminOAuthTokens
              const encrypted = encryptTokens(tokens)
              await (supabase as any).from('platform_connections').update({
                tokens_encrypted: encrypted.tokens_encrypted,
                iv: encrypted.iv,
                updated_at: new Date().toISOString(),
              }).eq('id', connection.id)
            }
          }
          platformData = await adapter.getAllData(tokens, 30)  // 30 days for rolling baseline
        } else {
          const tokens = decryptTokens<StravaTokens>(connection.tokens_encrypted, connection.iv)
          const adapter = new StravaAdapter()
          platformData = await adapter.getAllData(tokens, 30)  // 30 days for rolling baseline
        }
        console.log(`Fetched platform data: ${platformData.activities.length} activities`)

        // Calculate updated baseline from actual training history
        const baselineUpdate = calculateUpdatedBaseline(platformData.activities, config.current_weekly_mileage)
        console.log(`Baseline update for ${profile.email}:`, {
          previous: baselineUpdate.previousBaseline,
          new: baselineUpdate.newBaseline,
          change: `${baselineUpdate.changePercent > 0 ? '+' : ''}${baselineUpdate.changePercent}%`,
          reasoning: baselineUpdate.reasoning
        })

        // Update baseline in database if changed
        if (baselineUpdate.newBaseline !== baselineUpdate.previousBaseline) {
          const { error: updateError } = await (supabase as any)
            .from('training_configs')
            .update({ current_weekly_mileage: baselineUpdate.newBaseline })
            .eq('user_id', profile.id)

          if (updateError) {
            console.error(`Failed to update baseline for ${profile.email}:`, updateError)
            // Continue anyway - use new baseline for this plan generation
          } else {
            console.log(`✓ Updated baseline: ${baselineUpdate.previousBaseline} → ${baselineUpdate.newBaseline} mi/week`)
          }

          // Update config object with new baseline for plan generation
          config.current_weekly_mileage = baselineUpdate.newBaseline
        }

        // Analyze data
        const analysis = analyzeTrainingData(platformData)

        // Generate training plan (with updated baseline)
        const plan = generateTrainingPlan(config, analysis)

        // Generate email
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://runplan.fun'
        const goalsUrl = `${appUrl}/dashboard`
        const emailHtml = generateEmailHtml(profile, config, analysis, plan, platformData, goalsUrl)
        const emailSubject = generateEmailSubject(config)

        // Send email via Resend
        // Note: Using Resend's test domain. For production, verify your own domain in Resend.
        console.log(`Sending email to: ${profile.email}`)
        console.log(`Subject: ${emailSubject}`)

        const { data: sendData, error: sendError } = await getResend().emails.send({
          from: 'Fitness Weekly <onboarding@resend.dev>',
          to: profile.email,
          subject: emailSubject,
          html: emailHtml,
        })

        console.log('Resend response:', { sendData, sendError })

        if (sendError) {
          throw new Error(`Email send error: ${sendError.message}`)
        }

        // Record email in history
        await (supabase as any).from('email_history').insert({
          user_id: profile.id,
          platform: connection.platform,
          status: 'sent',
        })

        results.sent++
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(errorMsg)
        results.failed++

        // Record failed email
        const failedProfile = (userData as any).user_profiles as UserProfile
        await (supabase as any).from('email_history').insert({
          user_id: failedProfile.id,
          platform: 'garmin',
          status: 'failed',
          error_message: errorMsg,
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${usersToEmail.length} users`,
      results,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET for Vercel Cron
export async function GET(request: NextRequest) {
  return POST(request)
}
