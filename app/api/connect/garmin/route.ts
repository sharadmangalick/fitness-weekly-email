import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { GarminAdapter } from '@/lib/platforms/garmin/adapter'
import { encryptTokens } from '@/lib/encryption'
import type { Database } from '@/lib/database.types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Connect to Garmin
    const adapter = new GarminAdapter()
    const result = await adapter.connect({ email, password })

    if (!result.success || !result.tokens) {
      return NextResponse.json(
        { error: result.error || 'Failed to connect to Garmin' },
        { status: 400 }
      )
    }

    // Encrypt tokens
    const { tokens_encrypted, iv } = encryptTokens(result.tokens)

    // Calculate expiration (Garmin tokens typically last ~30 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Store connection in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from('platform_connections')
      .upsert({
        user_id: user.id,
        platform: 'garmin',
        tokens_encrypted,
        iv,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      }, { onConflict: 'user_id,platform' })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save connection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Garmin connect error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
