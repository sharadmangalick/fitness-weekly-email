/**
 * Garmin Webhook Data Reader
 *
 * Reads health data from stored Garmin webhook deliveries in Supabase and
 * normalizes it into the same AllPlatformData format used by the pull API.
 *
 * Source-of-truth field mapping (per Garmin Health API as observed
 * 2026-04-27):
 *
 * - `daily_summary` (Garmin "dailies"): steps, distances, calories,
 *   stress (averageStressLevel), active/vigorous minutes. Does NOT
 *   contain restingHeartRate or bodyBatteryHighestValue despite the
 *   webhook name.
 * - `sleep` (Garmin "sleeps"): full sleep durations + sleep scores.
 * - `health_snapshot` (Garmin "healthSnapshot"): aggregate min/avg/max
 *   for resting HR plus body battery readings; this is where RHR + BB
 *   actually live for our purposes.
 * - `heart_rate` (Garmin "epochs"): 15-minute activity intensity
 *   buckets — no HR value despite the label. Ignored here.
 * - `user_metrics`: VO2 max + fitness age. Reserved for future use.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  SleepData,
  DailySummary,
  HeartRateData,
  AllPlatformData,
  VO2MaxData,
  Activity,
} from '../interface'
import { metersToMiles, normalizeActivityType, formatPace, secondsToMinutes } from '../interface'
import { log } from '@/lib/logging'

interface HealthSnapshotSummary {
  summaryType?: string
  minValue?: number
  maxValue?: number
  avgValue?: number
}

interface HealthSnapshotPayload {
  calendarDate?: string
  startTimeInSeconds?: number
  summaries?: HealthSnapshotSummary[]
  bodyBatteryHigh?: number
  bodyBatteryLow?: number
  bodyBatteryAverage?: number
  bodyBatteryCharged?: number
  bodyBatteryDrained?: number
  restingHeartRate?: number
}

interface UserMetricsPayload {
  calendarDate?: string
  vo2Max?: number
  vo2MaxRunning?: number
  fitnessAge?: number
}

interface ActivityWebhookPayload {
  activityId?: number | string
  activityName?: string
  activityType?: string
  startTimeInSeconds?: number
  durationInSeconds?: number
  distanceInMeters?: number
  activeKilocalories?: number
  averageHeartRateInBeatsPerMinute?: number
  maxHeartRateInBeatsPerMinute?: number
  averageRunCadenceInStepsPerMinute?: number
  totalElevationGainInMeters?: number
  deviceName?: string
}

function normalizeWebhookActivity(p: ActivityWebhookPayload): Activity | null {
  if (!p.activityId || !p.startTimeInSeconds) return null
  const distanceMiles = metersToMiles(p.distanceInMeters || 0)
  const durationMinutes = secondsToMinutes(p.durationInSeconds || 0)
  return {
    id: String(p.activityId),
    date: new Date(p.startTimeInSeconds * 1000),
    type: normalizeActivityType((p.activityType || 'other').toLowerCase()),
    name: p.activityName || 'Activity',
    distance_miles: Math.round(distanceMiles * 100) / 100,
    duration_minutes: Math.round(durationMinutes * 10) / 10,
    avg_pace_per_mile: formatPace(durationMinutes, distanceMiles),
    avg_hr: p.averageHeartRateInBeatsPerMinute,
    max_hr: p.maxHeartRateInBeatsPerMinute,
    elevation_gain_ft: p.totalElevationGainInMeters
      ? Math.round(p.totalElevationGainInMeters * 3.28084)
      : undefined,
    calories: p.activeKilocalories,
    avg_cadence: p.averageRunCadenceInStepsPerMinute,
    device_name: p.deviceName,
  }
}

/**
 * Read Garmin health data from webhook deliveries stored in Supabase.
 * Returns normalized sleep, daily summary, heart rate, and VO2 max data.
 */
