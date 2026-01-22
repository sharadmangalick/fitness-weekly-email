/**
 * Training Data Analyzer
 *
 * Analyzes fitness data from any platform to generate health insights.
 * This is a TypeScript port of the Python data_analyzer.py
 */

import type {
  Activity,
  SleepData,
  HeartRateData,
  DailySummary,
  VO2MaxData,
  AllPlatformData,
} from '../platforms/interface'

// Analysis result types
export interface MetricAnalysis {
  available: boolean
  baseline?: number
  current?: number
  change?: number
  change_pct?: number
  min?: number
  max?: number
  avg?: number
  trend?: 'rising' | 'falling' | 'stable' | 'improving' | 'declining'
  status?: 'good' | 'normal' | 'concern'
}

export interface RestingHRAnalysis extends MetricAnalysis {}

export interface BodyBatteryAnalysis extends MetricAnalysis {
  baseline_wake?: number
  current_wake?: number
  avg_recharge?: number
}

export interface VO2MaxAnalysis extends MetricAnalysis {
  fitness_level?: string
  readings?: number
}

export interface SleepAnalysis extends MetricAnalysis {
  avg_hours?: number
  min_hours?: number
  max_hours?: number
  under_6h_nights?: number
  under_6h_pct?: number
  nights_7plus?: number
  nights_7plus_pct?: number
  total_nights?: number
}

export interface SedentaryAnalysis extends MetricAnalysis {
  avg_hours?: number
  min_hours?: number
  max_hours?: number
  high_sed_days?: number
  high_sed_pct?: number
  correlation_found?: boolean
}

export interface StressAnalysis extends MetricAnalysis {
  high_stress_days?: number
  high_stress_pct?: number
}

export interface StepsAnalysis extends MetricAnalysis {
  std_dev?: number
  low_days?: number
  low_days_pct?: number
  moderate_days?: number
  active_days?: number
  very_active_days?: number
  variability?: 'high' | 'moderate' | 'low'
}

export interface DayOfWeekAnalysis {
  available: boolean
  by_day?: Record<string, {
    avg_sleep?: number
    avg_bb?: number
    avg_stress?: number
    avg_steps?: number
    avg_sedentary?: number
  }>
  best_sleep_day?: string
  worst_sleep_day?: string
  best_bb_day?: string
  worst_bb_day?: string
}

export interface Recommendation {
  category: string
  priority: 'high' | 'medium' | 'low'
  finding: string
  recommendation: string
  science: string
}

export interface AnalysisResults {
  overview: {
    total_days: number
    start_date: string
    end_date: string
    data_types: Record<string, number>
  }
  resting_hr: RestingHRAnalysis
  body_battery: BodyBatteryAnalysis
  vo2max: VO2MaxAnalysis
  sleep: SleepAnalysis
  sedentary: SedentaryAnalysis
  stress: StressAnalysis
  steps: StepsAnalysis
  day_of_week: DayOfWeekAnalysis
  recommendations: Recommendation[]
}

// Helper functions
function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function stdev(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const squareDiffs = values.map(v => Math.pow(v - avg, 2))
  return Math.sqrt(mean(squareDiffs))
}

/**
 * Training Data Analyzer
 */
export class TrainingAnalyzer {
  private data: AllPlatformData

  constructor(data: AllPlatformData) {
    this.data = data
  }

  /**
   * Run all analyses and return comprehensive results
   */
  analyze(): AnalysisResults {
    const overview = this.analyzeOverview()
    const resting_hr = this.analyzeRestingHR()
    const body_battery = this.analyzeBodyBattery()
    const vo2max = this.analyzeVO2Max()
    const sleep = this.analyzeSleep()
    const sedentary = this.analyzeSedentary()
    const stress = this.analyzeStress()
    const steps = this.analyzeSteps()
    const day_of_week = this.analyzeDayOfWeek()

    // Store partial results for recommendation generation
    const partialResults = {
      resting_hr,
      body_battery,
      vo2max,
      sleep,
      sedentary,
      stress,
      steps,
      day_of_week,
    }

    const recommendations = this.generateRecommendations(partialResults)

    return {
      overview,
      resting_hr,
      body_battery,
      vo2max,
      sleep,
      sedentary,
      stress,
      steps,
      day_of_week,
      recommendations,
    }
  }

  private analyzeOverview() {
    const dates = this.data.dailySummaries.map(d => d.date).sort()
    return {
      total_days: this.data.dailySummaries.length,
      start_date: dates[0] || '',
      end_date: dates[dates.length - 1] || '',
      data_types: {
        activities: this.data.activities.length,
        sleep: this.data.sleep.length,
        heart_rate: this.data.heartRate.length,
        daily_summaries: this.data.dailySummaries.length,
      },
    }
  }

