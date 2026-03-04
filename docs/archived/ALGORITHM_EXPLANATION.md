# RunPlan Training Algorithm - Detailed Explanation

**Purpose**: Reference document for explaining how RunPlan's plan generation algorithm works
**Audience**: Internal reference, user documentation, FAQ content, marketing materials
**Last Updated**: 2026-02-09

---

## Overview

RunPlan generates personalized weekly training plans by combining **9 signals** from your actual training data and recovery metrics. Unlike static training plans, RunPlan adapts every week based on how your body is actually responding to training.

---

## Initial Plan Generation (Onboarding)

### Step 1: Gather User Context

During signup, we collect:
- **Goal type**: 5K, 10K, half marathon, marathon, ultra, or custom distance
- **Race date**: When is your goal race? (optional for general fitness)
- **Current weekly mileage baseline**: Starting point calculated from your last 4 weeks
- **Intensity preference**: Conservative (85%), Normal (100%), or Aggressive (115%)
- **Goal time**: Target finish time (calculates your pace zones)
- **Long run day preference**: Saturday or Sunday

### Step 2: Determine Training Phase

Based on weeks until race:
- **Base building**: >12 weeks out (85% intensity multiplier)
- **Build phase**: 6-12 weeks out (100% multiplier)
- **Peak phase**: 3-6 weeks out (110% multiplier)
- **Taper**: 1-3 weeks out (60% multiplier)
- **Race week**: Race week (30% multiplier)
- **Maintenance**: No race date (for general fitness goals)

### Step 3: Calculate Weekly Mileage

```
weekly_mileage = base_mileage × phase_multiplier × intensity_multiplier × recovery_adjustment
```

**Example**:
```
Base: 30 miles/week
Build phase: 30 × 1.0 = 30 miles
Peak phase: 30 × 1.1 = 33 miles
Conservative intensity: 33 × 0.85 = 28 miles
Recovery adjustment (if fatigued): 28 × 0.85 = 24 miles
```

### Step 4: Structure the Week

The algorithm distributes mileage across 7 days:

**Long Run**: 28-32% of weekly mileage (phase-dependent)
- Capped by goal: 5K→10mi, 10K→12mi, Half→16mi, Marathon→22mi, Ultra→26mi
- Always includes race pace practice in the middle miles

**Tempo Run** (build/peak phases only): ~25% of remaining mileage
- 1 mile warmup + tempo miles at race pace + 1 mile cooldown

**Easy Runs**: 2-3 days, split remaining mileage
- Zone 2 heart rate, conversational pace
- +1-2 min/mile slower than race pace

**Strides**: Friday easy run includes 4×100m strides
- Keeps legs feeling snappy between quality sessions

**Rest Days**: 2-3 days per week
- Monday always follows long run
- Additional rest mid-week depending on volume

### Step 5: Generate Pace Zones

Based on goal time and distance:
- **Target pace**: `goal_time_minutes ÷ distance_miles`
- **Easy pace**: Target + 1-2 min/mile
- **Tempo pace**: Target to Target + 15 seconds
- **Long run**: Start easy, settle into target for middle portion

---

## Weekly Plan Updates (The Adaptive Magic)

Every week (Sunday morning), before generating the next plan:

### Step 1: Fetch Training History

- Retrieve **last 30 days** of running activities from Garmin/Strava
- Analyze last 2-4 complete weeks (exclude current incomplete week)

### Step 2: Update Baseline from Actual Training (NEW!)

Calculate rolling weighted average with safety constraints:

**Weighting Strategy**:
- 2-3 weeks of data: Simple average
- 4+ weeks of data: Last 4 weeks weighted [1, 1, 2, 2] (recent weighted 2x)

**Safety Constraints**:
- ✅ **10% max increase per week** - Prevents injury from ramping too fast
- ✅ **25% max decrease per week** - Allows recovery but avoids over-correction
- ✅ **5 mile/week minimum** - Won't drop to zero
- ✅ **2 week minimum data** - Need sufficient history before adjusting

**Example Scenarios**:

