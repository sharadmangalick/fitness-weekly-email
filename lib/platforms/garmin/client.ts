/**
 * Garmin raw API response type definitions
 * These represent the shape of data returned by the official Garmin Health API.
 */

export interface GarminActivityRaw {
  activityId: number
  activityName: string
  activityType?: { typeKey?: string }
  startTimeLocal: string
  distance: number  // meters
  duration: number  // seconds
  averageHR?: number
  maxHR?: number
  elevationGain?: number
  calories?: number
  averageRunningCadenceInStepsPerMinute?: number
  perceivedExertion?: number
  aerobicTrainingEffect?: number
  anaerobicTrainingEffect?: number
}

export interface GarminSleepRaw {
  dailySleepDTO?: {
    sleepTimeSeconds?: number
    deepSleepSeconds?: number
    lightSleepSeconds?: number
    remSleepSeconds?: number
    awakeSleepSeconds?: number
    sleepScores?: {
      totalScore?: number
    }
  }
}

export interface GarminHeartRateRaw {
  restingHeartRate?: number
  maxHeartRate?: number
  calendarDate?: string
}

export interface GarminDailyStatsRaw {
  totalSteps?: number
  totalDistanceMeters?: number
  activeKilocalories?: number
  totalKilocalories?: number
  sedentarySeconds?: number
  activeSeconds?: number
  vigorousIntensityMinutes?: number
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
