# RunPlan.fun Development Guidelines

## Project Overview

**RunPlan** is a personalized running coach that connects to Garmin Connect or Strava, analyzes training and recovery data, and delivers customized weekly training plans via email. The app helps runners train smarter by adapting plans based on real-time health metrics like resting heart rate, sleep quality, body battery, and VO2 max.

**Live App:** https://fitness-weekly-email.vercel.app

**Value Proposition:** Removes the guesswork from training by automatically adjusting your plan based on how your body is actually recovering, not just what a generic plan says to do.

**Target Users:** Recreational runners training for 5K, 10K, half marathon, or marathon goals who use Garmin or Strava.

---

## Development Workflow

### ⚠️ Before Starting New Feature Work

**REQUIRED:** Review `/BACKLOG.md` before beginning any new feature development.

This backlog exists for a reason: to ensure we focus on high-impact work that moves the needle on key metrics (signup conversion, user retention, platform reliability).

**Steps:**
1. Open and review the backlog: `cat BACKLOG.md | less`
2. Check if the proposed work aligns with backlog priorities
3. If adding a new feature not in the backlog:
   - Add it to the "New Ideas" section first
   - Discuss priority with the user
   - Get explicit approval before implementation

### Prioritization Rules

1. **High Priority Items First (🔴)** - Focus on High Priority items in BACKLOG.md before starting other work
   - Example: Social Authentication (deferred but ready to implement)
   - These items have proven high impact (50-70% conversion increases)

2. **Impact Over Effort** - Prefer high-impact, low-effort "quick wins" (🟡 Medium Priority)
   - Example: Exit Intent Modal (10-15% bounce reduction, 3-4 hours)
   - Quick wins compound over time

3. **User-Driven Changes** - Direct user requests always take precedence
   - If user explicitly asks for something, it supersedes backlog priority
   - Use judgment: confirm if request conflicts with high-priority work

4. **Disciplined Flexibility** - Other work is acceptable but should be justified:
   - ✅ Bug fixes can be addressed immediately (broken functionality)
   - ✅ Technical debt that blocks progress (prevents new features)
   - ✅ UX improvements that align with backlog goals (reduces friction)
   - ✅ Refactoring with clear business value (improves maintainability)
   - ❌ "Nice to have" features outside the backlog
   - ❌ Premature optimization without data
   - ❌ Speculative features "users might want someday"

### When to Skip Backlog Review

Skip backlog review **only** for:
- **Bug fixes** - Broken functionality that prevents app from working
- **User explicitly requests specific work** - Direct instructions override backlog
- **Emergency production issues** - Site down, data loss, security breach
- **Documentation updates** - README, comments, inline docs
- **Dependency security updates** - Critical CVEs or security patches

---

## Backlog Management

### Location
- **File:** `/BACKLOG.md`
- **Purpose:** Track all discussed but unimplemented features with priority levels

### Structure
- 🔴 **High Priority** - Deferred but ready (e.g., Social Auth)
- 🟡 **Medium Priority** - Quick wins with good ROI (e.g., Exit Intent Modal)
- 🟢 **Low Priority** - Nice to have, lower impact (e.g., Video Demo, FAQ Expansion)

### How to Use
1. **Regular Review** - Check at the start of each significant work session
2. **Update Status** - Mark items "In Progress" or "Completed" as you work
3. **Add New Ideas** - Append to "New Ideas" section with brief context
4. **Archive Completed** - Move finished items to keep backlog focused
5. **Estimate Impact** - Each item includes estimated impact and effort

### Quick Reference Commands
```bash
# View backlog
cat BACKLOG.md | less

# Search for specific item
grep -i "social auth" BACKLOG.md

# Count pending items by priority
grep "^## 🔴" BACKLOG.md
grep "^## 🟡" BACKLOG.md
grep "^## 🟢" BACKLOG.md
```

---

## Code Quality Standards

### Architecture Patterns