```
Scenario 1: Consistent Training
Baseline: 30 mi/week
Actual: [28, 30, 31, 29] weeks → Weighted avg: 29.5
→ New baseline: 30 mi/week (within tolerance, no change)
Reasoning: "Baseline unchanged - training matches current baseline"

Scenario 2: Missed Weeks (Injury/Travel)
Baseline: 30 mi/week
Actual: [25, 20, 18, 15] weeks → Weighted avg: 18.2
→ Unconstrained would drop to 18, but constrained to 23 (25% max decrease)
Reasoning: "Capped at 25% decrease to avoid over-correction"

Scenario 3: Building Fitness
Baseline: 30 mi/week
Actual: [32, 34, 36, 38] weeks → Weighted avg: 36
→ Unconstrained would jump to 36, but constrained to 33 (10% max increase)
Reasoning: "Capped at 10% increase for safety"

Scenario 4: Insufficient Data
Baseline: 30 mi/week
Actual: Only 1 complete week
→ New baseline: 30 mi/week (no change)
Reasoning: "Need at least 2 weeks of data to update baseline"
```

### Step 3: Analyze Recovery Metrics

Calculate **recovery adjustment** from health signals:

```typescript
function calculateRecoveryAdjustment(analysis: AnalysisResults): number {
  let concerns = 0
  
  if (resting_hr.status === 'concern') concerns++        // +3 bpm from baseline
  if (body_battery.status === 'concern') concerns++      // <60 average wake
  if (sleep.status === 'concern') concerns++             // <6.5h average
  if (rpe.trend === 'rising') concerns++                 // Workouts feeling harder
  if (rpe.fatigue_indicators >= 2) concerns++            // High RPE + low effect
  
  // Volume reduction based on concern count
  if (concerns >= 4) return 0.75  // Reduce 25%
  if (concerns >= 3) return 0.80  // Reduce 20%
  if (concerns >= 2) return 0.85  // Reduce 15%
  if (concerns === 1) return 0.90  // Reduce 10%
  return 1.0  // No reduction
}
```

### Step 4: Regenerate Weekly Plan

```
// Step 1: Update baseline from training history
actual_baseline = calculateRollingAverage(last_4_weeks)
updated_baseline = applyConstraints(actual_baseline, current_baseline)

// Step 2: Calculate this week's volume
recovery_adjustment = calculateRecoveryAdjustment(health_metrics)
phase_multiplier = getPhaseMultiplier(weeks_to_race)
intensity_multiplier = user.intensity_preference

weekly_mileage = updated_baseline × phase_multiplier × intensity_multiplier × recovery_adjustment

// Step 3: Distribute across the week
long_run = weekly_mileage × long_run_percentage[phase]
tempo_run = (weekly_mileage - long_run) × 0.25  // If build/peak
easy_runs = remaining_mileage ÷ 3
rest_days = 2-3 days
```

---

## The 9 Signals Explained

### 1. Training History (Rolling Baseline)

**What it measures**: Actual miles run in last 2-4 weeks

**How it's used**: Becomes your baseline for next week's plan (with safety constraints)

**Why it matters**: Keeps plans grounded in reality, not just theoretical goals

**Thresholds**:
- Max 10% increase per week
- Max 25% decrease per week
- Minimum 2 weeks of data required

### 2. Training Phase

**What it measures**: Weeks until goal race

**How it's used**: Multiplier on baseline volume

**Phases**:
- Base (>12 weeks): 0.85× (building aerobic foundation)
- Build (6-12 weeks): 1.0× (introducing quality workouts)
- Peak (3-6 weeks): 1.1× (highest volume week)
- Taper (1-3 weeks): 0.6× (recovery while maintaining fitness)
- Race week: 0.3× (stay fresh for race day)

### 3. Intensity Preference

**What it measures**: User's chosen training intensity

**How it's used**: Multiplier on weekly volume

**Options**:
- Conservative: 0.85× (less injury risk, slower progress)
- Normal: 1.0× (balanced approach)
- Aggressive: 1.15× (faster progress, higher injury risk)

### 4. Resting Heart Rate (RHR)

**What it measures**: Average morning heart rate, last 14 days vs baseline

**Why it matters**: Early indicator of fatigue/overtraining

**Thresholds**:
- **Good**: Decreased >1 bpm (improving fitness)
- **Normal**: Within ±2 bpm (stable)
- **Concern**: Increased >3 bpm (fatigue/illness)

**Impact**: 1 concern → 10% volume reduction

### 5. Body Battery (Garmin Only)

**What it measures**: Morning energy reserves (0-100 scale)

**Why it matters**: Shows recovery quality overnight

**Thresholds**:
- **Good**: ≥75 average (well-recovered)
- **Normal**: 60-74 (adequate)
- **Concern**: <60 (chronic fatigue)

**Impact**: 1 concern → 10% volume reduction

### 6. Sleep Quality

**What it measures**: Average hours per night, % of nights <6h

