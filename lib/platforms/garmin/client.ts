/**
 * Garmin raw API response type definitions
 * These represent the shape of data returned by the official Garmin Health API.
 */

export interface GarminActivityRaw {
  activityId: number
  activityName: string
  activityType?: string                            // Health API returns plain string e.g. "RUNNING"
  startTimeInSeconds: number                       // Unix timestamp
  distanceInMeters?: number
  durationInSeconds: number
  averageHeartRateInBeatsPerMinute?: number
  maxHeartRateInBeatsPerMinute?: number
  elevationGain?: number
  activeKilocalories?: number
  averageRunningCadenceInStepsPerMinute?: number
  perceivedExertion?: number
  aerobicTrainingEffect?: number
  anaerobicTrainingEffect?: number
  deviceName?: string
}

export interface GarminSleepRaw {
  calendarDate?: string
  durationInSeconds?: number
  deepSleepDurationInSeconds?: number
  lightSleepDurationInSeconds?: number
  remSleepInSeconds?: number
  awakeDurationInSeconds?: number
  sleepScores?: { overall?: { value?: number } }
}

export interface GarminHeartRateRaw {
  restingHeartRate?: number
  maxHeartRate?: number
  calendarDate?: string
}

export interface GarminDailyStatsRaw {
  calendarDate?: string
  steps?: number
  distanceInMeters?: number
  activeKilocalories?: number
  bmrKilocalories?: number
  activeTimeInSeconds?: number
  vigorousIntensityDurationInSeconds?: number
  averageStressLevel?: number
  bodyBatteryHighestValue?: number
  bodyBatteryLowestValue?: number
  bodyBatteryChargedValue?: number
  bodyBatteryDrainedValue?: number
}

export interface GarminVO2MaxRaw {
  generic?: { vo2MaxValue?: number }
  running?: { vo2MaxValue?: number }
  cycling?: { vo2MaxValue?: number }
  vo2MaxValue?: number
  vo2Max?: number
}