export async function getWebhookHealthData(
  supabase: SupabaseClient,
  userId: string,
  days: number,
): Promise<{
  sleep: SleepData[]
  dailySummaries: DailySummary[]
  heartRate: HeartRateData[]
  vo2max: VO2MaxData[]
  activities: Activity[]
}> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: webhooks, error } = await (supabase as any)
    .from('garmin_webhook_deliveries')
    .select('webhook_type, payload, created_at')
    .eq('user_id', userId)
    .in('webhook_type', ['sleep', 'daily_summary', 'health_snapshot', 'user_metrics', 'activity'])
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    log('error', 'Failed to read webhook deliveries', { error, userId })
    return { sleep: [], dailySummaries: [], heartRate: [], vo2max: [], activities: [] }
  }

  if (!webhooks || webhooks.length === 0) {
    return { sleep: [], dailySummaries: [], heartRate: [], vo2max: [], activities: [] }
  }

  const sleep: SleepData[] = []
  const dailySummaries: DailySummary[] = []
  const heartRate: HeartRateData[] = []
  const vo2max: VO2MaxData[] = []
  const activities: Activity[] = []

  // Deduplicate by date (newest webhook first due to order above)
  const seenSleepDates = new Set<string>()
  const seenDailyDates = new Set<string>()
  const seenHRDates = new Set<string>()
  const seenVO2Dates = new Set<string>()
  // Activities are deduped by activityId, not date — a user can do multiple
  // runs on the same day.
  const seenActivityIds = new Set<string>()

  for (const webhook of webhooks) {
    const p = webhook.payload
    if (!p) continue

    switch (webhook.webhook_type) {
      case 'sleep': {
        const date = p.calendarDate || ''
        if (!date || seenSleepDates.has(date)) break
        seenSleepDates.add(date)

        if (p.durationInSeconds) {
          sleep.push({
            date,
            total_sleep_hours: (p.durationInSeconds || 0) / 3600,
            deep_sleep_hours: (p.deepSleepDurationInSeconds || 0) / 3600,
            light_sleep_hours: (p.lightSleepDurationInSeconds || 0) / 3600,
            rem_sleep_hours: (p.remSleepInSeconds || 0) / 3600,
            awake_hours: (p.awakeDurationInSeconds || 0) / 3600,
            sleep_score: p.overallSleepScore ?? p.sleepScores?.overall?.value,
          })
        }
        break
      }
      case 'daily_summary': {
        const date = p.calendarDate || ''
        if (!date || seenDailyDates.has(date)) break
        seenDailyDates.add(date)

        // RHR + body battery do NOT live in this payload despite the
        // webhook name; see the file header. Don't read them here.
        dailySummaries.push({
          date,
          steps: p.steps || 0,
          total_distance_miles: p.distanceInMeters ? metersToMiles(p.distanceInMeters) : undefined,
          active_calories: p.activeKilocalories,
          total_calories: p.bmrKilocalories,
          sedentary_minutes: undefined,
          active_minutes: p.activeTimeInSeconds ? Math.round(p.activeTimeInSeconds / 60) : undefined,
          vigorous_minutes: p.vigorousIntensityDurationInSeconds
            ? Math.round(p.vigorousIntensityDurationInSeconds / 60)
            : undefined,
          stress_level: p.averageStressLevel,
        })
        break
      }
      case 'health_snapshot': {
        const snapshot = p as HealthSnapshotPayload
        const date = snapshot.calendarDate || ''
        if (!date) break

        // Resting HR — Garmin embeds vitals in summaries[]; we accept
        // either the array form or a top-level field for forward compat.
        const hrSummary = snapshot.summaries?.find(s => s.summaryType?.toLowerCase().includes('heart_rate'))
        const restingHr = snapshot.restingHeartRate ?? hrSummary?.minValue
        const maxHr = hrSummary?.maxValue
        const avgHr = hrSummary?.avgValue

        if (restingHr && restingHr > 0 && !seenHRDates.has(date)) {
          seenHRDates.add(date)
          heartRate.push({
            date,
            resting_hr: restingHr,
            max_hr: maxHr,
            avg_hr: avgHr,
          })
        }

        // Body battery — both legacy (top-level fields) and current
        // (summaries[].summaryType === 'body_battery') shapes supported.
        const bbSummary = snapshot.summaries?.find(s => s.summaryType?.toLowerCase().includes('body_battery'))
        const bbHigh = snapshot.bodyBatteryHigh ?? bbSummary?.maxValue
        const bbLow = snapshot.bodyBatteryLow ?? bbSummary?.minValue
        const bbAvg = snapshot.bodyBatteryAverage ?? bbSummary?.avgValue

        if ((bbHigh || bbLow || bbAvg) && !seenDailyDates.has(date)) {
          // Build a partial dailySummary so the analyzer can read body battery.
          // If a daily_summary already exists for this date, mergeByDate
          // (called from mergeWithWebhookData) keeps both sources in sync.
          dailySummaries.push({
            date,
            steps: 0,
            body_battery_high: bbHigh,
            body_battery_low: bbLow,
            body_battery_charged: snapshot.bodyBatteryCharged,
            body_battery_drained: snapshot.bodyBatteryDrained,
          })
        }
        break
      }
      case 'user_metrics': {
        const metrics = p as UserMetricsPayload
        const date = metrics.calendarDate || ''
        const vo2 = metrics.vo2MaxRunning ?? metrics.vo2Max
        if (!date || !vo2 || vo2 <= 0 || seenVO2Dates.has(date)) break
        seenVO2Dates.add(date)
        vo2max.push({ date, vo2max: vo2 })
        break
      }
      case 'activity': {
        const aid = String(p.activityId ?? '')
        if (!aid || seenActivityIds.has(aid)) break
        seenActivityIds.add(aid)
        const activity = normalizeWebhookActivity(p as ActivityWebhookPayload)
        if (activity) activities.push(activity)
        break
      }
    }
  }

  log('info', 'Webhook health data loaded', {
    userId,
    sleepDays: sleep.length,
    dailySummaryDays: dailySummaries.length,
    heartRateDays: heartRate.length,
    vo2maxDays: vo2max.length,
    activities: activities.length,
  })

  return { sleep, dailySummaries, heartRate, vo2max, activities }
}

