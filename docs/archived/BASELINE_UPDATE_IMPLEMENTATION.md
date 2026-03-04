# Automatic Training History Baseline Updates - Implementation Summary

**Date**: 2026-02-09
**Status**: ✅ Complete
**Type**: Bug Fix + Core Algorithm Enhancement

---

## Problem Statement

The landing page promised: *"The next week's plan automatically adapts based on what you actually ran (not what was planned)"*

**Reality**: The algorithm was NOT doing this. The `current_weekly_mileage` baseline stayed static after onboarding unless manually updated by the user.

**Impact**:
- Plans drifted from reality after missed weeks
- Algorithm could prescribe unrealistic volume
- Users had to manually update baseline (most didn't)
- False advertising on landing page

---

## Solution Implemented

### New Rolling Baseline Calculation

Added `calculateUpdatedBaseline()` function with safety constraints:

**Algorithm**:
- Analyzes last 2-4 weeks of actual running activities
- Calculates weighted average (recent weeks weighted 2x)
- Applies safety constraints before updating

**Safety Constraints**:
- ✅ 10% max increase per week (prevents injury)
- ✅ 25% max decrease per week (allows recovery, avoids over-correction)
- ✅ 5 mile/week minimum (prevents going to zero)
- ✅ 2 week minimum data (won't update without sufficient history)

---

## How It Now Works

Every week before generating plans:
1. Fetch last 30 days of activities (not just 7)
2. Calculate rolling weighted average from actual training
3. Apply safety constraints
4. Update database with new baseline
5. Generate plan using updated baseline

---

## Files Modified

1. `lib/training/mileage-calculator.ts` - Added calculateUpdatedBaseline()
2. `app/api/cron/send-emails/route.ts` - Integrated baseline updates
