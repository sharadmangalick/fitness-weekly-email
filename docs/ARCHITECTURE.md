# RunPlan.fun — Architecture Reference

## Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase (Postgres + Auth + RLS)
- **Styling:** Tailwind CSS (bright gradients, mobile-first)
- **Hosting:** Vercel
- **Analytics:** Google Analytics
- **AI:** Claude API for plan generation

## Directory Structure

```
/app
  /api
    /connect/garmin/route.ts     — Garmin OAuth initiation
    /connect/strava/route.ts     — Strava OAuth initiation
    /auth/callback/garmin/route.ts — Garmin OAuth callback
    /auth/callback/strava/route.ts — Strava OAuth callback (via /api/strava/callback)
    /generate-plan/route.ts      — Plan generation endpoint
    /preview-email/route.ts      — Email preview
    /cron/send-emails/route.ts   — Weekly email cron job
    /webhooks/garmin/route.ts    — Garmin webhook receiver
  /dashboard/page.tsx            — Main dashboard (client component, large file)
  /login/page.tsx                — Login page
  /signup/page.tsx               — Signup page
  /page.tsx                      — Landing page (large file, ~950 lines)
  /privacy/page.tsx              — Privacy policy

/components
  GoalWizard.tsx                 — 3-step goal configuration (race/fitness goals)
  TrainingPlanView.tsx           — Displays weekly training plan + health metrics
  PlatformConnector.tsx          — Garmin/Strava connection cards
  IntensitySelector.tsx          — Conservative/normal/aggressive plan intensity
  FullPlanOverview.tsx           — Multi-week plan view for race goals
  MileageMismatchBanner.tsx      — Alerts when configured vs actual mileage differs
  GarminMigrationBanner.tsx      — Prompts expired Garmin users to reconnect
  GoogleAnalytics.tsx            — GA tracking + event helpers
  /Onboarding/
    OnboardingFlow.tsx           — Multi-step onboarding wizard
    StepPlanPreview.tsx          — Plan preview during onboarding
    OnboardingBanner.tsx         — Resume onboarding prompt

/lib
  /platforms/
    interface.ts                 — PlatformAdapter interface, displayDistance(), distanceLabel()
    index.ts                     — Factory: getPlatformAdapter(platform)
    /garmin/
      adapter.ts                 — GarminAdapter implements PlatformAdapter
      client.ts                  — Garmin OAuth + API client
    /strava/
      adapter.ts                 — StravaAdapter implements PlatformAdapter
      client.ts                  — Strava OAuth + API client
  /training/
    planner.ts                   — generateTrainingPlan(), generateDailyPlan(), phase logic
    analyzer.ts                  — analyzeHealthData() — RHR, sleep, stress, body battery
    adaptations.ts               — applyAdaptations() — recovery-based adjustments
    emailer.ts                   — generateEmail() — weekly training email HTML
  encryption.ts                  — AES-256 encrypt/decrypt for tokens
  supabase.ts                    — Supabase client for API routes
  supabase-server.ts             — Supabase client for server components
  supabase-browser.ts            — Supabase client for client components
  database.types.ts              — Generated Supabase types

/hooks
  useCalculatedMileage.ts        — Auto-calculates weekly mileage from platform data
```

## Key Database Tables
- `user_profiles` — id, email, onboarding_status, distance_unit, preferred_platform
- `platform_connections` — user_id, platform (garmin/strava), status, encrypted tokens
- `training_configs` — user_id, goal_category, goal_type, goal_date, goal_time_minutes, current_weekly_mileage, runs_per_week, experience_level, taper_weeks, email_day, email_enabled, intensity_preference
- `generated_plans` — cached training plans with TTL

## Platform Adapter Interface
```typescript
interface PlatformAdapter {
  getActivities(days: number): Promise<Activity[]>
  getHeartRateData(days: number): Promise<HeartRateData>
  getSleepData(days: number): Promise<SleepData>
  getBodyBatteryData?(days: number): Promise<BodyBatteryData>  // Garmin only
  getStressData?(days: number): Promise<StressData>            // Garmin only
}
```

## Training Plan Flow
1. User configures goals via GoalWizard (race or fitness goal)
2. `/api/generate-plan` fetches platform data via adapter
3. `analyzer.ts` processes health metrics
4. `planner.ts` generates weekly plan (respects phase, frequency, mileage)
5. `adaptations.ts` adjusts based on recovery signals
6. Plan cached in DB, displayed on dashboard, emailed weekly

## Important Patterns
- **Strava limitations:** No resting HR, no body battery, no stress data. Only activity HR available.
- **Injury recovery:** Uses 'recovery' phase — 0.7x multiplier, no speed work, easy runs only
- **Run frequency:** `runs_per_week` field controls how many days have runs vs rest
- **Distance units:** Stored in miles internally, converted for display via displayDistance()
- **Garmin attribution:** Must show Garmin logo + "Data provided by Garmin" per brand guidelines