/**
 * Merge by date: combine pull API data with webhook data, preferring webhook
 * entries when both sources have data for the same date.
 *
 * Special case: dailySummaries can be pushed by both daily_summary (steps,
 * stress) and health_snapshot (body battery). When duplicates by date occur
 * within webhook data alone, merge field-by-field rather than letting the
 * later one clobber the earlier.
 */
function mergeByDate<T extends { date: string }>(pullItems: T[], webhookItems: T[]): T[] {
  const byDate = new Map<string, T>()
  for (const item of pullItems) byDate.set(item.date, item)
  for (const item of webhookItems) {
    const existing = byDate.get(item.date)
    byDate.set(item.date, existing ? { ...existing, ...stripUndefined(item) } : item)
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v
  }
  return out
}

/**
 * Merge daily_summary + health_snapshot derived dailySummaries together,
 * then merge against pull API data.
 */
function mergeDailySummaries(
  pullItems: DailySummary[],
  webhookItems: DailySummary[],
): DailySummary[] {
  const byDate = new Map<string, DailySummary>()
  for (const item of pullItems) byDate.set(item.date, item)
  for (const item of webhookItems) {
    const existing = byDate.get(item.date)
    byDate.set(item.date, existing
      ? { ...existing, ...stripUndefined(item) }
      : item)
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Merge activities by activity id. A user can have multiple runs on
 * the same day, so date-keyed dedup is wrong here.
 */
function mergeActivitiesById(pullItems: Activity[], webhookItems: Activity[]): Activity[] {
  const byId = new Map<string, Activity>()
  for (const item of pullItems) byId.set(item.id, item)
  for (const item of webhookItems) {
    const existing = byId.get(item.id)
    byId.set(item.id, existing ? { ...existing, ...stripUndefined(item) } : item)
  }
  return Array.from(byId.values()).sort((a, b) => b.date.getTime() - a.date.getTime())
}

/**
 * Merge webhook health data into pull API data. Webhook data wins on
 * conflict but null/undefined fields don't clobber valid values.
 *
 * Activities are merged in too — Garmin's pull API can refuse to return
 * activities uploaded outside the current consent window
 * (`InvalidPullTokenException`), so the webhook delivery is often the
 * only record we have of those runs.
 */
export function mergeWithWebhookData(
  pullData: AllPlatformData,
  webhookData: {
    sleep: SleepData[]
    dailySummaries: DailySummary[]
    heartRate: HeartRateData[]
    vo2max?: VO2MaxData[]
    activities?: Activity[]
  },
): AllPlatformData {
  return {
    ...pullData,
    activities: mergeActivitiesById(pullData.activities, webhookData.activities ?? []),
    sleep: mergeByDate(pullData.sleep, webhookData.sleep),
    dailySummaries: mergeDailySummaries(pullData.dailySummaries, webhookData.dailySummaries),
    heartRate: mergeByDate(pullData.heartRate, webhookData.heartRate),
    vo2max: mergeByDate(pullData.vo2max ?? [], webhookData.vo2max ?? []),
  }
}
