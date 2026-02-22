import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { Resend } from 'resend'

let resend: Resend | null = null
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '')
  return cronSecret === process.env.CRON_SECRET
}

function buildMigrationEmail(name: string | null): string {
  const displayName = name || 'Runner'
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:12px 12px 0 0;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">RunPlan.fun</h1>
    </div>
    <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;">
      <h2 style="color:#1e293b;margin:0 0 16px;">Hi ${displayName},</h2>
      <p style="color:#475569;line-height:1.6;margin:0 0 16px;">
        Great news! We've upgraded RunPlan to use <strong>Garmin's official production API</strong>. This means better reliability and a more stable connection for your training data.
      </p>
      <p style="color:#475569;line-height:1.6;margin:0 0 24px;">
        To continue receiving your personalized weekly training plans, you'll need to reconnect your Garmin account. It only takes a few seconds.
      </p>
      <div style="text-align:center;margin:0 0 24px;">
        <a href="https://www.runplan.fun/dashboard" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">
          Reconnect Now
        </a>
      </div>
      <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0;">
        If you have any questions, just reply to this email. Happy running!
      </p>
    </div>
    <div style="text-align:center;padding:16px;color:#94a3b8;font-size:12px;">
      RunPlan.fun &mdash; Your AI Running Coach
    </div>
  </div>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get all users with expired Garmin connections
    const { data: expiredConnections, error: connError } = await (supabase as any)
      .from('platform_connections')
      .select('user_id, platform, status')
      .eq('platform', 'garmin')
      .eq('status', 'expired') as { data: any[] | null; error: any }

    if (connError) {
      console.error('Error querying expired connections:', connError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!expiredConnections || expiredConnections.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, skipped: 0, message: 'No expired Garmin connections found' })
    }

    const userIds = expiredConnections.map(c => c.user_id)

    // Get user profiles for these users
    const { data: profiles, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('id, email, name')
      .in('id', userIds) as { data: any[] | null; error: any }

    if (profileError) {
      console.error('Error querying user profiles:', profileError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, skipped: 0, message: 'No profiles found for expired connections' })
    }

    // Check which users have already been notified
    const { data: alreadyNotified } = await (supabase as any)
      .from('email_history')
      .select('user_id')
      .in('user_id', userIds)
      .eq('error_message', 'migration_notification') as { data: any[] | null }

    const notifiedIds = new Set((alreadyNotified || []).map((n: any) => n.user_id))

    // Check which users have already reconnected (active Garmin connection)
    const { data: reconnected } = await (supabase as any)
      .from('platform_connections')
      .select('user_id')
      .eq('platform', 'garmin')
      .eq('status', 'active')
      .in('user_id', userIds) as { data: any[] | null }

    const reconnectedIds = new Set((reconnected || []).map((r: any) => r.user_id))

    let sent = 0
    let failed = 0
    let skipped = 0

    for (const profile of profiles) {
      // Skip already notified or reconnected users
      if (notifiedIds.has(profile.id) || reconnectedIds.has(profile.id)) {
        skipped++
        continue
      }

      if (!profile.email) {
        skipped++
        continue
      }

      try {
        const html = buildMigrationEmail(profile.name)
        const r = getResend()

        await r.emails.send({
          from: 'RunPlan.fun <noreply@runplan.fun>',
          to: profile.email,
          subject: 'Action Required: Reconnect Your Garmin Account',
          html,
        })

        // Record in email_history for idempotency
        await (supabase as any).from('email_history').insert({
          user_id: profile.id,
          email_type: 'migration',
          error_message: 'migration_notification',
          sent_at: new Date().toISOString(),
        })

        sent++
        console.log(`Migration email sent to ${profile.email}`)
      } catch (err) {
        failed++
        console.error(`Failed to send migration email to ${profile.email}:`, err)
      }
    }

    return NextResponse.json({ sent, failed, skipped })
  } catch (err) {
    console.error('Migration notify error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
