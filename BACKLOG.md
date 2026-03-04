# RunPlan.fun Product Backlog

This file tracks ideas and features discussed but not yet implemented. Items are organized by priority tier and include context to help decide what to work on next.

Last Updated: 2026-03-03

---

## 🔴 High Priority - Deferred (Ready to Implement)

### 1. Social Authentication (Apple + Google OAuth)

**Status**: Complete implementation plan exists, explicitly deferred by user

**Description**: Add Apple and Google sign-in options using Supabase Auth's built-in OAuth providers. This removes the primary signup friction barrier by reducing signup time from ~2 minutes to ~15 seconds.

**Why It Matters**:
- Removes #1 conversion barrier (form friction)
- Critical for mobile users (60%+ of traffic)
- Leverages trust transfer from established platforms
- Expected 50-70% increase in signup completion rate

**Context**:
- Full implementation plan exists in `/Users/sharadmangalick/.claude/plans/scalable-meandering-reddy.md`
- User initially requested this, then decided to focus on landing page improvements first
- Apple Developer Account is available
- Supabase already configured for auth

**Expected Impact**: High (50-70% increase in signup conversions)

**Files to Create**:
- `/components/AuthProviderButton.tsx`
- `/app/api/auth/callback/route.ts`

**Files to Modify**:
- `/app/signup/page.tsx`
- `/app/login/page.tsx`
- `/lib/supabase-browser.ts`
- `/components/GoogleAnalytics.tsx`

**Dependencies**:
- Apple Developer Account access (confirmed available)
- Google Cloud Console project setup
- Supabase OAuth provider configuration

**Testing Requirements**:
- iOS Safari (required for Apple approval)
- Android Chrome
- Desktop browsers
- "Hide My Email" scenario
- Error handling (user denies permission)

---

### 2. Migrate Garmin Authentication to OAuth 2.0

**Status**: ✅ COMPLETED (2026-03-03) — Replaced password-based auth with official OAuth 2.0 flow. See `docs/COMPLETED_WORK.md` for details.

---

### 19. Training Insights / Physiological Feedback

**Status**: Ready to plan

**Source**: User feedback (2026-02-20)

**Description**: Provide feedback on current fitness, compliance with plan, and physiological insights. Users want to understand how to modulate effort based on what's actually happening physiologically — not just follow a static plan.

**Why It Matters**:
- This is the core value proposition — adaptive coaching based on real data
- Currently plans are generated but don't deeply analyze actual vs. prescribed training
- User feedback: "I never follow a plan 100%... but I'm keen to gain insights on how to modulate my effort based on what's actually happening to me physiologically."

**Key Features**:
- Track actual training vs planned (compliance analysis)
- Weekly compliance insights in emails and dashboard
- Trend analysis for pace, HR, and effort over time
- Physiological feedback: "Your easy pace has improved 15s/mi over 4 weeks"
- Flag mismatches: "You ran your easy runs too fast this week"

**Expected Impact**: High (core differentiator, directly addresses user retention)

**Effort**: Large (compliance tracking, actual vs planned analysis, trend insights)

**Next Step**: Track actual training vs planned; generate weekly compliance insights; add trend analysis for pace/HR/effort

---

### 20. Mobile UX Audit & Fixes
**Status**: ✅ COMPLETED (2026-03-03) — Fixed modal margins, summary stacking, grid spacing, header stacking across GoalWizard, StepPlanPreview, dashboard, TrainingPlanView.

---

### 22. Don't Report Resting HR for Strava-Only Users
**Status**: ✅ COMPLETED (2026-03-03) — Stopped reporting fake RHR from activity data. Removed RHR-based recovery adjustments for Strava users.

---

### 23. Training Plan — Add Run Frequency Support
**Status**: ✅ COMPLETED (2026-03-03) — Added `runs_per_week` field, GoalWizard input, and planner logic to distribute miles across preferred run days.

---

### 24. Training Plan — Special Handling for "Return from Injury" Goal
**Status**: ✅ COMPLETED (2026-03-03) — Added recovery phase (0.7x multiplier), no speed work, conservative progression, safety caps.

