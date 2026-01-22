/**
 * Training Module Exports
 */

export { TrainingAnalyzer, analyzeTrainingData } from './analyzer'
export type {
  AnalysisResults,
  RestingHRAnalysis,
  BodyBatteryAnalysis,
  VO2MaxAnalysis,
  SleepAnalysis,
  SedentaryAnalysis,
  StressAnalysis,
  StepsAnalysis,
  DayOfWeekAnalysis,
  Recommendation,
} from './analyzer'

export { generateTrainingPlan } from './planner'
export type { TrainingPlan, DayPlan } from './planner'

export {
  generateEmailHtml,
  generateEmailSubject,
  generatePreviewText,
} from './emailer'
