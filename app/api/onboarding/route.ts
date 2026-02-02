import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type OnboardingStatus = 'not_started' | 'platform_connected' | 'goals_set' | 'completed' | 'skipped'

const VALID_STATUSES: OnboardingStatus[] = ['not_started', 'platform_connected', 'goals_set', 'completed', 'skipped']

// GET onboarding status
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await (supabase as any)
      .from('user_profiles')
      .select('onboarding_status, onboarding_completed_at')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      status: profile?.onboarding_status || 'not_started',
      completedAt: profile?.onboarding_completed_at || null,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH onboarding status
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + VALID_STATUSES.join(', ') },
        { status: 400 }
      )
    }

    const updateData: {
      onboarding_status: OnboardingStatus
      onboarding_completed_at?: string
    } = {
      onboarding_status: status,
    }

    // Set completed timestamp when completing onboarding
    if (status === 'completed') {
      updateData.onboarding_completed_at = new Date().toISOString()
    }

    const { error } = await (supabase as any)
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