---

## 🟡 Medium Priority - Quick Wins

### 21. Update Homepage Messaging for Non-Race Runners
**Status**: ✅ COMPLETED (2026-03-03) — Broadened landing page copy to include base building, injury recovery, general fitness goals.

---

### 3. Social Proof Numbers

**Status**: User prefers not to show yet, but available when ready

**Description**: Display active user count, total plans generated, or other social proof metrics on landing page.

**Why It Matters**:
- Builds trust through "wisdom of the crowd"
- Most effective when numbers are significant (500+ users)
- Can show trending metrics ("+47 runners this week")

**Context**:
- User explicitly removed placeholder user counts
- Waiting until metric is substantial enough to be impressive
- Original plan included "Join 1,247 runners" style messaging

**Implementation Ideas**:
- Real-time counter from database query
- Milestone celebrations ("Just hit 1,000 runners!")
- Platform-specific counts ("327 Garmin runners, 189 Strava runners")
- Activity metrics ("12,847 personalized plans generated")

**Expected Impact**: Low-Medium (5-10% trust increase)

**Files to Modify**:
- `/app/page.tsx`
- `/app/api/stats/route.ts` (new)

**Dependencies**:
- Sufficient user base to make numbers impressive
- Decision on which metrics to show

---

### 4. Testimonials Section

**Status**: Waiting for real user testimonials

**Description**: Add authentic user success stories with photos, names, and specific results.

**Why It Matters**:
- Provides social proof and relatability
- Addresses skepticism ("Does this actually work?")
- Most effective with specific, measurable results

**Context**:
- Explicitly removed from landing page because no testimonials available yet
- Need to collect real user feedback first

**Implementation Ideas**:
- 3-4 testimonials with photos
- Specific results: "Ran my first marathon injury-free" or "Cut 10 minutes off my 10K"
- Runner demographics: Age, running level, location
- Rotating carousel on mobile

**Expected Impact**: Medium (15-20% trust increase)

**Files to Create**:
- `/components/Testimonials.tsx`

**Files to Modify**:
- `/app/page.tsx`

**Dependencies**:
- Collect 5-10 real user testimonials
- Get permission to use names/photos
- Verify claims are accurate

**How to Collect**:
- Email survey to active users (30+ days)
- In-app feedback prompt after completing 4+ weeks
- Incentive: Featured on homepage

---

### 13. Add Speed Work / Pace-Specific Workouts to Plans

**Status**: Ready to plan

**Source**: User feedback (2026-02-20)

**Description**: Current plans lack speed-specific work. Add interval sessions, VO2max workouts, and threshold runs with pace zones derived from user data.

**Why It Matters**:
- High value for experienced runners who want to hit time goals, not just complete distances
- Currently plans are volume-focused without enough pace/speed variety
- Builds on the "Get Faster" goal type (already implemented)

**Key Features**:
- VO2max-based pace zone calculation
- Interval sessions (e.g. 6x800m at 5K pace)
- Threshold/tempo workouts with specific paces
- Fartlek and progression runs
- Speed work frequency based on experience level and goal

**Expected Impact**: Medium-High (differentiator for experienced runners)

**Effort**: Large (planner logic overhaul for speed sessions, VO2max intervals, threshold work)

**Next Step**: Research pace-based training plan generation; consider integrating VO2max data for pace zones

---

## 🟢 Low Priority - Nice to Have

### 17. Non-Negotiable Workouts / Plan Adaptation

**Status**: Ready to plan

**Source**: User feedback (2026-02-20)

**Description**: Allow users to mark certain workouts as non-negotiable (e.g. "I always run with my club on Wednesdays") and have the plan adapt around them.

**Why It Matters**:
- Real runners have fixed commitments; plans that ignore these feel generic
- User feedback: "It would be good to be able to adapt it with non-negotiable workouts that are already in the plan."

**Expected Impact**: Medium (improves plan adherence and user satisfaction)

**Effort**: Large (new data model for fixed workouts + planner adaptation logic)