#### Platform Adapters
- **Location:** `/lib/platforms/`
- **Pattern:** Factory pattern with common interface
- **Files:**
  - `interface.ts` - Common PlatformAdapter interface
  - `garmin/` - Garmin Connect implementation
  - `strava/` - Strava API implementation
  - `index.ts` - Factory function to get platform adapter

**When adding a new platform:**
1. Create new directory: `/lib/platforms/[platform-name]/`
2. Implement `PlatformAdapter` interface
3. Add adapter to factory in `index.ts`
4. Use encryption for all tokens (see below)

#### Database Access
- **Always use Supabase client** - Never raw SQL
- **Row Level Security (RLS)** - All tables have RLS policies
- **Server vs Browser:**
  - Server actions: Use `/lib/supabase-server.ts`
  - Client components: Use `/lib/supabase-browser.ts`
  - API routes: Use `/lib/supabase.ts`

#### Authentication
- **Supabase Auth** - All auth flows use Supabase
- **Protected Routes** - Check auth in server components or API routes
- **Sessions** - Handled automatically by Supabase middleware

#### Encryption
- **Sensitive Tokens** - All OAuth tokens and session IDs must be encrypted
- **Utility:** `/lib/encryption.ts`
- **Usage:**
  ```typescript
  import { encrypt, decrypt } from '@/lib/encryption'

  // Before storing
  const encrypted = encrypt(accessToken)

  // When retrieving
  const token = decrypt(encryptedToken)
  ```

#### Styling
- **Tailwind CSS** - Utility-first styling
- **Color Scheme:** Bright, inviting gradients (light theme)
  - Primary: Soft orange/coral tones
  - Accent: Blue gradients
  - Background: White with subtle gradients
- **Responsive:** Mobile-first design (60%+ traffic is mobile)

#### Analytics
- **Google Analytics** - Track conversion events
- **Component:** `/components/GoogleAnalytics.tsx`
- **Events to Track:**
  - Page views
  - CTA clicks ("Get Started", "Connect Garmin", "Connect Strava")
  - Signup completion
  - Platform connection success/failure

### Key Conventions

#### TypeScript
- **Strict mode enabled** - No implicit any
- **Type everything** - Use Supabase generated types from `database.types.ts`
- **Avoid `as any`** - Only when absolutely necessary (regenerate types if needed)

#### React Patterns
- **Server components by default** - Use client components only when needed
- **'use client' directive** - Only for components that use:
  - React hooks (useState, useEffect)
  - Browser APIs (window, localStorage)
  - Event handlers (onClick, onChange)
  - Third-party client libraries

#### Environment Variables
- **All secrets in env vars** - Never commit credentials
- **Naming convention:**
  - `NEXT_PUBLIC_*` - Exposed to browser (public API keys, URLs)
  - Without prefix - Server-only (secrets, service keys)
- **Required vars:** See `.env.example`

#### Database Conventions
- **Table naming:** Snake_case (e.g., `user_profiles`, `platform_connections`)
- **Foreign keys:** Always include `ON DELETE` behavior
- **Timestamps:** Use `created_at` and `updated_at` (use `NOW()` defaults)
- **UUIDs:** All primary keys use UUID v4

#### API Routes
- **File structure:** `/app/api/[feature]/route.ts`
- **HTTP methods:** Export named functions (GET, POST, PUT, DELETE)
- **Error handling:** Return proper status codes and error messages
- **Authentication:** Check auth before processing requests

---

## Testing Requirements

### Before Committing

**Run these checks locally:**

1. **Dev Server** - Verify changes work
   ```bash
   npm run dev
   ```
   - Visit affected pages
   - Test user flows end-to-end
   - Check browser console for errors

2. **Responsive Design** - Test multiple viewports
   - Mobile (375px width) - 60%+ of traffic
   - Tablet (768px width)
   - Desktop (1440px width)
   - Use browser dev tools device emulation

3. **Analytics Verification** - Ensure tracking events fire
   - Open browser console
   - Look for Google Analytics events
   - Verify event names and parameters match expectations

