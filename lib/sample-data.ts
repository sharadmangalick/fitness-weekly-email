/**
 * Sample Data for Email Preview
 *
 * Realistic mock data to demonstrate what the weekly training email looks like
 * before users connect their fitness platform.
 */

import type { AnalysisResults } from './training/analyzer'
import type { TrainingPlan, DayPlan } from './training/planner'
import type { TrainingConfig, UserProfile } from './database.types'
import type { AllPlatformData, Activity } from './platforms/interface'

/**
 * Sample user profile
 */
export const sampleUserProfile: UserProfile = {
  id: 'sample-user',
  email: 'runner@example.com',
  name: 'Runner',
  timezone: 'America/New_York',
  preferred_platform: 'garmin',
  onboarding_status: 'completed',
  onboarding_completed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/**
 * Sample training config - marathon in 8 weeks
 */
export const sampleTrainingConfig: TrainingConfig = {
  user_id: 'sample-user',
  goal_category: 'race',
  goal_type: 'marathon',
  goal_date: (() => {
    const date = new Date()
    date.setDate(date.getDate() + 56) // 8 weeks from now
    return date.toISOString().split('T')[0]
  })(),
  goal_time_minutes: 225, // 3:45 marathon
  goal_target: '3:45 Marathon',
  custom_distance_miles: null,
  target_weekly_mileage: null,
  current_weekly_mileage: 45,
  experience_level: 'intermediate',
  preferred_long_run_day: 'sunday',
  email_day: 'sunday',
  email_time: '07:00',
  email_enabled: true,
  intensity_preference: 'normal',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/**
 * Sample analysis results with varied health metrics
 * Shows a mix of good, normal, and one concern to demonstrate all states
 */
export const sampleAnalysisResults: AnalysisResults = {
  overview: {
    total_days: 28,
    start_date: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 28)
      return date.toISOString().split('T')[0]
    })(),
    end_date: new Date().toISOString().split('T')[0],
    data_types: {
      activities: 18,
      sleep: 28,
      heart_rate: 28,
      daily_summaries: 28,
    },
  },
  resting_hr: {
    available: true,
    baseline: 52,
    current: 51,
    change: -1,
    change_pct: -1.9,
    min: 48,
    max: 56,
    avg: 52,
    trend: 'stable',
    status: 'good',
  },
  body_battery: {
    available: true,
    baseline_wake: 72,
    current_wake: 68,
    change: -4,
    avg_recharge: 45,
    min: 55,
    max: 85,
    trend: 'stable',
    status: 'normal',
  },
  vo2max: {
    available: true,
    baseline: 48,
    current: 49,
    change: 1,
    min: 47,
    max: 50,
    avg: 48.5,
    fitness_level: 'Good',
    trend: 'improving',
    status: 'good',
    readings: 12,
  },
  sleep: {
    available: true,
    avg_hours: 7.2,
    min_hours: 5.5,
    max_hours: 8.5,
    under_6h_nights: 3,
    under_6h_pct: 11,
    nights_7plus: 18,
    nights_7plus_pct: 64,
    total_nights: 28,
    status: 'good',
  },
  sedentary: {
    available: true,
    avg_hours: 14.5,
    min_hours: 10,
    max_hours: 18,
    high_sed_days: 4,
    high_sed_pct: 14,
  },
  stress: {
    available: true,
    avg: 38,
    min: 22,
    max: 58,
    high_stress_days: 5,
    high_stress_pct: 18,
    status: 'normal',
  },
  steps: {
    available: true,
    avg: 9500,
    min: 4200,
    max: 18500,
    std_dev: 3200,
    low_days: 3,
    low_days_pct: 11,
    moderate_days: 12,
    active_days: 10,
    very_active_days: 3,
    variability: 'moderate',
  },
  rpe: {
    available: true,
    avg_rpe: 5.2,
    min: 3,
    max: 8,
    trend: 'stable',
    status: 'normal',
    hard_workout_count: 2,
    easy_workout_count: 3,
    moderate_workout_count: 5,
    fatigue_indicators: 0,
    activities_with_rpe: 10,
    total_activities: 18,
  },
  day_of_week: {
    available: true,
    by_day: {
      Monday: { avg_sleep: 7.0, avg_bb: 70, avg_stress: 42, avg_steps: 8500 },
      Tuesday: { avg_sleep: 7.1, avg_bb: 68, avg_stress: 40, avg_steps: 9200 },
      Wednesday: { avg_sleep: 7.0, avg_bb: 65, avg_stress: 44, avg_steps: 8800 },
      Thursday: { avg_sleep: 6.8, avg_bb: 64, avg_stress: 42, avg_steps: 9000 },
      Friday: { avg_sleep: 6.5, avg_bb: 62, avg_stress: 38, avg_steps: 8200 },
      Saturday: { avg_sleep: 7.8, avg_bb: 75, avg_stress: 30, avg_steps: 12500 },
      Sunday: { avg_sleep: 8.0, avg_bb: 78, avg_stress: 28, avg_steps: 10500 },
    },
    best_sleep_day: 'Sunday',
    worst_sleep_day: 'Friday',
    best_bb_day: 'Sunday',
    worst_bb_day: 'Friday',
  },
  recommendations: [
    {
      category: 'Sleep',
      priority: 'medium',
      finding: 'Friday nights tend to have the lowest sleep duration (6.5 hours average).',
      recommendation: 'Consider an earlier bedtime on Fridays to maintain weekend running performance.',
      science: 'Sleep debt accumulated during the week impacts athletic performance.',
    },
  ],
}

