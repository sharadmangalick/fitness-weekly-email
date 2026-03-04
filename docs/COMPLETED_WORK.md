# RunPlan.fun — Completed Work History

## Landing Page & Conversion
- **Landing page redesign** — Bright gradient color scheme (user chose over dark theme). Clear value prop, email preview comparison, trust signals, FAQ section.
- **Homepage messaging broadened** (#21, 2026-03-03) — Updated copy to include non-race runners (base building, injury recovery, general fitness). Changed "Set Your Race Goal" → "Set Your Goal", "Race-Ready Plans" → "Plans That Fit Your Goals".
- **Sample week comparison** (#8) — Side-by-side "Without RunPlan" vs "With RunPlan" on landing page.
- **Schema.org structured data** — Added for SEO.
- **Share CTA + feedback loops** — Social sharing and user feedback mechanisms.

## Platform Integration
- **Garmin OAuth 2.0 migration** (#2, 2026-03-03) — Replaced password-based auth with official OAuth. Users authenticate on Garmin.com directly.
- **Strava OAuth** — Full OAuth flow with token refresh.
- **Strava RHR fix** (#22, 2026-03-03) — Stopped reporting fake "resting HR" from activity data. Strava can't provide true RHR. Removed RHR-based recovery adjustments for Strava users.
- **Webhook logging with idempotency** — Prevents duplicate email sends from repeated webhooks.
- **Health snapshot empty states** (#18) — Clear messaging when health data not yet synced.

## Training Plan Quality
- **Run frequency support** (#23, 2026-03-03) — Added `runs_per_week` field. Users specify 2-7 days/week. Planner distributes miles accordingly.
- **Injury recovery safety** (#24, 2026-03-03) — New 'recovery' training phase with 0.7x multiplier, no speed work, easy runs only, conservative progression.
- **Configurable taper** (#16) — Users choose 1/2/3 week taper length.
- **Custom race distance + race name** (#14) — Supports non-standard distances and personalizes with race name.
- **Ultra marathon support** (#11) — Proper distance display for ultras.
- **"Get Faster" goal type** (#12) — Non-race speed improvement goal.
- **Distance unit support** (#15) — Miles/km toggle, dual display in race labels, auto-detected from Strava.
- **Weekly mileage auto-calculation** — From platform activity data via `useCalculatedMileage` hook.
- **Mileage mismatch banner** — Alerts when actual running differs >30% from configured mileage.

## Mobile UX
- **Mobile UX fixes** (#20, 2026-03-03) — GoalWizard modal margin reduced, summary rows stack vertically, StepPlanPreview truncation, dashboard grid gap/padding reduced, headers stack on mobile.

## Onboarding & Dashboard
- **Multi-step onboarding flow** — Connect platform → Set goals → Preview plan → Start training.
- **Email preview endpoints** — Preview welcome and first-week emails.
- **Intensity selector** — Conservative/normal/aggressive plan intensity preference.
- **Full plan overview** — Multi-week view for race training plans.
- **Garmin migration banner** — Prompts users with expired Garmin connections to reconnect via OAuth.

## Key Design Decisions
- **No placeholder social proof** — User explicitly removed fake user counts. Waiting for real numbers.
- **No fake testimonials** — Waiting for real user feedback before adding testimonials section.
- **Bright color scheme** — User chose warm gradients over dark theme for fitness app vibe.
- **Mobile-first** — 60%+ traffic is mobile, always test at 375px.
- **Strava data limitations acknowledged** — Don't pretend Strava has data it doesn't (RHR, body battery, stress).
