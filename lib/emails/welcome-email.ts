/**
 * Welcome Email Template
 *
 * Generates HTML email content for welcome messages sent after signup.
 * Uses the same styling as training emails for brand consistency.
 */

export function generateWelcomeEmailHtml(userName: string, dashboardUrl: string): string {
  const displayName = userName || 'Runner'

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Fitness Weekly Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 28px; font-weight: 600;">
                Welcome, ${displayName}!
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">
                You're all set to receive personalized training plans
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thanks for signing up for Fitness Weekly Email! We're excited to help you train smarter with personalized weekly training plans based on your fitness data.
              </p>

              <h2 style="color: #333; font-size: 18px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #eee;">
                Get Started in 3 Easy Steps
              </h2>

              <!-- Step 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td width="48" style="vertical-align: top; padding-right: 16px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; text-align: center; line-height: 40px; color: white; font-weight: bold; font-size: 18px;">
                      1
                    </div>
                  </td>
                  <td style="vertical-align: top;">
                    <h3 style="color: #333; font-size: 16px; margin: 0 0 4px 0;">Connect Your Fitness Platform</h3>
                    <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.5;">
                      Link your Garmin or Strava account to sync your health and activity data.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td width="48" style="vertical-align: top; padding-right: 16px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; text-align: center; line-height: 40px; color: white; font-weight: bold; font-size: 18px;">
                      2
                    </div>
                  </td>
                  <td style="vertical-align: top;">
                    <h3 style="color: #333; font-size: 16px; margin: 0 0 4px 0;">Set Your Training Goals</h3>
                    <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.5;">
                      Tell us about your race goals or fitness objectives - we'll tailor your plan accordingly.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td width="48" style="vertical-align: top; padding-right: 16px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; text-align: center; line-height: 40px; color: white; font-weight: bold; font-size: 18px;">
                      3
                    </div>
                  </td>
                  <td style="vertical-align: top;">
                    <h3 style="color: #333; font-size: 16px; margin: 0 0 4px 0;">Receive Your Weekly Plan</h3>
                    <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.5;">
                      Get a personalized training plan every week based on your health metrics and goals.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Go to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What to Expect Section -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #333; font-size: 16px; margin: 0 0 12px 0;">What You'll Get Each Week</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          <span style="color: #667eea; font-weight: bold;">&#10003;</span>&nbsp; Health snapshot based on your recovery metrics
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          <span style="color: #667eea; font-weight: bold;">&#10003;</span>&nbsp; Personalized daily workout schedule
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          <span style="color: #667eea; font-weight: bold;">&#10003;</span>&nbsp; Coach's notes tailored to your training phase
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          <span style="color: #667eea; font-weight: bold;">&#10003;</span>&nbsp; Recovery recommendations when you need rest
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0 0 8px 0;">
                Questions? Just reply to this email - we're here to help!
              </p>
              <p style="color: #bbb; font-size: 11px; margin: 0;">
                Fitness Weekly Email
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function generateWelcomeEmailSubject(userName: string): string {
  const displayName = userName || 'Runner'
  return `Welcome to Fitness Weekly Email, ${displayName}!`
}
