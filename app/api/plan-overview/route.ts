import { NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'
import { generatePlanProjection, WeekProjection } from '@/lib/training/planner'
import type { TrainingConfig, PlanModification } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

interface PlanOverviewResponse {
  projection: WeekProjection[]
  modifications: PlanModification[]
  summary: {
    totalWeeks: number
    currentWeek: number
    peakMileageWeek: number
    raceDate: string | null
  }
}

/**
 * GET /api/plan-overview
 *
 * Returns the full training plan projection from now until race date,
 * along with any historical modifications due to recovery adjustments.
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

    const trainingConfig = config as TrainingConfig

    // Check if user has a race goal with a date
    if (trainingConfig.goal_category !== 'race' || !trainingConfig.goal_date) {
      return NextResponse.json(
        { error: 'Plan overview is only available for race goals with a target date.' },
        { status: 400 }
      )
    }

    // Generate the projection
    const projection = generatePlanProjection(trainingConfig)

    // Get historical modifications
    const { data: modifications, error: modError } = await (adminClient as any)
      .from('plan_modifications')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start_date', { ascending: true }) as { data: PlanModification[] | null; error: any }

    if (modError) {
      console.error('Error fetching modifications:', modError)
    }

    // Calculate summary
    let peakMileageWeek = 1
    let peakMileage = 0
    projection.forEach((week, idx) => {
      if (week.projectedMileage > peakMileage) {
        peakMileage = week.projectedMileage
        peakMileageWeek = idx + 1
      }
    })

    const response: PlanOverviewResponse = {
      projection,
      modifications: modifications || [],
      summary: {
        totalWeeks: projection.length,
        currentWeek: 1,
        peakMileageWeek,
        raceDate: trainingConfig.goal_date,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching plan overview:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch plan overview' },
      { status: 500 }
    )
  }
}
