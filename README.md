# Fitness Weekly Email

A personalized training plan application that analyzes your fitness data from Garmin or Strava and delivers AI-powered weekly training plans to your inbox.

**Live App:** https://fitness-weekly-email.vercel.app

## Features

- **Multi-Platform Support** - Connect Garmin Connect or Strava accounts
- **Recovery-Aware Training** - Analyzes resting heart rate, sleep quality, body battery, and stress levels
- **Goal-Specific Plans** - Supports race goals (5K to marathon) and general fitness goals
- **Automated Weekly Emails** - Training plans delivered on your preferred schedule
- **Secure Data Handling** - OAuth for Strava, encrypted session tokens for Garmin

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Email:** Resend
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Cron Jobs:** Vercel Cron

## Project Structure

```
fitness-weekly-email/
├── app/
│   ├── api/
│   │   ├── config/           # User configuration API
│   │   ├── connect/
│   │   │   ├── garmin/       # Garmin connection endpoint
│   │   │   └── strava/       # Strava OAuth endpoints
│   │   └── cron/
│   │       └── send-emails/  # Weekly email cron job
│   ├── dashboard/            # User dashboard
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   └── page.tsx              # Landing page
├── components/
│   ├── GarminConnectModal.tsx
│   ├── GoalWizard.tsx
│   └── PlatformConnector.tsx
├── lib/
│   ├── platforms/
│   │   ├── garmin/           # Garmin API client & adapter
│   │   ├── strava/           # Strava API client & adapter
│   │   ├── index.ts          # Platform factory
│   │   └── interface.ts      # Common interface
│   ├── training/
│   │   ├── analyzer.ts       # Training data analysis
│   │   ├── emailer.ts        # Email HTML generation
│   │   ├── planner.ts        # Training plan generation
│   │   └── index.ts          # Module exports
│   ├── database.types.ts     # Supabase type definitions
│   ├── encryption.ts         # Token encryption utilities
│   ├── supabase.ts           # Supabase client
│   ├── supabase-browser.ts   # Browser-side Supabase client
│   └── supabase-server.ts    # Server-side Supabase client
├── supabase/
│   └── migrations/           # Database schema
└── vercel.json               # Vercel configuration & cron
```

## Database Schema

The app uses four main tables:

- **user_profiles** - User account information and preferences
- **platform_connections** - Encrypted OAuth/session tokens for Garmin and Strava
- **training_configs** - Training goals, targets, and email preferences
- **email_history** - Record of sent emails

All tables have Row Level Security (RLS) enabled.

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Strava API application (for Strava integration)
- A Resend account (for emails)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Encryption (generate with: openssl rand -base64 32)
ENCRYPTION_KEY=xxx

# Strava OAuth (from strava.com/settings/api)
STRAVA_CLIENT_ID=xxx
STRAVA_CLIENT_SECRET=xxx
NEXT_PUBLIC_STRAVA_REDIRECT_URI=http://localhost:3000/api/connect/strava/callback

# Resend
RESEND_API_KEY=xxx

# Cron security (generate with: openssl rand -base64 32)
CRON_SECRET=xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Enable the `uuid-ossp` extension if not already enabled

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000 to see the app.

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables (update URLs for production)
4. Deploy

The `vercel.json` configures a daily cron job at 2 PM UTC:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-emails",
      "schedule": "0 14 * * *"
    }
  ]
}
```

### Strava Setup

1. Create an app at https://www.strava.com/settings/api
2. Set the Authorization Callback Domain to your Vercel domain
3. Copy Client ID and Secret to environment variables

### Supabase Setup

1. Update Site URL in Auth settings to your production URL
2. Add production URL to Redirect URLs

## Training Analysis

The app analyzes the following metrics:

| Metric | Purpose |
|--------|---------|
| Resting Heart Rate | Detect fatigue and recovery trends |
| Body Battery | Assess daily energy availability |
| VO2 Max | Track aerobic fitness changes |
| Sleep Quality | Factor rest into training load |
| Stress Levels | Identify high-stress periods |
| Steps | Monitor daily activity |

Based on analysis, the planner adjusts:
- Weekly mileage targets
- Workout intensity
- Recovery day placement
- Long run distance

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/config` | GET/POST | Get or update user training config |
| `/api/connect/garmin` | POST | Connect Garmin account |
| `/api/connect/strava` | GET | Initiate Strava OAuth |
| `/api/connect/strava/callback` | GET | Handle Strava OAuth callback |
| `/api/cron/send-emails` | GET | Send scheduled weekly emails |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Acknowledgments

- [Garmin Connect](https://connect.garmin.com/) for fitness data
- [Strava](https://www.strava.com/) for activity tracking
- [Supabase](https://supabase.com/) for backend infrastructure
- [Vercel](https://vercel.com/) for hosting and cron jobs
- [Resend](https://resend.com/) for email delivery