**Why it matters**: Sleep is when adaptation happens

**Thresholds**:
- **Good**: ≥7 hours average
- **Normal**: 6.5-7 hours
- **Concern**: <6.5 hours (1.7× injury risk)

**Impact**: 1 concern → 10% volume reduction

### 7. Stress Levels

**What it measures**: Daily stress scores from watch

**Why it matters**: High stress throttles overnight recovery

**Thresholds**:
- **Good**: <35 average
- **Normal**: 35-45
- **Concern**: >45 (impairs recovery)

**Impact**: 1 concern → 10% volume reduction

### 8. RPE Trend (Rate of Perceived Exertion)

**What it measures**: How workouts feel over time

**Why it matters**: Subjective feel is a powerful fatigue indicator

**Analysis**:
- Compare recent 5 activities to earlier ones
- **Rising**: Workouts feeling harder (concerning)
- **Falling**: Workouts feeling easier (good adaptation)
- **Stable**: Normal progression

**Fatigue Indicators**: High RPE (≥6) + Low Training Effect (<2.5) = body struggling

**Impact**: 
- Rising trend → 1 concern → 10% reduction
- ≥2 fatigue indicators → 1 concern → 10% reduction

### 9. Recovery Adjustment (Combined)

**What it measures**: Total concern count from signals 4-8

**How it's calculated**:
```
concerns = sum of all health metric concerns
if concerns >= 4: multiply volume by 0.75
if concerns >= 3: multiply volume by 0.80
if concerns >= 2: multiply volume by 0.85
if concerns == 1: multiply volume by 0.90
else: no adjustment (1.0)
```

**Example**:
- Elevated RHR (+1)
- Poor sleep (+1)
- Rising RPE (+1)
- Total: 3 concerns → 20% volume reduction

---

## Complete Algorithm Formula

```
# Weekly Plan Generation

1. Update baseline from training history:
   actual_average = weightedAverage(last_4_weeks)
   updated_baseline = applyConstraints(actual_average, current_baseline)
   
2. Calculate recovery adjustment:
   concerns = countConcerns(rhr, sleep, body_battery, stress, rpe)
   recovery_adj = getRecoveryMultiplier(concerns)
   
3. Determine phase multiplier:
   phase_mult = getPhaseMultiplier(weeks_to_race)
   
4. Apply intensity preference:
   intensity_mult = user.intensity_preference  // 0.85, 1.0, or 1.15
   
5. Calculate weekly mileage:
   weekly_miles = updated_baseline × phase_mult × intensity_mult × recovery_adj
   
6. Distribute across week:
   long_run = weekly_miles × long_run_pct[phase]
   tempo_run = (weekly_miles - long_run) × 0.25  // If build/peak
   easy_runs = remaining_miles ÷ 3
   rest_days = 2-3 days
```

---

## Real-World Example

**User Profile**:
- Goal: Half marathon in 8 weeks (Build phase)
- Target time: 1:45:00 (8:00/mile pace)
- Original baseline: 30 mi/week
- Intensity: Normal (1.0×)

**Week 1** (Well-recovered):
```
Actual training history: [28, 30, 32, 31] weeks → Weighted avg: 31
Updated baseline: 31 mi/week (within 10% increase limit)
Phase: Build (1.0×)
Intensity: Normal (1.0×)
Recovery: Good (1.0×, 0 concerns)

Weekly mileage: 31 × 1.0 × 1.0 × 1.0 = 31 miles
→ Long run: 10 miles
→ Tempo: 6 miles
→ Easy runs: 5, 5, 5 miles
→ Rest: Mon, Wed, Sat
```

**Week 2** (Poor sleep + elevated RHR):
```
Baseline: 31 mi/week (from last update)
Phase: Build (1.0×)
Intensity: Normal (1.0×)
Recovery: 2 concerns (0.85×)
  - Sleep: 6.2h average (concern)
  - RHR: +4 bpm from baseline (concern)

Weekly mileage: 31 × 1.0 × 1.0 × 0.85 = 26 miles
→ Long run: 9 miles (reduced)
→ Tempo: Removed (fatigue present)
→ Easy runs: 6, 6, 5 miles
→ Rest: Mon, Wed, Fri
```

**Week 3** (Recovered):
```
Baseline: 31 mi/week
Phase: Build (1.0×)
Intensity: Normal (1.0×)
Recovery: Good (1.0×, 0 concerns)

Weekly mileage: 31 × 1.0 × 1.0 × 1.0 = 31 miles
→ Back to normal structure
```