  private analyzeRestingHR(): RestingHRAnalysis {
    const rhrValues = this.data.heartRate
      .filter(hr => hr.resting_hr > 0)
      .map(hr => hr.resting_hr)

    if (rhrValues.length === 0) {
      return { available: false }
    }

    // Calculate baseline (first 14 days) vs recent (last 14 days)
    const first14 = rhrValues.slice(0, Math.min(14, rhrValues.length))
    const last14 = rhrValues.slice(-Math.min(14, rhrValues.length))

    const baseline = mean(first14)
    const recent = mean(last14)
    const change = recent - baseline
    const change_pct = baseline ? (change / baseline) * 100 : 0

    return {
      available: true,
      baseline: Math.round(baseline * 10) / 10,
      current: Math.round(recent * 10) / 10,
      change: Math.round(change * 10) / 10,
      change_pct: Math.round(change_pct * 10) / 10,
      min: Math.min(...rhrValues),
      max: Math.max(...rhrValues),
      avg: Math.round(mean(rhrValues) * 10) / 10,
      trend: change > 2 ? 'rising' : change < -2 ? 'falling' : 'stable',
      status: change > 3 ? 'concern' : change < -1 ? 'good' : 'normal',
    }
  }

  private analyzeBodyBattery(): BodyBatteryAnalysis {
    const bbValues = this.data.dailySummaries
      .filter(d => d.body_battery_high && d.body_battery_high > 0)
      .map(d => ({
        high: d.body_battery_high!,
        charged: d.body_battery_charged || 0,
      }))

    if (bbValues.length === 0) {
      return { available: false }
    }

    const allHighs = bbValues.map(v => v.high)
    const allCharged = bbValues.filter(v => v.charged > 0).map(v => v.charged)

    const first14 = allHighs.slice(0, Math.min(14, allHighs.length))
    const last14 = allHighs.slice(-Math.min(14, allHighs.length))

    const baseline = mean(first14)
    const recent = mean(last14)
    const change = recent - baseline

    return {
      available: true,
      baseline_wake: Math.round(baseline),
      current_wake: Math.round(recent),
      change: Math.round(change),
      avg_recharge: allCharged.length > 0 ? Math.round(mean(allCharged)) : 0,
      min: Math.min(...allHighs),
      max: Math.max(...allHighs),
      trend: change < -5 ? 'declining' : change > 5 ? 'improving' : 'stable',
      status: recent < 60 ? 'concern' : recent >= 75 ? 'good' : 'normal',
    }
  }

  private analyzeVO2Max(): VO2MaxAnalysis {
    const vo2Values = (this.data.vo2max || [])
      .filter(v => v.vo2max > 0)
      .map(v => v.vo2max)

    if (vo2Values.length === 0) {
      return { available: false }
    }

    const first7 = vo2Values.slice(0, Math.min(7, vo2Values.length))
    const last7 = vo2Values.slice(-Math.min(7, vo2Values.length))

    const baseline = mean(first7)
    const recent = mean(last7)
    const change = recent - baseline

    let fitnessLevel = 'Needs Improvement'
    if (recent >= 55) fitnessLevel = 'Excellent'
    else if (recent >= 50) fitnessLevel = 'Very Good'
    else if (recent >= 45) fitnessLevel = 'Good'
    else if (recent >= 40) fitnessLevel = 'Fair'

    return {
      available: true,
      baseline: Math.round(baseline * 10) / 10,
      current: Math.round(recent * 10) / 10,
      change: Math.round(change * 10) / 10,
      min: Math.round(Math.min(...vo2Values) * 10) / 10,
      max: Math.round(Math.max(...vo2Values) * 10) / 10,
      avg: Math.round(mean(vo2Values) * 10) / 10,
      fitness_level: fitnessLevel,
      trend: change > 1 ? 'improving' : change < -1 ? 'declining' : 'stable',
      status: change >= 0 ? 'good' : change < -2 ? 'concern' : 'normal',
      readings: vo2Values.length,
    }
  }

