import { NextResponse } from 'next/server'
import { generateWelcomeEmailHtml } from '@/lib/emails/welcome-email'

export async function GET() {
  try {
    const html = generateWelcomeEmailHtml('Runner', 'https://runplan.fun/dashboard')

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating welcome email preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate welcome email preview' },
      { status: 500 }
    )
  }
}
