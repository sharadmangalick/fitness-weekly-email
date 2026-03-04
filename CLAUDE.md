# RunPlan.fun Development Guidelines

## Project Overview

**RunPlan** is a personalized running coach that connects to Garmin Connect or Strava, analyzes training and recovery data, and delivers customized weekly training plans via email.

- **Live App:** https://fitness-weekly-email.vercel.app
- **Target Users:** Recreational runners (5K to marathon AND non-race: base building, injury recovery, general fitness)
- **Stack:** Next.js 16 + Supabase + Tailwind CSS, deployed on Vercel

---

## Development Workflow

### Before Starting Any Feature Work

**REQUIRED:** Review `/BACKLOG.md` and remind the user of current priorities before implementing.

The user has explicitly requested: *"I have a bad memory, so I would want you to remind me of other priorities on the backlog first."*

**Workflow for every non-trivial request:**
1. Acknowledge the request
2. Check BACKLOG.md for current priorities
3. Remind user of high-priority items and how the request relates
4. Let user make an informed decision
5. Then implement

**Skip backlog check only for:** bug fixes, emergencies, documentation, security patches.

### Keeping CLAUDE.md Current

**REQUIRED:** When reviewing or modifying the codebase, always check whether `CLAUDE.md` needs updating. Update it whenever:
- New files, directories, or modules are added or renamed
- Architecture patterns change (new adapters, new data flow, etc.)
- Key functions are added, removed, or significantly refactored
- Database tables or schemas change
- New conventions or tooling are adopted
- Information in CLAUDE.md has become stale or inaccurate

This ensures future sessions always have accurate context. Small, incremental updates are preferred over large rewrites.

### Prioritization
1. 🔴 High Priority backlog items first
2. 🟡 Quick wins (high impact, low effort)
3. User requests always take precedence, but show trade-offs first
4. New ideas not in backlog → add to backlog first, discuss priority

---

## Architecture Quick Reference

### Key Directories
- `/lib/platforms/` — Platform adapters (factory pattern with `PlatformAdapter` interface)
  - `garmin/` — Garmin Connect OAuth + Health/Activity API
  - `strava/` — Strava OAuth + API
  - `interface.ts` — Common interface, `displayDistance()`, `distanceLabel()`
- `/lib/training/` — Core training logic
  - `planner.ts` — Orchestrator: `generateTrainingPlan()`, `generateDailyPlan()`, phase logic, mileage calc
  - `run-variation.ts` — Dynamic run count variation (`calculateRunCountVariation()`, cycles, guardrails)
  - `coaching.ts` — `generateCoachingNotes()`, `generateRecoveryRecommendations()`
  - `plans/recovery.ts` — Recovery/injury plan generator
  - `plans/taper.ts` — Taper phase plan generator
  - `plans/race-week.ts` — Race week plan generator
  - `plans/frequency-aware.ts` — Frequency-aware plan generator (`selectRunDays()`)
  - `analyzer.ts` — Health data analysis (RHR, sleep, stress, body battery)
  - `adaptations.ts` — Recovery-based plan adjustments
  - `emailer.ts` — Weekly email generation
  - `__tests__/planner.test.ts` — Unit tests (vitest)
- `/lib/encryption.ts` — AES-256 encrypt/decrypt for OAuth tokens
- `/components/` — React components (most are `'use client'`)
- `/app/api/` — API routes (Next.js App Router)
- `/app/dashboard/page.tsx` — Main dashboard (client component)
- `/app/page.tsx` — Landing page

### Database (Supabase)
- Always use Supabase client, never raw SQL
- RLS enabled on all tables
- Server: `/lib/supabase-server.ts` | Client: `/lib/supabase-browser.ts` | API: `/lib/supabase.ts`
- Table naming: snake_case, UUIDs for PKs, `created_at`/`updated_at` timestamps
- Key tables: `user_profiles`, `platform_connections`, `training_configs`

### Styling
- Tailwind CSS, mobile-first (60%+ traffic is mobile)
- Bright gradient color scheme (orange/coral primary, blue accents, white backgrounds)
- Test at 375px (mobile), 768px (tablet), 1440px (desktop)

### Analytics
- Google Analytics via `/components/GoogleAnalytics.tsx`
- Track: page views, CTA clicks, signup completion, platform connections

---

## Code Conventions

- **TypeScript strict mode** — No implicit any, use Supabase generated types
- **Server components by default** — `'use client'` only when hooks/browser APIs needed
- **Environment variables** — `NEXT_PUBLIC_*` for browser, no prefix for server-only
- **Encryption required** — All OAuth tokens via `/lib/encryption.ts`
- **API routes** — `/app/api/[feature]/route.ts`, export GET/POST/etc, check auth first

---

## Git & PR Standards

### Commits
- Descriptive message explaining "why" not "what" (50 char summary line)
- One logical change per commit
- Always include: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
- Never commit `.env` or credentials
- Never force push to main

### Pull Requests
- Use `gh` CLI for all GitHub operations
- Title under 70 chars, body with `## Summary` + `## Test plan`
- Review all commits with `git log main...HEAD` before creating

---

## Testing Checklist

Before committing:
1. `npm test` — run vitest unit tests
2. `npm run dev` — verify changes work
3. Test at 375px mobile width (primary viewport)
3. Check browser console for errors
4. Test error scenarios (network failures, auth failures, invalid input)
5. For DB changes: verify RLS policies work

Integration points: Garmin OAuth, Strava OAuth, email delivery, webhook processing.
