# Phase 2 UI Components - Visual Guide

## New Intelligence Features During Ride

### 1. Power Zone Gauge (Top Component)

```
┌─────────────────────────────────────────────────────────┐
│ POWER ZONE                        245W  (98% FTP)       │
├─────────────────────────────────────────────────────────┤
│ ┌───┬───┬───┬───────┬───┬───┐                          │
│ │░░░│░░░│░░░│███████│░░░│░░░│  ◄─ Colored zone bar    │
│ │░░░│░░░│░░░│███████│░░░│░░░│     (active zone bright) │
│ └───┴───┴───┴───▼───┴───┴───┘     ▲                    │
│              Target Zone           White border         │
│                                                          │
│ Threshold ──→ VO2 Max            91-105% FTP           │
│ (current)     (target)           (zone range)           │
└─────────────────────────────────────────────────────────┘

Color Legend:
┌─────────────────────────────────────────────────────────┐
│ Gray    = Recovery (0-55% FTP)                          │
│ Blue    = Endurance (56-75% FTP)                        │
│ Green   = Tempo (76-90% FTP)                            │
│ Yellow  = Threshold (91-105% FTP)                       │
│ Orange  = VO2 Max (106-120% FTP)                        │
│ Red     = Anaerobic (121%+ FTP)                         │
└─────────────────────────────────────────────────────────┘
```

**Purpose**: Show current effort level and recommended zone for upcoming terrain

**Key Features**:
- 6 colored segments representing all power zones
- White border highlights current zone
- Down arrow indicates target zone
- Real-time wattage and FTP percentage
- Zone name and FTP range displayed

---

### 2. Route Ahead Card (Main Intelligence Display)

```
┌─────────────────────────────────────────────────────────┐
│ ⊙ Next 1.8 Miles                      [ VERY HARD ]    │
│                                          (orange)        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [↑ +350 ft]  [% 6.5% avg]  [⌚ 8m]                    │
│  (orange)     (yellow)      (green)                     │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Current            Target              225-245W        │
│  ● Endurance   →    ● Threshold        target range    │
│  (blue)             (yellow)            (cyan)          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  💡 Increase effort by 45W for upcoming very hard      │
│     section                                             │
│                                                          │
└─────────────────────────────────────────────────────────┘

Background: Cyan-to-blue gradient with subtle border
All text: White for readability
Stats: Color-coded pills (orange/yellow/green)
```

**Purpose**: Preview the next 2 miles of terrain and provide specific coaching

**Key Information**:
- Distance ahead (always 2 miles or less if near end)
- Difficulty level with color badge (Easy/Moderate/Hard/Very Hard/Extreme)
- Elevation gain in feet
- Average grade percentage
- Estimated time to complete section
- Current and target power zones
- Required power range (min-max watts)
- Specific coaching recommendation

---

### 3. Complete Ride View Layout