---

## FAQ-Ready Explanations

### Q: How does RunPlan generate my weekly training plan?

**Short Answer** (for FAQ):
> RunPlan analyzes your last 2-4 weeks of actual running plus current recovery metrics (sleep, resting heart rate, stress, body battery) every week. The algorithm combines your base fitness, training phase (base/build/peak/taper), and recovery status to calculate an optimal weekly volume. If you're well-recovered, the plan progresses. If fatigue indicators appear, it automatically reduces volume by 10-25% to prioritize recovery.

**Detailed Answer** (for "How It Works" page):
> Every week, RunPlan analyzes 9 key signals:
> 
> 1. **Your actual training**: Rolling average of last 2-4 weeks (weighted toward recent weeks)
> 2. **Training phase**: Where you are in your training cycle (base/build/peak/taper)
> 3. **Intensity preference**: Conservative, normal, or aggressive progression
> 4. **Resting heart rate**: Early fatigue indicator (elevated = concern)
> 5. **Body Battery**: Morning energy reserves (Garmin users)
> 6. **Sleep quality**: Average hours and consistency
> 7. **Stress levels**: Daily stress from your watch
> 8. **RPE trend**: How workouts feel (rising = harder = fatigue building)
> 9. **Recovery adjustment**: Combined health signal that reduces volume when needed
> 
> These signals are combined into a personalized weekly mileage target, then distributed across the week with long runs, tempo workouts, easy runs, and rest days tailored to your goal and fitness level.

### Q: How is this different from a generic training plan?

**Answer**:
> Generic plans assume you're always recovering perfectly and never miss workouts. RunPlan adapts weekly based on YOUR body's actual signals.
> 
> **Example**: Generic plan says "Week 5: 35 miles"
> - If your RHR is elevated and sleep was poor → RunPlan adjusts to 30 miles
> - If you've been crushing workouts consistently → RunPlan progresses you safely
> - If you missed 2 weeks due to illness → RunPlan adjusts down to match your actual fitness
> 
> It's like having a coach who checks your health data before prescribing each week, not just following a rigid template.

### Q: What if I miss workouts or can't follow the plan?

**Answer**:
> The next week's plan automatically adapts based on what you actually ran (not what was prescribed). 
> 
> - Missed your long run? Next week adjusts mileage down
> - Crushed every workout? Next week builds on that momentum
> - Had a tough week? Algorithm detects elevated RHR or poor sleep and reduces volume
> 
> The plan works with your reality, not against it. No manual adjustments needed.

---

## Key Differentiators vs. Static Plans

| Static Plan | RunPlan (Adaptive) |
|------------|-------------------|
| Fixed weekly mileage | Adjusts based on actual training |
| Assumes perfect recovery | Monitors 8 recovery metrics |
| One-size-fits-all | Personalized to your data |
| Ignores missed workouts | Adapts to what you actually run |
| No safety constraints | 10% max increase, prevents injury |
| Paper or PDF | Delivered weekly via email |

---

## Safety Features Built-In

1. **10% Rule**: Weekly mileage won't increase more than 10% (proven injury prevention)
2. **Recovery Priority**: Automatically reduces volume when fatigue detected
3. **Minimum 2 weeks data**: Won't make changes on insufficient history
4. **25% max decrease**: Allows recovery without over-correcting for one bad week
5. **Phase-appropriate progression**: Base→Build→Peak→Taper structure prevents overtraining
6. **Rest days**: 2-3 per week, Monday always follows long run

---

## Future Enhancements (Roadmap)

1. **Progressive Overload**: Gradually increase baseline 10% every 3-4 weeks when ready
2. **Activity Completion Tracking**: Not just mileage, but which workouts were completed
3. **Multi-sport Adjustment**: Account for cross-training (cycling, swimming)
4. **Goal Alignment**: If race requires 40 mi/week, help build toward it progressively
5. **User Feedback Loop**: "Was this week too hard/easy?" → Adjust algorithm
6. **Seasonal Adjustments**: Off-season vs training season intelligence

---

## Technical References

- Implementation: `/lib/training/planner.ts` - Plan generation logic
- Baseline Updates: `/lib/training/mileage-calculator.ts` - Rolling average calculation
- Health Analysis: `/lib/training/analyzer.ts` - Recovery metrics analysis
- Cron Job: `/app/api/cron/send-emails/route.ts` - Weekly plan generation

---

**Last Updated**: 2026-02-09 (Added automatic baseline updates from training history)