**Next Step**: Design UX for marking fixed workout slots; determine how planner redistributes remaining volume

---

### 5. Interactive Email Preview

**Status**: Current implementation is static; could be enhanced

**Description**: Upgrade the current static email preview to an interactive demo where users can see different training scenarios.

**Why It Matters**:
- Shows adaptability to different fitness levels
- Demonstrates personalization
- Helps users visualize their own plan

**Context**:
- Current landing page has static email preview showing one sample week
- Could allow toggling between beginner/intermediate/advanced examples
- Could show "week 1 vs week 8" progression

**Implementation Ideas**:
- Tabs: "Beginner Plan" | "Marathon Plan" | "Injury Recovery"
- Toggle: "Your Week 1" vs "Your Week 12" to show progression
- Highlight adaptive elements: "Adjusted for last week's fatigue"

**Expected Impact**: Low (5-8% engagement increase)

**Files to Modify**:
- `/app/page.tsx`

**Dependencies**: None

---

### 6. A/B Testing Framework

**Status**: Infrastructure for testing conversion optimizations

**Description**: Implement ability to A/B test headlines, CTAs, colors, and layout variations to optimize conversion rate.

**Why It Matters**:
- Data-driven optimization
- Avoid guessing what works
- Continuous improvement

**Implementation Ideas**:
- Split.io or custom implementation
- Test variants:
  - Headline A: "Train Smarter. Run Faster. Avoid Injury."
  - Headline B: "Your AI Running Coach. Personalized. Free Forever."
- Track: CTR, signup rate, time on page
- Minimum 1,000 visitors per variant for statistical significance

**Expected Impact**: Medium (Enables continuous optimization)

**Files to Create**:
- `/lib/ab-testing.ts`
- `/app/admin/ab-tests/page.tsx`

**Files to Modify**:
- `/app/page.tsx`
- `/components/GoogleAnalytics.tsx`

**Dependencies**:
- Sufficient traffic (500+ weekly visitors)
- Analytics setup

---

### 7. Additional OAuth Providers

**Status**: After Apple + Google are successful

**Description**: Add Microsoft, Facebook, or Strava OAuth for signup.

**Why It Matters**:
- Marginal conversion improvement
- Strava integration especially relevant for target audience

**Context**:
- Only implement after Apple + Google are live and showing success
- Strava is unique because users may already have account

**Priority Order**:
1. Strava (running-specific, users likely already have account)
2. Microsoft (enterprise users, cross-platform)
3. Facebook (widespread but declining trust)

**Expected Impact**: Low (3-5% additional conversions)

**Files to Modify**:
- Same as Apple + Google OAuth implementation

**Dependencies**:
- Apple + Google OAuth already implemented and working
- Provider developer accounts

---

### 8. Sample Week Comparison
**Status**: ✅ COMPLETED (2026-02-06) — Side-by-side "Generic vs Personalized" plan comparison on landing page.

---

### 9. Video Demo

**Status**: Future content idea

**Description**: 30-60 second explainer video showing how RunPlan.fun works.

**Why It Matters**:
- Some users prefer video over reading
- Can explain complex concepts quickly
- Shareable on social media

**Implementation Ideas**:
- Screen recording of connecting Garmin → receiving email
- Voiceover explaining personalization
- Animated data flow diagram
- Host on YouTube, embed on landing page

**Expected Impact**: Low (5-7% engagement for video-preferring users)

**Files to Modify**:
- `/app/page.tsx`

**Dependencies**:
- Video production skills or contractor
- Screen recordings of actual platform

**Alternative**: User-generated content from satisfied customers

---

### 10. FAQ Expansion

**Status**: Current FAQ has 7 questions; could expand if needed

**Description**: Add more FAQ questions based on actual user questions and conversion data.

**Why It Matters**:
- Preemptively addresses objections
- Reduces support burden
- Improves SEO with long-tail keywords

**Current Questions** (implemented):
1. Is it really free forever?
2. Which running platforms do you support?
3. Will I get spammed with emails?
4. How does the AI work?
5. Can I customize my training plan?
6. What if I'm new to running?
7. Is my data secure?