```
┌─────────────────────────────────────────────────────────┐
│                    🚴 RIDE ACTIVE                        │
│                                                          │
│  ⏱ 1:23:45    📍 18.3 mi    ⚡ 245W    💓 158 bpm    │
│                                                          │
├══════════════════════════════════════════════════════════┤
│                                                          │
│  [POWER ZONE GAUGE] ◄─── NEW: Phase 2                  │
│  Shows current vs target zones                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [ROUTE AHEAD CARD] ◄─── NEW: Phase 2                  │
│  Next 2 miles preview with coaching                     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  CONDITIONS          EFFORT BUDGET                       │
│  ☀️ +15%            ⭕ 68%                              │
│  effort cost         remaining                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🌬 Predicted: ~22.5 mph (headwind)                     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🔺 Upcoming: 0.5 mi @ 8.2% — rec: 230–250W            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🚨 Alerts:                                             │
│  • Going too hard, reduce by 15W                        │
│  • Fatigue building, consider easing pace               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Audio Alert Examples

### Steep Climb Warning
```
🔊 "Steep climb ahead: 9 percent grade in 0.7 miles"
```
- Triggered when grade >8% detected ahead
- Gives distance to climb start
- Spoken at 0.5 rate for clarity

### Power Adjustment Alert
```
🔊 "Increase effort by 45 watts for upcoming climb"
```
- Triggered when required power changes >50W
- Gives specific wattage adjustment
- Helps rider prepare mentally

### 2-Minute Cooldown
```
🔇 (No alerts for 2 minutes after previous alert)
```
- Prevents alert spam
- Allows rider to focus on current effort
- Resets after time period

---

## Difficulty Badge Colors

Visual indicators for route section difficulty:

```
Easy       →  🟢 Green     (score 0-20)
Moderate   →  🔵 Blue      (score 20-40)
Hard       →  🟡 Yellow    (score 40-60)
Very Hard  →  🟠 Orange    (score 60-80)
Extreme    →  🔴 Red       (score 80+)
```

Score = (average grade × 10) + (elevation gain / 10)

Examples:
- Flat 2 miles, 50ft gain: 5 pts = Easy (green)
- Rolling hills, 3% avg, 200ft: 50 pts = Hard (yellow)
- Mountain pass, 7% avg, 800ft: 150 pts = Extreme (red)

---

## Real-World Usage Scenarios

### Scenario 1: Approaching Climb
**Initial Display:**
```
┌─────────────────────────────────────────┐
│ ⊙ Next 2.0 Miles        [ VERY HARD ] │
│ [↑ +450 ft] [% 7.2% avg] [⌚ 9m]      │
│ ● Endurance → ● Threshold  240-260W   │
│ 💡 Increase effort by 50W soon        │
└─────────────────────────────────────────┘
```

**Audio Alert (at 0.5 mi before):**
```
🔊 "Steep climb ahead: 9 percent grade in 0.5 miles"
```

**During Climb:**
```
┌─────────────────────────────────────────┐
│ POWER ZONE          268W  (107% FTP)   │
│ ░░░░░░[████████]░░  (VO2 Max - orange) │
└─────────────────────────────────────────┘
```

### Scenario 2: Recovery Period
**Display:**
```
┌─────────────────────────────────────────┐
│ ⊙ Next 2.0 Miles        [ EASY ]      │
│ [↑ +80 ft] [% 1.5% avg] [⌚ 4m]       │
│ ● Threshold → ● Endurance  130-150W   │
│ 💡 Easy pace ahead, time to recover   │
└─────────────────────────────────────────┘
```

**No audio alert** (not steep, power change manageable)

### Scenario 3: Rolling Terrain
**Display:**
```
┌─────────────────────────────────────────┐
│ ⊙ Next 2.0 Miles        [ MODERATE ]  │
│ [↑ +180 ft] [% 3.2% avg] [⌚ 5m]      │
│ ● Tempo (same as target)   200-220W   │
│ 💡 Maintain current pace for 2 miles  │
└─────────────────────────────────────────┘
```

---

## Design Principles

### 1. At-a-Glance Information
- Key metrics visible in 1-2 seconds
- Color coding for quick understanding
- Icons for universal recognition

### 2. Actionable Coaching
- Specific wattage recommendations
- Clear zone targets
- Distance-based warnings

### 3. Safety First
- Audio alerts for hands-free operation
- 2-minute cooldown prevents distraction
- Clear, slow speech (0.5 rate)
- Minimal screen reading required

### 4. Visual Hierarchy
- Most critical info at top (power zones)
- Route ahead preview prominent
- Supporting metrics below
- Alerts at bottom for reference

### 5. Brand Consistency
- VeloMind cyan-to-green gradient theme
- Consistent corner radius (12-16px)
- White text for readability
- Semi-transparent backgrounds

---

## Mobile Responsiveness

All components automatically adjust to device size:
- iPhone SE: Compact layout, smaller fonts
- iPhone 15: Standard layout as shown
- iPhone 15 Pro Max: Larger elements, more padding
- Landscape mode: Wider cards, horizontal layout

---

## Dark Mode Optimization

Designed for outdoor visibility:
- High contrast colors
- Bright zone indicators
- White text on dark backgrounds
- Semi-transparent panels
- Works well in bright sunlight

---

## Accessibility Features

### Visual
- High contrast colors
- Large touch targets
- Clear typography
- Color-blind friendly zones (uses shapes too)

### Auditory
- Voice announcements for key alerts
- Clear speech rate
- Contextual messages

### Cognitive
- Simple 5-level difficulty system
- Specific wattage numbers (not vague)
- Consistent layout
- Predictable behavior

---

## What Makes This Different

**Other cycling apps:**
- Show current stats only
- Generic "go harder" advice
- Reactive (tell you after you're struggling)
- One-size-fits-all recommendations

**VeloMind Phase 2:**
- Analyzes 2 miles ahead
- Personalized to YOUR FTP
- Proactive (warns before steep sections)
- Specific coaching ("increase 45W")
- Teaches power zones during rides
- Prevents bonking through smart pacing

---

## Next: Apple Watch Complication

Future display on watch face:
```
┌─────────────────┐
│   VELOMIND     │
│                 │
│   245W         │
│ ● THRESHOLD    │
│                 │
│ ↑ +350ft 0.8mi │
└─────────────────┘
```

Tap to open full watch app with zones and route ahead.