4. **Database Changes** - Test with real Supabase connection
   - Verify RLS policies work correctly
   - Test as different user roles (if applicable)
   - Check that data persists correctly

5. **Error Scenarios** - Test failure cases
   - Network errors (API timeouts)
   - Invalid input (empty forms, bad data)
   - Auth failures (logged out, expired session)
   - Platform API errors (Garmin/Strava down)

### Integration Points to Test

- **Garmin Connection:**
  - Valid credentials → success
  - Invalid credentials → clear error message
  - Session expiry → prompt to reconnect

- **Strava OAuth:**
  - Authorization flow complete
  - User denies permission → handled gracefully
  - Token refresh works

- **Email Delivery:**
  - Test with real email address
  - Check HTML rendering
  - Verify personalization data included

---

## Git Commit Standards

### Commit Messages

**Format:**
```
Brief summary of what changed (50 chars or less)

Optional detailed explanation of WHY this change was made.
Focus on the motivation and context, not what changed
(the diff shows that).

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Good Examples:**
```
Redesign landing page with bright, inviting color scheme

The previous dark theme didn't convey the positive, energetic
vibe we want for a fitness app. New gradient-based design uses
soft orange/coral tones to feel more welcoming.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

```
Add comprehensive webhook logging with idempotency

Garmin webhooks were being processed multiple times, causing
duplicate emails. Added idempotency checks and detailed logging
to debug webhook delivery issues.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Poor Examples:**
```
Update file
```
```
Fix bug
```
```
Changes
```

### Commit Hygiene

- **Descriptive Messages** - Explain the "why" not just the "what"
- **Focused Scope** - One logical change per commit
- **Co-authorship** - Always include Claude co-author tag
- **No Force Push** - To main/master branches (destructive)
- **Test Before Push** - Ensure code runs successfully
- **No Secrets** - Never commit `.env` files or credentials

### Git Safety

- ⚠️ **Avoid destructive operations** - `reset --hard`, `clean -f`, etc.
- ⚠️ **No skip hooks** - `--no-verify` bypasses important checks
- ⚠️ **Check before force push** - Can overwrite upstream work
- ⚠️ **Review before delete** - Branches, files, database records

---

## Pull Request Guidelines

### When Creating PRs

**Use `gh` CLI via Bash tool for all GitHub operations:**
```bash
# Create PR with proper formatting
gh pr create --title "Add social authentication" --body "$(cat <<'EOF'
## Summary
- Implemented Apple and Google OAuth via Supabase Auth
- Reduced signup time from 2min to 15sec
- Added analytics tracking for auth method selection

## Test plan
- [ ] Tested Apple Sign In on iOS Safari
- [ ] Tested Google Sign In on Chrome, Firefox
- [ ] Verified "Hide My Email" scenario works
- [ ] Checked error handling (user denies permission)
- [ ] Confirmed analytics events fire correctly

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### PR Format

**Title:** Short (under 70 characters), descriptive
- Good: "Add social authentication with Apple and Google"
- Bad: "Update auth system with new features and improvements"

