import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server'
import { decryptTokens } from '@/lib/encryption'
import { GarminAdapter } from '@/lib/platforms/garmin/adapter'
import { StravaAdapter } from '@/lib/platforms/strava/adapter'
import { analyzeTrainingData, AnalysisResults } from '@/lib/training/analyzer'
import { generateTrainingPlan, TrainingPlan } from '@/lib/training/planner'
import type { GarminTokens, StravaTokens, AllPlatformData } from '@/lib/platforms/interface'
import type { TrainingConfig } from '@/lib/database.types'

// Cache validity in days
const CACHE_VALIDITY_DAYS = 7

interface GeneratedPlanResponse {
  plan: TrainingPlan
  analysis: AnalysisResults
  cached: boolean
  generatedAt: string
}

/**
 * POST /api/generate-plan
 *
 * Generates a personalized training plan based on the user's fitness data.
 * Requires authentication. Results are cached to avoid excessive API calls.
 *
 * Query params:
 * - force=true: Force regenerate even if cached plan exists
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for force refresh
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('force') === 'true'

    // Use admin client for database operations (RLS is already applied via user context)
    const adminClient = createAdminClient()

    // Check for cached plan (unless force refresh)
    if (!forceRefresh) {
      const { data: cachedPlan } = await adminClient
        .from('generated_plans')
        .select('plan_json, analysis_json, created_at')
        .eq('user_id', user.id)
        .single()

      if (cachedPlan) {
        const createdAt = new Date(cachedPlan.created_at)
        const cacheAge = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

        if (cacheAge < CACHE_VALIDITY_DAYS) {
          const response: GeneratedPlanResponse = {
            plan: cachedPlan.plan_json as unknown as TrainingPlan,
            analysis: cachedPlan.analysis_json as unknown as AnalysisResults,
            cached: true,
            generatedAt: cachedPlan.created_at,
          }
          return NextResponse.json(response)
        }
      }
    }

    // Get user's training config
    const { data: config, error: configError } = await adminClient
      .from('training_configs')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (configError || !config) {
      return NextResponse.json(
        { error: 'No training configuration found. Please set up your goals first.' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 400 }
      )
    }

    // Get platform connections
    const { data: connections, error: connError } = await adminClient
      .from('platform_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (connError || !connections || connections.length === 0) {
      return NextResponse.json(
        { error: 'No active platform connections. Please connect Garmin or Strava first.' },
        { status: 400 }
      )
    }

    // Find the preferred platform connection
    const preferredPlatform = profile.preferred_platform || 'garmin'
    const connection = connections.find(c => c.platform === preferredPlatform)
      || connections[0]

    // Fetch data from the connected platform
    let platformData: AllPlatformData

    if (connection.platform === 'garmin') {
      const tokens = decryptTokens<GarminTokens>(connection.tokens_encrypted, connection.iv)
      const adapter = new GarminAdapter()
      platformData = await adapter.getAllData(tokens, 28) // 28 days for better analysis
    } else {
      const tokens = decryptTokens<StravaTokens>(connection.tokens_encrypted, connection.iv)
      const adapter = new StravaAdapter()
      platformData = await adapter.getAllData(tokens, 28)
    }

    // Analyze the data
    const analysis = analyzeTrainingData(platformData)

    // Generate the training plan
    const plan = generateTrainingPlan(config as TrainingConfig, analysis)

    // Cache the generated plan (upsert)
    await adminClient
      .from('generated_plans')
      .upsert({
        user_id: user.id,
        plan_json: plan as unknown as Record<string, unknown>,
        analysis_json: analysis as unknown as Record<string, unknown>,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    const response: GeneratedPlanResponse = {
      plan,
      analysis,
      cached: false,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating plan:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate plan' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/generate-plan
 *
 * Get the cached plan without regenerating.
 */
export async function GET() {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Get cached plan
    const { data: cachedPlan, error: cacheError } = await adminClient
      .from('generated_plans')
      .select('plan_json, analysis_json, created_at')
      .eq('user_id', user.id)
      .single()

    if (cacheError || !cachedPlan) {
      return NextResponse.json({ plan: null, cached: false })
    }

    const response: GeneratedPlanResponse = {
      plan: cachedPlan.plan_json as unknown as TrainingPlan,
      analysis: cachedPlan.analysis_json as unknown as AnalysisResults,
      cached: true,
      generatedAt: cachedPlan.created_at,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching cached plan:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch plan' },
      { status: 500 }
    )
  }
}
