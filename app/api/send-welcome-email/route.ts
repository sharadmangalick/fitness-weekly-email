import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateWelcomeEmailHtml, generateWelcomeEmailSubject } from '@/lib/emails/welcome-email'

const ADMIN_EMAIL = 'smangalick@gmail.com'

// Lazy initialize Resend to avoid build-time errors
let resend: Resend | null = null
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface WelcomeEmailRequest {
  email: string
  name: string
}

/**
 * POST /api/send-welcome-email
 *
 * Sends a welcome email after signup.
 * No authentication required - called right after signup completes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WelcomeEmailRequest

    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://runplan.fun'
    const dashboardUrl = `${appUrl}/dashboard`

    const emailHtml = generateWelcomeEmailHtml(body.name, dashboardUrl)
    const emailSubject = generateWelcomeEmailSubject(body.name)

    // Send email via Resend
    const { data, error: sendError } = await getResend().emails.send({
      from: 'RunPlan <noreply@runplan.fun>',
      to: body.email,
      subject: emailSubject,
      html: emailHtml,
    })

    if (sendError) {
      console.error('Failed to send welcome email:', sendError)
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }

    // Send admin notification (fire-and-forget)
    getResend().emails.send({
      from: 'RunPlan <noreply@runplan.fun>',
      to: ADMIN_EMAIL,
      subject: `New signup: ${body.name || 'Unknown'}`,
      text: `A new user has signed up!\n\nName: ${body.name || 'Not provided'}\nEmail: ${body.email}`,
    }).catch((err) => {
      console.error('Failed to send admin notification:', err)
    })

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