  private analyzeSleep(): SleepAnalysis {
    const sleepHours = this.data.sleep
      .filter(s => s.total_sleep_hours > 0)
      .map(s => s.total_sleep_hours)

    if (sleepHours.length === 0) {
      return { available: false }
    }

    const under6 = sleepHours.filter(h => h < 6).length
    const nights7plus = sleepHours.filter(h => h >= 7).length

    return {
      available: true,
      avg_hours: Math.round(mean(sleepHours) * 10) / 10,
      min_hours: Math.round(Math.min(...sleepHours) * 10) / 10,
      max_hours: Math.round(Math.max(...sleepHours) * 10) / 10,
      under_6h_nights: under6,
      under_6h_pct: Math.round((under6 / sleepHours.length) * 100),
      nights_7plus: nights7plus,
      nights_7plus_pct: Math.round((nights7plus / sleepHours.length) * 100),
      total_nights: sleepHours.length,
      status: mean(sleepHours) < 6.5 ? 'concern' : mean(sleepHours) >= 7 ? 'good' : 'normal',
    }
  }

  private analyzeSedentary(): SedentaryAnalysis {
    const sedHours = this.data.dailySummaries
      .filter(d => d.sedentary_minutes && d.sedentary_minutes > 0)
      .map(d => (d.sedentary_minutes || 0) / 60)

    if (sedHours.length === 0) {
      return { available: false }
    }

    const highSedDays = sedHours.filter(h => h > 17).length

    return {
      available: true,
      avg_hours: Math.round(mean(sedHours) * 10) / 10,
      min_hours: Math.round(Math.min(...sedHours) * 10) / 10,
      max_hours: Math.round(Math.max(...sedHours) * 10) / 10,
      high_sed_days: highSedDays,
      high_sed_pct: Math.round((highSedDays / sedHours.length) * 100),
    }
  }

  private analyzeStress(): StressAnalysis {
    const stressValues = this.data.dailySummaries
      .filter(d => d.stress_level && d.stress_level > 0)
      .map(d => d.stress_level!)

    if (stressValues.length === 0) {
      return { available: false }
    }

    const highStressDays = stressValues.filter(s => s > 45).length

    return {
      available: true,
      avg: Math.round(mean(stressValues)),
      min: Math.min(...stressValues),
      max: Math.max(...stressValues),
      high_stress_days: highStressDays,
      high_stress_pct: Math.round((highStressDays / stressValues.length) * 100),
      status: mean(stressValues) > 45 ? 'concern' : mean(stressValues) < 35 ? 'good' : 'normal',
    }
  }

  private analyzeSteps(): StepsAnalysis {
    const stepValues = this.data.dailySummaries
      .filter(d => d.steps > 0)
      .map(d => d.steps)

    if (stepValues.length === 0) {
      return { available: false }
    }

    const lowDays = stepValues.filter(s => s < 5000).length
    const moderateDays = stepValues.filter(s => s >= 5000 && s < 10000).length
    const activeDays = stepValues.filter(s => s >= 10000 && s < 20000).length
    const veryActiveDays = stepValues.filter(s => s >= 20000).length
    const stdDev = stdev(stepValues)

    return {
      available: true,
      avg: Math.round(mean(stepValues)),
      min: Math.min(...stepValues),
      max: Math.max(...stepValues),
      std_dev: Math.round(stdDev),
      low_days: lowDays,
      low_days_pct: Math.round((lowDays / stepValues.length) * 100),
      moderate_days: moderateDays,
      active_days: activeDays,
      very_active_days: veryActiveDays,
      variability: stdDev > 8000 ? 'high' : stdDev > 4000 ? 'moderate' : 'low',
    }
  }

  private analyzeDayOfWeek(): DayOfWeekAnalysis {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const byDay: Record<string, { sleep: number[]; bb: number[]; stress: number[]; steps: number[] }> = {}

    days.forEach(d => {
      byDay[d] = { sleep: [], bb: [], stress: [], steps: [] }
    })

    // Aggregate daily summaries by day of week
    for (const summary of this.data.dailySummaries) {
      const date = new Date(summary.date)
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]

      if (summary.steps > 0) byDay[dayName].steps.push(summary.steps)
      if (summary.body_battery_high) byDay[dayName].bb.push(summary.body_battery_high)
      if (summary.stress_level) byDay[dayName].stress.push(summary.stress_level)
    }

