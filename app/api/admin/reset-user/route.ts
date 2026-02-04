import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createAdminClient } from '@/lib/supabase-server'
import type { Database } from '@/lib/database.types'

const ADMIN_EMAIL = 'smangalick@gmail.com'

/**
 * POST /api/admin/reset-user
 *
 * Admin endpoint to reset user state for testing.
 * Supports resetting: onboarding, connections, config, or all.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, action } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action are required' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const results: string[] = []

    // Reset onboarding status
    if (action === 'onboarding' || action === 'all') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (adminClient as any)
        .from('user_profiles')
        .update({
          onboarding_status: 'not_started',
          onboarding_completed_at: null,
        })
        .eq('id', userId)

      if (error) {
        return NextResponse.json({ error: `Failed to reset onboarding: ${error.message}` }, { status: 500 })
      }
      results.push('onboarding status reset')
    }

    // Delete platform connections
    if (action === 'connections' || action === 'all') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (adminClient as any)
        .from('platform_connections')
        .delete()
        .eq('user_id', userId)

      if (error) {
        return NextResponse.json({ error: `Failed to delete connections: ${error.message}` }, { status: 500 })
      }
      results.push('platform connections deleted')
    }

    // Delete training config
    if (action === 'config' || action === 'all') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (adminClient as any)
        .from('training_configs')
        .delete()
        .eq('user_id', userId)

      if (error) {
        return NextResponse.json({ error: `Failed to delete config: ${error.message}` }, { status: 500 })
      }
      results.push('training config deleted')
    }

    // Delete generated plans
    if (action === 'plans' || action === 'all') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (adminClient as any)
        .from('generated_plans')
        .delete()
        .eq('user_id', userId)

      if (error) {
        return NextResponse.json({ error: `Failed to delete plans: ${error.message}` }, { status: 500 })
      }
      results.push('generated plans deleted')
    }

    return NextResponse.json({
      success: true,
      message: results.join(', '),
    })
  } catch (error) {
    console.error('Admin reset error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
