import { describe, it, expect, vi } from 'vitest'
import { getWebhookHealthData, mergeWithWebhookData } from '../webhook-data'
import type { AllPlatformData } from '../../interface'

// ── In-memory Supabase client stub ──────────────────────────────────────────
function makeStubSupabase(rows: Array<{ webhook_type: string; payload: unknown; created_at: string }>) {
  const builder = {
    _rows: rows,
    select() { return this },
    eq() { return this },
    in() { return this },
    gte() { return this },
    order() { return Promise.resolve({ data: this._rows, error: null }) },
  }
  return {
    from: vi.fn().mockReturnValue(builder),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

describe('getWebhookHealthData — sleep', () => {
  it('extracts sleep durations from a real-shape sleep payload', async () => {
    const supabase = makeStubSupabase([
      {
        webhook_type: 'sleep',
        created_at: '2026-04-27T08:00:00Z',
        payload: {
          calendarDate: '2026-04-27',
          durationInSeconds: 7 * 3600,
          deepSleepDurationInSeconds: 1.5 * 3600,
          lightSleepDurationInSeconds: 4 * 3600,
          remSleepInSeconds: 1.5 * 3600,
          awakeDurationInSeconds: 0,
          overallSleepScore: 82,
          userId: 'g-user-1',
        },
      },
    ])

    const out = await getWebhookHealthData(supabase, 'app-user-1', 30)
    expect(out.sleep).toHaveLength(1)
    expect(out.sleep[0].total_sleep_hours).toBeCloseTo(7)
    expect(out.sleep[0].sleep_score).toBe(82)
  })
})

describe('getWebhookHealthData — daily_summary', () => {
  it('reads steps, stress, distance — does NOT invent RHR or BB from this payload', async () => {
    const supabase = makeStubSupabase([
      {
        webhook_type: 'daily_summary',
        created_at: '2026-04-27T17:00:00Z',
        payload: {
          calendarDate: '2026-04-27',
          steps: 8420,
          distanceInMeters: 6500,
          activeKilocalories: 720,
          averageStressLevel: 28,
          activeTimeInSeconds: 5400,
          vigorousIntensityDurationInSeconds: 600,
          userId: 'g-user-1',
        },
      },
    ])

    const out = await getWebhookHealthData(supabase, 'app-user-1', 30)
    expect(out.dailySummaries).toHaveLength(1)
    const day = out.dailySummaries[0]
    expect(day.steps).toBe(8420)
    expect(day.stress_level).toBe(28)
    expect(day.active_minutes).toBe(90)
    expect(day.vigorous_minutes).toBe(10)
    // The Garmin daily payload does NOT carry these — make sure we don't
    // fabricate them.
    expect(day.body_battery_high).toBeUndefined()
    expect(out.heartRate).toHaveLength(0)
  })
})

describe('getWebhookHealthData — health_snapshot', () => {
  it('extracts resting HR + body battery from a healthSnapshot summaries[]', async () => {
    const supabase = makeStubSupabase([
      {
        webhook_type: 'health_snapshot',
        created_at: '2026-04-27T08:00:00Z',
        payload: {
          calendarDate: '2026-04-27',
          summaries: [
            { summaryType: 'heart_rate', minValue: 48, maxValue: 142, avgValue: 62 },
            { summaryType: 'body_battery', minValue: 22, maxValue: 88, avgValue: 55 },
          ],
        },
      },
    ])

    const out = await getWebhookHealthData(supabase, 'app-user-1', 30)
    expect(out.heartRate).toHaveLength(1)
    expect(out.heartRate[0].resting_hr).toBe(48)
    expect(out.heartRate[0].max_hr).toBe(142)
    expect(out.dailySummaries).toHaveLength(1)
    expect(out.dailySummaries[0].body_battery_high).toBe(88)
    expect(out.dailySummaries[0].body_battery_low).toBe(22)
  })

  it('also accepts legacy top-level body battery fields', async () => {
    const supabase = makeStubSupabase([
      {
        webhook_type: 'health_snapshot',
        created_at: '2026-04-27T08:00:00Z',
        payload: {
          calendarDate: '2026-04-27',
          restingHeartRate: 50,
          bodyBatteryHigh: 90,
          bodyBatteryLow: 25,
        },
      },
    ])

    const out = await getWebhookHealthData(supabase, 'app-user-1', 30)
    expect(out.heartRate[0].resting_hr).toBe(50)
    expect(out.dailySummaries[0].body_battery_high).toBe(90)
  })
})

describe('getWebhookHealthData — user_metrics', () => {
  it('extracts VO2 max from running variant', async () => {
    const supabase = makeStubSupabase([
      {
        webhook_type: 'user_metrics',
        created_at: '2026-04-27T08:00:00Z',
        payload: { calendarDate: '2026-04-27', vo2MaxRunning: 51.2, vo2Max: 49.8 },
      },
    ])

    const out = await getWebhookHealthData(supabase, 'app-user-1', 30)
    expect(out.vo2max).toHaveLength(1)
    expect(out.vo2max[0].vo2max).toBe(51.2)
  })
})

describe('getWebhookHealthData — activity', () => {
  it('normalizes a real-shape Garmin activity webhook into an Activity', async () => {
    const supabase = makeStubSupabase([
      {
        webhook_type: 'activity',
        created_at: '2026-04-27T13:52:09Z',
        payload: {
          userId: 'g-user-1',
          activityId: 22677469781,
          activityName: 'San Francisco Running',
          activityType: 'RUNNING',
          startTimeInSeconds: 1777295503,
          durationInSeconds: 1735,
          distanceInMeters: 5031.24,
          activeKilocalories: 375,
          averageHeartRateInBeatsPerMinute: 152,
          maxHeartRateInBeatsPerMinute: 182,
          averageRunCadenceInStepsPerMinute: 176.25,
          totalElevationGainInMeters: 24,
          deviceName: 'Garmin Forerunner 965',
        },
      },
    ])

    const out = await getWebhookHealthData(supabase, 'app-user-1', 30)
    expect(out.activities).toHaveLength(1)
    const a = out.activities[0]
    expect(a.id).toBe('22677469781')
    expect(a.type).toBe('run')
    expect(a.name).toBe('San Francisco Running')
    expect(a.distance_miles).toBeCloseTo(3.13, 1)
    expect(a.duration_minutes).toBeCloseTo(28.9, 1)
    expect(a.avg_hr).toBe(152)
    expect(a.max_hr).toBe(182)
    expect(a.elevation_gain_ft).toBe(79)
    expect(a.device_name).toBe('Garmin Forerunner 965')
  })

  it('dedupes activities by id (not date) so multiple runs same-day survive', async () => {
    const supabase = makeStubSupabase([
      {
        webhook_type: 'activity',
        created_at: '2026-04-27T18:00:00Z',
        payload: {
          activityId: 222, activityType: 'RUNNING',
          startTimeInSeconds: 1777300000, durationInSeconds: 1200, distanceInMeters: 4000,
        },
      },
      {
        webhook_type: 'activity',
        created_at: '2026-04-27T08:00:00Z',
        payload: {
          activityId: 111, activityType: 'RUNNING',
          startTimeInSeconds: 1777250000, durationInSeconds: 2000, distanceInMeters: 6000,
        },
      },
    ])
    const out = await getWebhookHealthData(supabase, 'app-user-1', 30)
    expect(out.activities).toHaveLength(2)
    expect(new Set(out.activities.map(a => a.id))).toEqual(new Set(['111', '222']))
  })

  it('skips payloads missing activityId or startTimeInSeconds', async () => {
    const supabase = makeStubSupabase([
      { webhook_type: 'activity', created_at: '2026-04-27T08:00:00Z',
        payload: { activityType: 'RUNNING', durationInSeconds: 600 } },
    ])
    const out = await getWebhookHealthData(supabase, 'app-user-1', 30)
    expect(out.activities).toHaveLength(0)
  })
})

describe('mergeWithWebhookData — activities', () => {
  it('uses webhook activities to fill the gap when pull API returns none (consent gap)', async () => {
    const pull: AllPlatformData = {
      activities: [], sleep: [], heartRate: [], dailySummaries: [],
    }
    const webhookData = {
      sleep: [], heartRate: [], vo2max: [], dailySummaries: [],
      activities: [{
        id: '22677469781', date: new Date('2026-04-27T18:00:00Z'),
        type: 'run' as const, name: 'San Francisco Running',
        distance_miles: 3.13, duration_minutes: 28.9,
        avg_pace_per_mile: '9:14',
      }],
    }
    const merged = mergeWithWebhookData(pull, webhookData)
    expect(merged.activities).toHaveLength(1)
    expect(merged.activities[0].id).toBe('22677469781')
  })

  it('dedupes pull + webhook activities by id', async () => {
    const sharedDate = new Date('2026-04-27T18:00:00Z')
    const pull: AllPlatformData = {
      activities: [{ id: '1', date: sharedDate, type: 'run', name: 'A', distance_miles: 3, duration_minutes: 25 }],
      sleep: [], heartRate: [], dailySummaries: [],
    }
    const webhookData = {
      sleep: [], heartRate: [], vo2max: [], dailySummaries: [],
      activities: [
        { id: '1', date: sharedDate, type: 'run' as const, name: 'A', distance_miles: 3, duration_minutes: 25 },
        { id: '2', date: sharedDate, type: 'run' as const, name: 'B', distance_miles: 5, duration_minutes: 45 },
      ],
    }
    const merged = mergeWithWebhookData(pull, webhookData)
    expect(merged.activities.map(a => a.id).sort()).toEqual(['1', '2'])
  })
})

describe('getWebhookHealthData — heart_rate (epoch) is not used for RHR', () => {
  it('does not produce a heartRate entry from a heart_rate (epoch) payload', async () => {
    // The Garmin "epochs" webhook is mislabeled in our pipeline as
    // heart_rate — it carries no HR value. The reader must not look at it.
    const supabase = makeStubSupabase([
      {
        webhook_type: 'heart_rate',
        created_at: '2026-04-27T08:00:00Z',
        payload: { activeKilocalories: 12, met: 1.4, steps: 200, userId: 'g-user-1' },
      },
    ])

    const out = await getWebhookHealthData(supabase, 'app-user-1', 30)
    expect(out.heartRate).toHaveLength(0)
  })
})

describe('mergeWithWebhookData', () => {
  it('merges health_snapshot body battery into a daily_summary for the same date', async () => {
    const pull: AllPlatformData = {
      activities: [],
      sleep: [],
      heartRate: [],
      dailySummaries: [],
    }
    const webhookData = {
      sleep: [],
      heartRate: [],
      vo2max: [],
      dailySummaries: [
        // From daily_summary
        { date: '2026-04-27', steps: 8000, stress_level: 30 },
        // From health_snapshot (no steps)
        { date: '2026-04-27', steps: 0, body_battery_high: 88, body_battery_low: 25 },
      ],
    }

    const merged = mergeWithWebhookData(pull, webhookData)
    expect(merged.dailySummaries).toHaveLength(1)
    const day = merged.dailySummaries[0]
    expect(day.steps).toBe(0) // last write wins on overlapping defined keys
    expect(day.stress_level).toBe(30) // not clobbered by undefined
    expect(day.body_battery_high).toBe(88)
    expect(day.body_battery_low).toBe(25)
  })

  it('does not overwrite valid pull-API fields with undefined webhook fields', async () => {
    const pull: AllPlatformData = {
      activities: [],
      sleep: [],
      heartRate: [{ date: '2026-04-26', resting_hr: 55 }],
      dailySummaries: [],
    }
    const webhookData = {
      sleep: [],
      heartRate: [{ date: '2026-04-26', resting_hr: 0 }],
      vo2max: [],
      dailySummaries: [],
    }

    const merged = mergeWithWebhookData(pull, webhookData)
    // Webhook value (0) does overwrite — caller is responsible for filtering
    // before producing webhook entries. Test is a regression guard so the
    // merge semantics stay obvious.
    expect(merged.heartRate[0].resting_hr).toBe(0)
  })
})