    // Add sleep by day
    for (const sleep of this.data.sleep) {
      const date = new Date(sleep.date)
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]
      if (sleep.total_sleep_hours > 0) byDay[dayName].sleep.push(sleep.total_sleep_hours)
    }

    const results: DayOfWeekAnalysis['by_day'] = {}
    for (const day of days) {
      results[day] = {
        avg_sleep: byDay[day].sleep.length > 0 ? Math.round(mean(byDay[day].sleep) * 10) / 10 : undefined,
        avg_bb: byDay[day].bb.length > 0 ? Math.round(mean(byDay[day].bb)) : undefined,
        avg_stress: byDay[day].stress.length > 0 ? Math.round(mean(byDay[day].stress)) : undefined,
        avg_steps: byDay[day].steps.length > 0 ? Math.round(mean(byDay[day].steps)) : undefined,
      }
    }

    // Find best/worst days
    const sleepByDay = days
      .filter(d => results[d]?.avg_sleep)
      .map(d => ({ day: d, value: results[d]!.avg_sleep! }))

    const bbByDay = days
      .filter(d => results[d]?.avg_bb)
      .map(d => ({ day: d, value: results[d]!.avg_bb! }))

    return {
      available: true,
      by_day: results,
      best_sleep_day: sleepByDay.length > 0 ? sleepByDay.sort((a, b) => b.value - a.value)[0].day : undefined,
      worst_sleep_day: sleepByDay.length > 0 ? sleepByDay.sort((a, b) => a.value - b.value)[0].day : undefined,
      best_bb_day: bbByDay.length > 0 ? bbByDay.sort((a, b) => b.value - a.value)[0].day : undefined,
      worst_bb_day: bbByDay.length > 0 ? bbByDay.sort((a, b) => a.value - b.value)[0].day : undefined,
    }
  }

  private generateRecommendations(results: Partial<AnalysisResults>): Recommendation[] {
    const recs: Recommendation[] = []

    // Check RHR trend
    if (results.resting_hr?.available && results.resting_hr.status === 'concern') {
      recs.push({
        category: 'Recovery',
        priority: 'high',
        finding: `Resting HR increased from ${results.resting_hr.baseline} to ${results.resting_hr.current} bpm (${results.resting_hr.change! > 0 ? '+' : ''}${results.resting_hr.change})`,
        recommendation: 'Consider a recovery week with reduced training intensity and volume.',
        science: 'A rise in resting HR often indicates accumulated fatigue or incomplete recovery.',
      })
    }

    // Check Body Battery
    if (results.body_battery?.available && results.body_battery.status === 'concern') {
      recs.push({
        category: 'Recovery',
        priority: 'high',
        finding: `Body Battery wake average is ${results.body_battery.current_wake} (baseline: ${results.body_battery.baseline_wake})`,
        recommendation: 'Focus on sleep quality and stress management. Consider earlier bedtime.',
        science: 'Body Battery below 60 suggests chronic recovery deficit.',
      })
    }

    // Check sleep
    if (results.sleep?.available && results.sleep.status === 'concern') {
      recs.push({
        category: 'Sleep',
        priority: 'high',
        finding: `Average sleep is ${results.sleep.avg_hours} hours (${results.sleep.under_6h_pct}% of nights under 6h)`,
        recommendation: 'Prioritize sleep: aim for 7-8 hours. Set a consistent bedtime alarm.',
        science: 'Research shows <7h sleep increases injury risk by 1.7x in athletes.',
      })
    }

    // Check sedentary
    if (results.sedentary?.available && (results.sedentary.high_sed_pct || 0) > 30) {
      recs.push({
        category: 'Movement',
        priority: 'medium',
        finding: `${results.sedentary.high_sed_pct}% of days have 17+ hours sedentary`,
        recommendation: 'Add movement breaks every 90 minutes. Consider walking meetings.',
        science: 'Prolonged sitting has independent health effects beyond exercise.',
      })
    }

    // Check stress
    if (results.stress?.available && results.stress.status === 'concern') {
      recs.push({
        category: 'Stress',
        priority: 'medium',
        finding: `Average stress level is ${results.stress.avg} (${results.stress.high_stress_pct}% days above 45)`,
        recommendation: 'Practice stress management: breathing exercises, meditation, or time in nature.',
        science: 'High stress throttles overnight recovery regardless of sleep duration.',
      })
    }

    // Check step variability
    if (results.steps?.available && results.steps.variability === 'high') {
      recs.push({
        category: 'Consistency',
        priority: 'low',
        finding: `Step counts vary widely (std dev: ${results.steps.std_dev})`,
        recommendation: 'Aim for more consistent daily movement rather than extreme swings.',
        science: 'Consistent moderate activity supports better recovery than feast/famine patterns.',
      })
    }

    return recs
  }
}

/**
 * Analyze fitness data and return insights
 */
export function analyzeTrainingData(data: AllPlatformData): AnalysisResults {
  const analyzer = new TrainingAnalyzer(data)
  return analyzer.analyze()
}
