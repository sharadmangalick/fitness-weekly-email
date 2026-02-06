# RunPlan.fun Product Backlog

This file tracks ideas and features discussed but not yet implemented. Items are organized by priority tier and include context to help decide what to work on next.

Last Updated: 2026-02-05

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

**Estimated Impact**: High (50-70% increase in signup conversions)

**Estimated Effort**: 8 hours
- Supabase OAuth configuration: 1 hour
- AuthProviderButton component: 1 hour
- Update signup page: 2 hours
- Update login page: 1 hour
- OAuth callback handler: 2 hours
- Analytics + testing: 1 hour

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

## 🟡 Medium Priority - Quick Wins

### 2. Exit Intent Modal

**Status**: Discussed as "Quick Win Still Available" in LANDING_PAGE_IMPROVEMENTS.md

**Description**: Display a last-chance offer or value reminder when user attempts to leave the landing page without signing up.

**Why It Matters**:
- Recovers 10-15% of abandoning visitors
- Low implementation cost
- Can A/B test different messaging

**Implementation Ideas**:
- Trigger on mouse moving toward browser chrome (desktop)
- Trigger on back button press (mobile)
- Messaging options:
  - "Wait! See a sample plan first" → Show quick email preview
  - "Join 500+ runners who improved their training" (when comfortable showing numbers)
  - "Free forever - no credit card required"

**Estimated Impact**: Medium (10-15% bounce rate reduction)

**Estimated Effort**: 3-4 hours
- Exit intent detection logic: 1 hour
- Modal component: 1 hour
- Analytics tracking: 1 hour
- Mobile testing: 1 hour

**Files to Create**:
- `/components/ExitIntentModal.tsx`

**Files to Modify**:
- `/app/page.tsx`
- `/components/GoogleAnalytics.tsx`

**Dependencies**: None

**Considerations**:
- Don't show if user already visited signup page
- Frequency cap (once per session, or once per 7 days)
- Must be non-intrusive on mobile

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

**Estimated Impact**: Low-Medium (5-10% trust increase)

**Estimated Effort**: 2 hours
- Database query for counts: 30 minutes
- Landing page integration: 1 hour
- Caching strategy: 30 minutes

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

**Estimated Impact**: Medium (15-20% trust increase)

**Estimated Effort**: 4 hours
- Testimonial component design: 2 hours
- Landing page integration: 1 hour
- Responsive layout: 1 hour

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

## 🟢 Low Priority - Nice to Have

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

**Estimated Impact**: Low (5-8% engagement increase)

**Estimated Effort**: 4-6 hours
- Multiple email templates: 2 hours
- Tab/toggle UI: 2 hours
- Smooth transitions: 1 hour
- Analytics tracking: 1 hour

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

**Estimated Impact**: Medium (Enables continuous optimization)

**Estimated Effort**: 8-12 hours
- Choose framework (Split.io vs custom): 1 hour
- Integration: 4 hours
- Admin dashboard for viewing results: 4 hours
- Documentation: 1 hour

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

**Estimated Impact**: Low (3-5% additional conversions)

**Estimated Effort**: 2 hours per provider
- Strava has running-specific benefits
- Microsoft + Facebook follow same pattern as Google

**Files to Modify**:
- Same as Apple + Google OAuth implementation

**Dependencies**:
- Apple + Google OAuth already implemented and working
- Provider developer accounts

---

### 8. Sample Week Comparison

**Status**: Landing page enhancement idea

**Description**: Side-by-side comparison showing "Generic Training Plan" vs "RunPlan.fun Personalized Plan" for the same week.

**Why It Matters**:
- Clearly demonstrates value proposition
- Shows what makes RunPlan different
- Visual proof of personalization

**Implementation Ideas**:
```
WITHOUT RUNPLAN          |  WITH RUNPLAN
────────────────────────|─────────────────────
Monday: Rest            |  Monday: Rest (recovering from weekend long run)
Tuesday: 5 miles        |  Tuesday: Easy 4mi (adjusted for last week's fatigue)
Wednesday: Speed work   |  Wednesday: 6x400m @ 7:30 pace (based on your PR)
...                     |  ...
```

**Estimated Impact**: Low-Medium (8-12% understanding increase)

**Estimated Effort**: 3 hours
- Comparison table design: 1.5 hours
- Responsive layout: 1 hour
- Copywriting: 30 minutes

**Files to Modify**:
- `/app/page.tsx`

**Dependencies**: None

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

**Estimated Impact**: Low (5-7% engagement for video-preferring users)

**Estimated Effort**: 8-12 hours (production)
- Script writing: 2 hours
- Recording/animation: 4 hours
- Editing: 3 hours
- Hosting + embedding: 1 hour

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

**Estimated Impact**: Very Low (2-3% for specific edge cases)

**Estimated Effort**: 1-2 hours per question
- Copywriting: 30 minutes
- Design integration: 30 minutes

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
- **Effort**: 2-3 hours to investigate and fix
- **Priority**: Low (doesn't affect production)

### Next.js Config Warning
- **Issue**: `experimental.serverActions` deprecated config option
- **Fix**: Remove from next.config.js
- **Effort**: 5 minutes
- **Priority**: Very Low (cosmetic warning only)

### TypeScript Types for Supabase
- **Issue**: Some operations require `as any` casting
- **Fix**: Regenerate Supabase types from schema
- **Effort**: 30 minutes
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

