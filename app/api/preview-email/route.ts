import { NextResponse } from 'next/server'
import { generateEmailHtml } from '@/lib/training/emailer'
import {
  sampleUserProfile,
  sampleTrainingConfig,
  sampleAnalysisResults,
  sampleTrainingPlan,
} from '@/lib/sample-data'

/**
 * GET /api/preview-email
 *
 * Returns a sample training email HTML for preview.
 * No authentication required - uses sample data.
 */
export async function GET() {
  try {
    const html = generateEmailHtml(
      sampleUserProfile,
      sampleTrainingConfig,
      sampleAnalysisResults,
      sampleTrainingPlan,
      undefined // No goals update URL for preview
    )

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating preview email:', error)
    return NextResponse.json(
      { error: 'Failed to generate email preview' },
      { status: 500 }
    )
  }
}