**Potential Additional Questions**:
- "What if I miss a workout?"
- "Can I train for multiple race distances?"
- "How is this different from a running coach?"
- "Does it work for ultra-marathons?"
- "Can I share my plan with my coach?"
- "What devices are compatible?"
- "How often do plans get updated?"
- "Can I pause my plan for vacation/injury?"

**Expected Impact**: Very Low (2-3% for specific edge cases)

**Files to Modify**:
- `/app/page.tsx`

**Dependencies**:
- User research to identify common questions
- Support ticket analysis

---

## 📊 Success Metrics to Track

Once features are implemented, track these metrics to measure impact:

### Conversion Funnel
- [ ] Landing page → Signup page click rate (Target: 25-30%)
- [ ] Signup page → Account created (Target: 60%+)
- [ ] Account created → Platform connected (Target: 80%)
- [ ] Platform connected → First email sent (Target: 95%)

### Social Auth (when implemented)
- [ ] Social vs email signup method selection rate (Target: 50-60% social)
- [ ] Time to complete signup (Target: <30 seconds for social)
- [ ] OAuth error rate (Target: <5%)

### Landing Page Engagement
- [ ] Bounce rate (Target: <50%)
- [ ] Scroll depth to "How It Works" (Target: >60%)
- [ ] Email preview section engagement (Target: >40% view)
- [ ] FAQ accordion opens (Track which questions most opened)

### Overall Business Metrics
- [ ] Weekly active users (WAU)
- [ ] Retention rate (% still active after 4 weeks)
- [ ] Platform connection success rate
- [ ] Email open rate (training plans sent)

---

## 🛠 Technical Debt / Infrastructure

Items that don't directly impact conversion but improve maintainability:

### Webpack Cache Warnings
- **Issue**: "Serializing big strings (102kiB) impacts deserialization performance"
- **Impact**: Dev server performance
- **Priority**: Low (doesn't affect production)

### Next.js Config Warning
- **Issue**: `experimental.serverActions` deprecated config option
- **Fix**: Remove from next.config.js
- **Status**: ✅ COMPLETED (2026-03-03)

### TypeScript Types for Supabase
- **Issue**: Some operations require `as any` casting
- **Fix**: Regenerate Supabase types from schema
- **Priority**: Low (doesn't affect functionality)

---

## 📝 How to Use This Backlog

1. **Regular Review**: Review this file at the start of each work session
2. **Prioritize by Impact**: Focus on High Priority items first
3. **Update Status**: Mark items as "In Progress" or "Completed" as you work
4. **Add New Ideas**: Append new ideas with context as they come up
5. **Move Completed Items**: Archive completed items to `COMPLETED.md` to keep this file focused

**Quick Reference Commands**:
- View this file: `cat BACKLOG.md | less`
- Search for item: `grep -i "social auth" BACKLOG.md`
- Count pending items: `grep "^### " BACKLOG.md | wc -l`

---

## 💡 New Ideas

Add new ideas here with brief description, then organize into appropriate priority section:

<!-- Template:
### [Item Name]
**Quick Summary**: One sentence
**Why**: One sentence on impact
**Next Step**: What needs to happen first
-->

<!-- Add new ideas below this line -->

### Completed Items (see `docs/COMPLETED_WORK.md` for details)
- ✅ #8: Sample Week Comparison (2026-02-06)
- ✅ #11: Ultra Marathon Distance Display (2026-02-20)
- ✅ #12: "Get Faster" Fitness Goal (2026-02-20)
- ✅ #14: Custom Race Distance & Race Name (2026-02-20)
- ✅ #15: Dual Unit Display (2026-02-20)
- ✅ #16: Configurable Taper (2026-02-20)
- ✅ #18: Health Snapshot Empty States (2026-02-20)

### Promoted Items
- #13: Speed Work → 🟡 Medium Priority (see above)
- #17: Non-Negotiable Workouts → 🟢 Low Priority (see above)
- #19: Training Insights → 🔴 High Priority (see above)