/**
 * Sample training plan - build phase for marathon
 */
export const sampleTrainingPlan: TrainingPlan = {
  week_summary: {
    total_miles: 42,
    training_phase: 'build',
    goal_type: 'marathon',
    focus: 'Increasing volume and introducing quality workouts',
  },
  daily_plan: [
    {
      day: 'Monday',
      workout_type: 'rest',
      title: 'Rest Day',
      distance_miles: null,
      description: 'Complete rest or light stretching/yoga. Let your body recover from the long run.',
      notes: 'Recovery is when fitness gains happen.',
    },
    {
      day: 'Tuesday',
      workout_type: 'easy',
      title: 'Easy Run',
      distance_miles: 6,
      description: 'Easy pace at 9:35-10:35/mile. Keep heart rate in Zone 2.',
      notes: null,
    },
    {
      day: 'Wednesday',
      workout_type: 'tempo',
      title: 'Tempo Run',
      distance_miles: 7,
      description: '1 mile warm-up, 5 miles at 8:35-8:50/mile, 1 mile cool-down.',
      notes: 'Key workout #2 - comfortably hard effort.',
    },
    {
      day: 'Thursday',
      workout_type: 'rest',
      title: 'Rest / Cross-Train',
      distance_miles: null,
      description: 'Rest day or optional cross-training. Good day for strength work or yoga.',
      notes: 'Quality over quantity - rest makes you faster.',
    },
    {
      day: 'Friday',
      workout_type: 'easy',
      title: 'Easy Run + Strides',
      distance_miles: 6,
      description: 'Easy 6 miles at 9:35-10:35/mile, then 4x100m strides with full recovery.',
      notes: 'Strides keep your legs feeling snappy.',
    },
    {
      day: 'Saturday',
      workout_type: 'easy',
      title: 'Pre-Long Run Shakeout',
      distance_miles: 4,
      description: 'Short easy run at 9:35-10:35/mile. Just loosening up for tomorrow.',
      notes: 'Keep it short and easy. Prepare gear for tomorrow.',
    },
    {
      day: 'Sunday',
      workout_type: 'long_run',
      title: 'Long Run',
      distance_miles: 18,
      description: 'Start easy at 9:35-10:35/mile, then settle into 8:35/mile for the middle portion. Practice race-day nutrition.',
      notes: 'Key workout #1 - stay relaxed and focus on time on feet.',
    },
  ] as DayPlan[],
  coaching_notes: [
    'Building phase - 8 weeks until Marathon. Consistency with 4-5 runs per week builds a strong foundation.',
    'With 4-5 running days, every run has purpose: long run for endurance, tempo for race fitness, easy runs for recovery.',
    'Rest days aren\'t lazy - they\'re when your body adapts and gets stronger. Use them wisely.',
  ],
  recovery_recommendations: [],
}

/**
 * Sample platform data - last week's activities
 */
export const samplePlatformData: AllPlatformData = {
  activities: (() => {
    const activities: Activity[] = []
    const today = new Date()

    // Last Sunday - Long run
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - ((today.getDay() + 7) % 7) - 7)
    activities.push({
      id: 'activity-1',
      date: sunday,
      type: 'run',
      name: 'Long Run',
      distance_miles: 16,
      duration_minutes: 138,
      avg_pace_per_mile: '8:38',
      avg_hr: 148,
      max_hr: 165,
      elevation_gain_ft: 320,
      calories: 1450,
    })

    // Tuesday - Easy run
    const tuesday = new Date(sunday)
    tuesday.setDate(sunday.getDate() + 2)
    activities.push({
      id: 'activity-2',
      date: tuesday,
      type: 'run',
      name: 'Easy Run',
      distance_miles: 5.5,
      duration_minutes: 52,
      avg_pace_per_mile: '9:27',
      avg_hr: 138,
      max_hr: 152,
      elevation_gain_ft: 85,
      calories: 520,
    })

    // Wednesday - Tempo run
    const wednesday = new Date(sunday)
    wednesday.setDate(sunday.getDate() + 3)
    activities.push({
      id: 'activity-3',
      date: wednesday,
      type: 'run',
      name: 'Tempo Run',
      distance_miles: 6,
      duration_minutes: 48,
      avg_pace_per_mile: '8:00',
      avg_hr: 162,
      max_hr: 175,
      elevation_gain_ft: 120,
      calories: 580,
    })

    // Friday - Easy run with strides
    const friday = new Date(sunday)
    friday.setDate(sunday.getDate() + 5)
    activities.push({
      id: 'activity-4',
      date: friday,
      type: 'run',
      name: 'Easy Run + Strides',
      distance_miles: 5,
      duration_minutes: 47,
      avg_pace_per_mile: '9:24',
      avg_hr: 140,
      max_hr: 168,
      elevation_gain_ft: 75,
      calories: 480,
    })

    return activities
  })(),
  sleep: [],
  heartRate: [],
  dailySummaries: [],
}