**Body Structure:**
```markdown
## Summary
- Bullet points describing key changes
- Focus on user-facing impact
- Include relevant metrics or context

## Test plan
- [ ] Checklist of testing performed
- [ ] Include both happy path and error scenarios
- [ ] Note any manual testing needed

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Before Creating PR

1. **Review full commit history** - Check ALL commits being included
   ```bash
   git log main...HEAD
   git diff main...HEAD
   ```

2. **Run local tests** - Verify nothing broken
3. **Update documentation** - If API or architecture changed
4. **Check for secrets** - Ensure no credentials committed

---

## Current Focus Areas

Based on recent work and backlog priorities:

### 1. Conversion Optimization
**Goal:** Increase landing page → signup completion rate

**Key Initiatives:**
- ✅ Landing page redesign (completed)
- 🔴 Social authentication (deferred, high priority)
- 🟡 Exit intent modal (quick win available)
- 🟡 Social proof numbers (when metrics substantial)

### 2. User Retention
**Goal:** Keep users active after signup

**Key Initiatives:**
- Email quality improvements
- Training plan accuracy (adapt to recovery metrics)
- Weekly mileage auto-calculation from platform data

### 3. Platform Support
**Goal:** Reliable data sync from Garmin and Strava

**Key Initiatives:**
- Webhook debugging tools (admin dashboard)
- Comprehensive logging with idempotency
- Error handling for API failures
- Session expiry handling

### 4. Privacy & Security
**Goal:** Build user trust through transparent data handling

**Key Initiatives:**
- Encryption of all sensitive tokens
- Clear privacy messaging on landing page
- User data deletion capability
- Minimal permission requests

---

## Success Metrics

Track these as we implement features:

### Conversion Funnel
- **Landing → Signup click:** Target 25-30%
- **Signup → Account created:** Target 60%+ (currently low due to form friction)
- **Account → Platform connected:** Target 80%
- **Platform → First email sent:** Target 95%

### User Retention
- **4-week active rate** - Users still engaged after 1 month
- **Email open rate** - Training plan emails opened
- **Weekly mileage accuracy** - Auto-calculated vs manually entered

### Platform Reliability
- **Connection success rate** - Garmin/Strava auth completion
- **Webhook success rate** - Properly processed updates
- **API error rate** - Failed requests to platform APIs

### Social Auth (when implemented)
- **Social vs email signup** - Target 50-60% choose social
- **Time to complete signup** - Target <30 seconds
- **OAuth error rate** - Target <5%

---

## Questions or Clarifications

When unsure about priorities or approach:

1. **Check BACKLOG.md** - Look for context on similar features
2. **Review README.md** - Understand technical architecture
3. **Read CLAUDE.md** - This file (you're here!)
4. **Ask the user directly** - Don't make assumptions about priorities

**Good Questions:**
- "I see social auth is high priority. Should we tackle that before the exit intent modal?"
- "This refactoring will take 4 hours but isn't in the backlog. Is it worth doing now?"
- "Should we add this new feature to the backlog first to discuss priority?"

**Avoid Assuming:**
- "I'll add this extra feature since we're already working on auth"
- "This seems like a good idea, so I'll implement it"
- "The user probably wants this, so I'll include it"

---

## Common Pitfalls to Avoid

### Don't Over-Engineer
- ❌ Adding features not requested
- ❌ Refactoring code that wasn't touched
- ❌ Creating abstractions for one-time operations
- ❌ Premature optimization without data
- ✅ Keep solutions simple and focused

### Don't Skip Security Checks
- ❌ Command injection vulnerabilities
- ❌ XSS in user-generated content
- ❌ SQL injection (use Supabase client, not raw SQL)
- ❌ Unencrypted sensitive tokens
- ✅ Follow OWASP Top 10 guidelines

### Don't Create Unnecessary Files
- ❌ New file when editing existing would work
- ❌ Documentation files not requested
- ❌ Multiple files for simple features
- ✅ Prefer editing existing files

### Don't Work Without Context
- ❌ Proposing changes to code you haven't read
- ❌ Modifying files without understanding current patterns
- ❌ Adding features without checking existing implementations
- ✅ Read files first, understand patterns, then modify

---

## Next Steps

With this CLAUDE.md in place, development workflow should be:

1. **Start of session:** Review BACKLOG.md for current priorities
2. **New feature request:** Check if it aligns with backlog
3. **Implementation:** Follow patterns in this guide
4. **Testing:** Verify locally before committing
5. **Commit:** Write descriptive message with co-author tag
6. **Update backlog:** Mark items completed or add new ideas

This ensures we stay focused on high-impact work while maintaining code quality and consistency across the project.

---

## Document History

**Created:** 2026-02-06
**Purpose:** Establish persistent development guidelines for RunPlan.fun
**Last Updated:** 2026-02-06
