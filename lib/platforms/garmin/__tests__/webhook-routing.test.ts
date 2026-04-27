import { describe, it, expect, vi } from 'vitest'
import { findConnectionByGarminUserId, buildDeliveryRow } from '../webhook-routing'

function makeSupabase(behaviour: 'match' | 'miss' | 'error', match?: { id: string; user_id: string }) {
  const builder = {
    select() { return this },
    eq() { return this },
    maybeSingle() {
      if (behaviour === 'match') return Promise.resolve({ data: match, error: null })
      if (behaviour === 'miss') return Promise.resolve({ data: null, error: null })
      return Promise.resolve({ data: null, error: { message: 'pg down' } })
    },
  }
  return {
    from: vi.fn().mockReturnValue(builder),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

describe('findConnectionByGarminUserId', () => {
  it('returns the matching connection when found', async () => {
    const supabase = makeSupabase('match', { id: 'conn-1', user_id: 'user-1' })
    const conn = await findConnectionByGarminUserId(supabase, 'g-user-1')
    expect(conn).toEqual({ id: 'conn-1', user_id: 'user-1' })
  })

  it('returns null when no match', async () => {
    const supabase = makeSupabase('miss')
    const conn = await findConnectionByGarminUserId(supabase, 'g-user-unknown')
    expect(conn).toBeNull()
  })

  it('returns null on lookup error (does not throw)', async () => {
    const supabase = makeSupabase('error')
    const conn = await findConnectionByGarminUserId(supabase, 'g-user-1')
    expect(conn).toBeNull()
  })

  it('returns null when the Garmin user id is missing/empty', async () => {
    const supabase = makeSupabase('match', { id: 'conn-1', user_id: 'user-1' })
    expect(await findConnectionByGarminUserId(supabase, undefined)).toBeNull()
    expect(await findConnectionByGarminUserId(supabase, '')).toBeNull()
  })
})

describe('buildDeliveryRow', () => {
  it('uses the connection user_id when present', () => {
    const row = buildDeliveryRow({
      connection: { id: 'conn-1', user_id: 'user-1' },
      garminUserId: 'g-user-1',
      webhookType: 'sleep',
      payload: { foo: 'bar' },
    })
    expect(row).toEqual({
      user_id: 'user-1',
      webhook_type: 'sleep',
      garmin_user_id: 'g-user-1',
      payload: { foo: 'bar' },
      processed: false,
      processed_at: null,
    })
  })

  it('persists with user_id=NULL when no connection — preserves data for re-attribution', () => {
    const row = buildDeliveryRow({
      connection: null,
      garminUserId: 'g-user-orphan',
      webhookType: 'daily_summary',
      payload: { calendarDate: '2026-04-27' },
    })
    expect(row.user_id).toBeNull()
    expect(row.garmin_user_id).toBe('g-user-orphan')
  })

  it('honours processed/processedAt overrides for already-processed events', () => {
    const row = buildDeliveryRow({
      connection: { id: 'c', user_id: 'u' },
      garminUserId: 'g',
      webhookType: 'deregistration',
      payload: {},
      processed: true,
      processedAt: '2026-04-27T17:00:00Z',
    })
    expect(row.processed).toBe(true)
    expect(row.processed_at).toBe('2026-04-27T17:00:00Z')
  })
})
