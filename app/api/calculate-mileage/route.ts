import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server'
import { decryptTokens, encryptTokens } from '@/lib/encryption'
import { GarminAdapter } from '@/lib/platforms/garmin/adapter'
import { StravaAdapter } from '@/lib/platforms/strava/adapter'
import { calculateWeeklyMileage } from '@/lib/training/mileage-calculator'
import type { GarminOAuthTokens, StravaTokens } from '@/lib/platforms/interface'

interface CalculateMileageResponse {
  mileage: number | null
  confidence: 'high' | 'medium' | 'low' | null
  weeksAnalyzed?: number
  totalRunCount?: number
  error?: string
}

/**
 * GET /api/calculate-mileage
 *
 * Fetches platform activity data and calculates average weekly mileage
 * from the last 4 weeks of running activities.
 */
export async function GET() {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json<CalculateMileageResponse>(
        { mileage: null, confidence: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // Get user profile for preferred platform
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('preferred_platform')
      .eq('id', user.id)
      .single()

    // Get platform connections
    const { data: connections, error: connError } = await adminClient
      .from('platform_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (connError || !connections || connections.length === 0) {
      // No platform connected - return null (not an error, just no data)
      return NextResponse.json<CalculateMileageResponse>({
        mileage: null,
        confidence: null
      })
    }

    // Find the preferred platform connection
    const userProfile = profile as { preferred_platform?: string } | null
    const platformConnections = connections as Array<{ id: string; platform: string; tokens_encrypted: string; iv: string }>
    const preferredPlatform = userProfile?.preferred_platform || 'garmin'
    const connection = platformConnections.find(c => c.platform === preferredPlatform)
      || platformConnections[0]

    // Fetch data from the connected platform (28 days for 4 complete weeks)
    let activities
    try {
      if (connection.platform === 'garmin') {
        let tokens = decryptTokens<GarminOAuthTokens>(connection.tokens_encrypted, connection.iv)
        const adapter = new GarminAdapter()
        if (!adapter.isTokenValid(tokens)) {
          const refreshResult = await adapter.refreshTokens(tokens)
          if (refreshResult.success && refreshResult.tokens) {
            tokens = refreshResult.tokens as GarminOAuthTokens
            const encrypted = encryptTokens(tokens)
            await (adminClient as any).from('platform_connections').update({
              tokens_encrypted: encrypted.tokens_encrypted,
              iv: encrypted.iv,
              updated_at: new Date().toISOString(),
            }).eq('id', connection.id)
          }
        }
        const platformData = await adapter.getAllData(tokens, 28)
        activities = platformData.activities
      } else {
        const tokens = decryptTokens<StravaTokens>(connection.tokens_encrypted, connection.iv)
        const adapter = new StravaAdapter()
        const platformData = await adapter.getAllData(tokens, 28)
        activities = platformData.activities
      }
    } catch (platformError) {
      console.error('Error fetching platform data:', platformError)
      // Platform API error - return null silently
      return NextResponse.json<CalculateMileageResponse>({
        mileage: null,
        confidence: null
      })
    }

    // Calculate weekly mileage
    const summary = calculateWeeklyMileage(activities)

    return NextResponse.json<CalculateMileageResponse>({
      mileage: summary.calculatedMileage,
      confidence: summary.confidence,
      weeksAnalyzed: summary.weeksAnalyzed,
      totalRunCount: summary.totalRunCount
    })
  } catch (error) {
    console.error('Error calculating mileage:', error)
    return NextResponse.json<CalculateMileageResponse>(
      { mileage: null, confidence: null, error: 'Failed to calculate mileage' },
      { status: 500 }
    )
  }
}
