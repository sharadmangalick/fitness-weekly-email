import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createAdminClient } from '@/lib/supabase-server'
import { generateEmailHtml } from '@/lib/training/emailer'
import {
  sampleUserProfile,
  sampleTrainingConfig,
  sampleAnalysisResults,
  sampleTrainingPlan,
  samplePlatformData,
} from '@/lib/sample-data'
import type { Database } from '@/lib/database.types'
import type { DistanceUnit } from '@/lib/platforms/interface'

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic'

/**
 * GET /api/preview-email
 *
 * Returns training email HTML for preview.
 * - If user is authenticated and has a cached plan, uses their real data
 * - Otherwise, falls back to sample data
 */
export async function GET() {
  try {
    // Try to get authenticated user
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    // If authenticated, try to get their real plan
    if (user) {
      const adminClient = createAdminClient()

      // Get cached plan
      const { data: cachedPlan } = await (adminClient as any)
        .from('generated_plans')
        .select('plan_json, analysis_json')
        .eq('user_id', user.id)
        .single()

      // Get user profile
      const { data: profile } = await adminClient
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Get training config
      const { data: config } = await adminClient
        .from('training_configs')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Get platform connection to determine data source
      const { data: connection } = await (adminClient as any)
        .from('platform_connections')
        .select('platform')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      // If we have all the data, use the real plan
      if (cachedPlan && profile && config) {
        const distanceUnit = ((profile as any).distance_unit as DistanceUnit) || 'mi'
        // Note: For preview, we pass null for platformData since we don't fetch it here
        // The actual cron job will pass real data
        const html = generateEmailHtml(
          profile as any,
          config as any,
          cachedPlan.analysis_json,
          cachedPlan.plan_json,
          null, // platformData not fetched for preview
          undefined,
          connection?.platform as 'garmin' | 'strava' | undefined,
          distanceUnit
        )

        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        })
      }
    }

    // Fall back to sample data
    const html = generateEmailHtml(
      sampleUserProfile,
      sampleTrainingConfig,
      sampleAnalysisResults,
      sampleTrainingPlan,
      samplePlatformData,
      undefined
    )

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating preview email:', error)
    return NextResponse.json(
      { error: 'Failed to generate email preview' },
      { status: 500 }
    )
  }
}
