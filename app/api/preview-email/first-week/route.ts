import { NextResponse } from 'next/server'
import { generateFirstWeekEmailHtml } from '@/lib/training/first-week-emailer'
import {
  sampleUserProfile,
  sampleTrainingConfig,
  sampleAnalysisResults,
  sampleTrainingPlan,
  samplePlatformData,
} from '@/lib/sample-data'

export async function GET() {
  try {
    const html = generateFirstWeekEmailHtml(
      sampleUserProfile,
      sampleTrainingConfig,
      sampleAnalysisResults,
      sampleTrainingPlan,
      samplePlatformData,
      'https://runplan.fun/dashboard',
      'garmin'
    )

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating first-week email preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate first-week email preview' },
      { status: 500 }
    )
  }
}
