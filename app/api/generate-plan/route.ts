import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server'
import { decryptTokens } from '@/lib/encryption'
import { GarminAdapter } from '@/lib/platforms/garmin/adapter'
import { StravaAdapter } from '@/lib/platforms/strava/adapter'
import { analyzeTrainingData, AnalysisResults } from '@/lib/training/analyzer'
import { generateTrainingPlan, TrainingPlan, calculateRecoveryAdjustment, getRecoveryConcerns } from '@/lib/training/planner'
import type { GarminOAuthTokens, StravaTokens, AllPlatformData } from '@/lib/platforms/interface'
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: cachedPlan } = await (adminClient as any)
        .from('generated_plans')
        .select('plan_json, analysis_json, created_at')
        .eq('user_id', user.id)
        .single()

      const typedCachedPlan = cachedPlan as { plan_json: any; analysis_json: any; created_at: string } | null

      if (typedCachedPlan) {
        const createdAt = new Date(typedCachedPlan.created_at)
        const cacheAge = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

        if (cacheAge < CACHE_VALIDITY_DAYS) {
          const response: GeneratedPlanResponse = {
            plan: typedCachedPlan.plan_json as TrainingPlan,
            analysis: typedCachedPlan.analysis_json as AnalysisResults,
            cached: true,
            generatedAt: typedCachedPlan.created_at,
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
    const userProfile = profile as { preferred_platform?: string }
    const platformConnections = connections as Array<{ platform: string; tokens_encrypted: string; iv: string }>
    const preferredPlatform = userProfile.preferred_platform || 'garmin'
    const connection = platformConnections.find(c => c.platform === preferredPlatform)
      || platformConnections[0]

    // Fetch data from the connected platform
    let platformData: AllPlatformData

    if (connection.platform === 'garmin') {
      const tokens = decryptTokens<GarminOAuthTokens>(connection.tokens_encrypted, connection.iv)
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
    await (adminClient as any)
      .from('generated_plans')
      .upsert({
        user_id: user.id,
        plan_json: plan,
        analysis_json: analysis,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    // Record modification if recovery adjustment was applied
    const recoveryAdjustment = calculateRecoveryAdjustment(analysis)
    if (recoveryAdjustment < 1.0) {
      const concerns = getRecoveryConcerns(analysis)
      const trainingConfig = config as TrainingConfig

      // Calculate original mileage (without recovery adjustment)
      const PHASE_MULTIPLIERS: Record<string, number> = {
        base: 0.85, build: 1.0, peak: 1.1, taper: 0.6, race_week: 0.3,
      }
      const INTENSITY_MULTIPLIERS: Record<string, number> = {
        conservative: 0.85, normal: 1.0, aggressive: 1.15,
      }
      const phaseMultiplier = PHASE_MULTIPLIERS[plan.week_summary.training_phase] || 1.0
      const intensityMultiplier = INTENSITY_MULTIPLIERS[trainingConfig.intensity_preference || 'normal'] || 1.0
      const originalMileage = Math.round(trainingConfig.current_weekly_mileage * phaseMultiplier * intensityMultiplier)

      // Get the start of the current week (Monday)
      const today = new Date()
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1)
      const weekStart = new Date(today.setDate(diff))
      weekStart.setHours(0, 0, 0, 0)

      await (adminClient as any)
        .from('plan_modifications')
        .upsert({
          user_id: user.id,
          week_start_date: weekStart.toISOString().split('T')[0],
          original_mileage: originalMileage,
          adjusted_mileage: plan.week_summary.total_miles,
          recovery_adjustment: recoveryAdjustment,
          concerns,
          phase: plan.week_summary.training_phase,
        }, {
          onConflict: 'user_id,week_start_date'
        })
    }

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
    const { data: cachedPlan, error: cacheError } = await (adminClient as any)
      .from('generated_plans')
      .select('plan_json, analysis_json, created_at')
      .eq('user_id', user.id)
      .single() as { data: { plan_json: any; analysis_json: any; created_at: string } | null; error: any }

    if (cacheError || !cachedPlan) {
      return NextResponse.json({ plan: null, cached: false })
    }

    const response: GeneratedPlanResponse = {
      plan: cachedPlan.plan_json as TrainingPlan,
      analysis: cachedPlan.analysis_json as AnalysisResults,
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
