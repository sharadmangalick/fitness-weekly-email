/**
 * Garmin Webhook Data Reader
 *
 * Reads health data from stored Garmin webhook deliveries in Supabase and
 * normalizes it into the same AllPlatformData format used by the pull API.
 *
 * Garmin pushes sleep, daily summaries (with body battery), heart rate, and
 * stress data via webhooks. The pull API often returns empty/incomplete data
 * for these push-preferred types. This module bridges that gap by reading
 * the webhook payloads that Garmin has already pushed.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { SleepData, DailySummary, HeartRateData, AllPlatformData } from '../interface'
import { metersToMiles } from '../interface'
import { log } from '@/lib/logging'

/**
 * Read Garmin health data from webhook deliveries stored in Supabase.
 * Returns normalized sleep, daily summary, and heart rate data.
 */
export async function getWebhookHealthData(
  supabase: SupabaseClient,
  userId: string,
  days: number
): Promise<{ sleep: SleepData[]; dailySummaries: DailySummary[]; heartRate: HeartRateData[] }> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: webhooks, error } = await (supabase as any)
    .from('garmin_webhook_deliveries')
    .select('webhook_type, payload, created_at')
    .eq('user_id', userId)
    .in('webhook_type', ['sleep', 'daily_summary', 'heart_rate'])
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    log('error', 'Failed to read webhook deliveries', { error, userId })
    return { sleep: [], dailySummaries: [], heartRate: [] }
  }

  if (!webhooks || webhooks.length === 0) {
    return { sleep: [], dailySummaries: [], heartRate: [] }
  }

  const sleep: SleepData[] = []
  const dailySummaries: DailySummary[] = []
  const heartRate: HeartRateData[] = []

  // Deduplicate by date (newest webhook first due to order above)
  const seenSleepDates = new Set<string>()
  const seenDailyDates = new Set<string>()
  const seenHRDates = new Set<string>()

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
            sleep_score: p.sleepScores?.overall?.value,
          })
        }
        break
      }
      case 'daily_summary': {
        const date = p.calendarDate || ''
        if (!date || seenDailyDates.has(date)) break
        seenDailyDates.add(date)

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
          body_battery_high: p.bodyBatteryHighestValue,
          body_battery_low: p.bodyBatteryLowestValue,
          body_battery_charged: p.bodyBatteryChargedValue,
          body_battery_drained: p.bodyBatteryDrainedValue,
        })
        break
      }
      case 'heart_rate': {
        const date = p.calendarDate || ''
        if (!date || seenHRDates.has(date)) break
        seenHRDates.add(date)

        if (p.restingHeartRate) {
          heartRate.push({
            date,
            resting_hr: p.restingHeartRate,
            max_hr: p.maxHeartRate,
          })
        }
        break
      }
    }
  }

  log('info', 'Webhook health data loaded', {
    userId,
    sleepDays: sleep.length,
    dailySummaryDays: dailySummaries.length,
    heartRateDays: heartRate.length,
  })

  return { sleep, dailySummaries, heartRate }
}

/**
 * Merge by date: combine pull API data with webhook data, preferring webhook
 * entries when both sources have data for the same date.
 */
function mergeByDate<T extends { date: string }>(pullItems: T[], webhookItems: T[]): T[] {
  const byDate = new Map<string, T>()
  for (const item of pullItems) {
    byDate.set(item.date, item)
  }
  // Webhook data overwrites pull data for the same date
  for (const item of webhookItems) {
    byDate.set(item.date, item)
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Merge webhook health data into pull API data.
 * Uses date-based deduplication, preferring webhook data when both sources
 * have data for the same date (webhook data is pushed in real-time and is
 * more complete for health metrics like body battery and sleep).
 */
export function mergeWithWebhookData(
  pullData: AllPlatformData,
  webhookData: { sleep: SleepData[]; dailySummaries: DailySummary[]; heartRate: HeartRateData[] }
): AllPlatformData {
  return {
    ...pullData,
    sleep: mergeByDate(pullData.sleep, webhookData.sleep),
    dailySummaries: mergeByDate(pullData.dailySummaries, webhookData.dailySummaries),
    heartRate: mergeByDate(pullData.heartRate, webhookData.heartRate),
  }
}
