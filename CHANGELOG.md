# Changelog

## 2026-03-03

- Migrated Garmin authentication to OAuth 2.0 (#2)
- Fixed mobile UX: modal margins, summary stacking, grid spacing, header stacking (#20)
- Broadened homepage messaging for non-race runners (#21)
- Stopped reporting fake resting HR for Strava users (#22)
- Added run frequency support (2-7 runs/week) (#23)
- Added injury recovery safety: conservative plans, no speed work (#24)
- Split planner.ts into focused modules (plans/, coaching, run-variation)
- Fixed dead code: taper/race-week plans now generate correctly
- Added unit tests with Vitest (30 tests covering planner core logic)

## 2026-02-20

- Added ultra marathon distance display (#11)
- Added "Get Faster" fitness goal type (#12)
- Added custom race distance and race name support (#14)
- Added dual unit display (miles/km) (#15)
- Added configurable taper length (1-3 weeks) (#16)
- Improved health snapshot empty states (#18)

## 2026-02-06

- Added side-by-side sample week comparison on landing page (#8)

## Earlier

- Landing page redesign with bright gradient color scheme
- Strava OAuth integration with token refresh
- Multi-step onboarding flow
- Weekly email generation with coaching notes
- Schema.org structured data for SEO
- Full plan projection (multi-week overview)
