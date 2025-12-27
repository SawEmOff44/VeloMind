# Phase 2 Implementation: Real-Time Intelligence Engine

## Overview
Phase 2 adds a sophisticated intelligence engine that analyzes the route ahead and provides fitness-based pacing recommendations to prevent bonking and optimize performance.

## What's Been Implemented (60% Complete)

### ✅ 1. Core Intelligence Engine (`IntelligenceEngine.swift`)

#### Route-Ahead Analysis
- **2-Mile Lookahead Window**: Continuously analyzes the next 3,218.69 meters (2 miles)
- **Terrain Analysis**: 
  - Calculates elevation gain by summing positive elevation changes
  - Determines average and maximum grade percentages
  - Filters route points within the lookahead window
  
#### Power Zone System
- **6 Power Zones** based on FTP (Functional Threshold Power):
  - Recovery: 0-55% FTP (Gray)
  - Endurance: 56-75% FTP (Blue)
  - Tempo: 76-90% FTP (Green)
  - Threshold: 91-105% FTP (Yellow)
  - VO2 Max: 106-120% FTP (Orange)
  - Anaerobic: 121%+ FTP (Red)
  
- **Current Zone Tracking**: Monitors rider's current power output and classifies into appropriate zone
- **Target Zone Calculation**: Determines optimal zone for upcoming terrain

#### Required Power Calculation
Smart power estimation based on terrain and rider's FTP:
- **Flat (<2% grade)**: 0.65 × FTP (endurance pace)
- **Slight (2-4% grade)**: 0.80 × FTP (tempo pace)
- **Moderate (4-6% grade)**: 0.90 × FTP (threshold pace)
- **Steep (6-8% grade)**: 1.00 × FTP (at FTP)
- **Very Steep (>8% grade)**: 1.10 × FTP (above FTP)
- **Elevation Adjustment**: Multiplied by [1.0 + (elevation/1000) × 0.05]
- Returns min/max range (±10% for variability)

#### Time Estimation
- Grade-adjusted speed predictions:
  - Flat: 30 mph base speed
  - 2-4%: 18 mph
  - 4-6%: 13 mph
  - 6-8%: 10 mph
  - >8%: 7 mph
- Adjusted by power-to-weight ratio:
  - <2.5 W/kg: -20% speed
  - 2.5-3.5 W/kg: baseline
  - >3.5 W/kg: +15% speed

#### Difficulty Classification
5-level system based on grade and elevation:
- **Easy**: Green (score 0-20)
- **Moderate**: Blue (score 20-40)
- **Hard**: Yellow (score 40-60)
- **Very Hard**: Orange (score 60-80)
- **Extreme**: Red (score 80+)

Score = (grade × 10) + (elevation / 10)

#### Contextual Recommendations
Generates specific coaching messages:
- "Increase effort by 45W for upcoming hard section"
- "Maintain current pace for next 2 miles"
- "Easy pace ahead, time to recover"
- Compares current power to required power
- Suggests specific wattage adjustments

#### Audio Alert System
- **Voice Announcements** using AVSpeechSynthesizer
- **Trigger Conditions**:
  - Grades >8% (steep climb warning)
  - Power changes >50W (significant effort shift)
- **2-Minute Cooldown**: Prevents alert spam
- **Message Format**: 
  - "Steep climb ahead: 10 percent grade in 0.8 miles"
  - "Increase effort by 45 watts for upcoming climb"
- **Speech Rate**: 0.5 (clear, unhurried delivery for safety)

#### Main Update Loop Integration
- Route analysis runs FIRST in update cycle (before other calculations)
- Updates every cycle when route is available
- Calls `analyzeRouteAhead()` and `calculateTargetPowerZone()`
- Updates current power zone based on real-time power data

---

### ✅ 2. UI Components (`RideView.swift`)

#### A. RouteAheadCard
New card component displaying 2-mile preview:

**Header Section:**
- Distance ahead (converted to miles)
- Difficulty badge with color coding
- Forward arrow icon

**Stats Grid:**
- Elevation gain (in feet with imperial conversion)
- Average grade percentage
- Estimated time (formatted as "Xm" or "Xh Ym")

**Power Zone Display:**
- Current zone with color-coded circle
- Arrow indicator
- Target zone (if different from current)
- Required power range (min-max watts)

**Recommendation Panel:**
- Lightbulb icon
- Contextual coaching message
- White text on semi-transparent background
- Rounded corners for modern look

**Styling:**
- Cyan-to-blue gradient background
- Cyan border (30% opacity)
- Full padding and corner radius
- Integrates with VeloMind brand colors

#### B. PowerZoneGauge
Horizontal gauge showing all 6 power zones:

**Header:**
- "POWER ZONE" label
- Current power in watts
- FTP percentage display

**Zone Bar:**
- 6 colored segments representing all zones
- Active zone highlighted (full opacity)
- Inactive zones dimmed (30% opacity)
- White border around current zone
- Down arrow above target zone
- 2px spacing between segments

**Footer Labels:**
- Current zone name in zone color
- Arrow and target zone (if different)
- FTP range percentage (e.g., "56-75% FTP")

**Styling:**
- Gray background (15% opacity)
- Rounded corners
- Horizontal padding
- Integrated above existing intelligence metrics

#### C. StatPill Component
Reusable pill-shaped stat display:
- Icon + value format
- Color-coded backgrounds
- Used in RouteAheadCard for quick stats

---

### ✅ 3. Enhanced Models

#### PowerZone Enum Extensions
- Added `ftpRange` property for display (e.g., "56-75% FTP")
- Made `Hashable` for use in SwiftUI ForEach
- Color-coded for visual clarity
- Provides `range(ftp:)` method for zone calculations

#### RouteAheadAnalysis Struct
Complete data model for route preview:
- Distance ahead (meters)
- Elevation gain (meters)
- Average and max grade (%)
- Required power range (ClosedRange<Double>)
- Estimated time (TimeInterval)
- Difficulty level (DifficultyLevel enum)
- Recommendation string

#### AudioAlert Struct
- Message string
- Priority level
- Timestamp for cooldown tracking

---

## What's Visible to the User

### During a Ride with Route Navigation:

1. **Power Zone Gauge** (Top of intelligence section)
   - See current power zone with color coding
   - View target zone for upcoming terrain
   - Monitor FTP percentage in real-time
   - Visual feedback on effort level

2. **Route Ahead Card** (When route available)
   - Preview next 2 miles of terrain
   - See elevation gain and average grade
   - Understand difficulty level (easy to extreme)
   - Know required power range
   - Get time estimate for section
   - Receive specific coaching recommendations

3. **Audio Alerts** (Automatic)
   - Hear warnings for steep climbs
   - Get notified of significant power changes
   - Hands-free, eyes-on-road safety
   - No alert spam (2-minute cooldown)

4. **Existing Intelligence** (Still active)
   - Environmental load index
   - Effort budget gauge
   - Wind-aware speed predictions
   - Upcoming climb previews
   - Overcooking/fatigue alerts
   - Pacing recommendations
   - Nutrition alerts

---

## Technical Implementation Details

### Files Modified:
1. **IntelligenceEngine.swift**
   - Added ~280 lines of Phase 2 code
   - New published properties: `routeAheadAnalysis`, `currentPowerZone`, `targetPowerZone`, `audioAlert`
   - New methods: `analyzeRouteAhead()`, `updatePowerZone()`, `calculateTargetPowerZone()`, `checkForAudioAlert()`, `speakAlert()`
   - Helper methods: `calculateElevationGain()`, `calculateMaxGrade()`, `calculateRequiredPower()`, `estimateSegmentTime()`, `determineDifficulty()`, `generateRouteRecommendation()`
   - AVFoundation import for speech synthesis

2. **RideView.swift**
   - Enhanced `IntelligenceAlertsView` with RouteAheadCard integration
   - Added `RouteAheadCard` component (100+ lines)
   - Added `PowerZoneGauge` component (90+ lines)
   - Added `StatPill` helper component
   - Integrated into existing UI flow

3. **IntelligenceEngine.swift (Models)**
   - PowerZone enum: Added `Hashable` conformance and `ftpRange` property
   - RouteAheadAnalysis struct: Complete implementation
   - AudioAlert struct: Message delivery system

### Dependencies:
- AVFoundation (for speech synthesis)
- SwiftUI (for UI components)
- Core Location (for route navigation)
- Existing RiderParameters model (for FTP data)

---

## Testing Recommendations

### 1. Route Analysis Testing
- [ ] Test on flat route (should recommend recovery/endurance zones)
- [ ] Test on rolling hills (zone transitions should be smooth)
- [ ] Test on mountain pass (should detect steep sections early)
- [ ] Verify 2-mile lookahead works correctly
- [ ] Check elevation gain calculations

### 2. Power Zone Testing
- [ ] Test with low FTP rider (150W) - should adjust recommendations
- [ ] Test with high FTP rider (350W) - should scale appropriately
- [ ] Verify zone transitions are accurate
- [ ] Check FTP percentage display
- [ ] Test power-to-weight adjustments

### 3. Audio Alert Testing
- [ ] Trigger steep climb alert (>8% grade)
- [ ] Trigger significant power change alert (>50W)
- [ ] Verify 2-minute cooldown works
- [ ] Test speech clarity at 0.5 rate
- [ ] Check alert messages are contextually appropriate

### 4. UI Testing
- [ ] Power zone gauge displays correctly on all devices
- [ ] RouteAheadCard shows all data accurately
- [ ] Colors match VeloMind brand theme
- [ ] Text is readable in sunlight
- [ ] Layout works in landscape mode
- [ ] No UI overlap or clipping

### 5. Battery Testing
- [ ] Monitor battery drain during 3-hour ride
- [ ] Test with background mode (next implementation)
- [ ] Verify speech synthesis doesn't over-consume resources

---

## What's Still TODO for Phase 2 Completion (40%)

### 1. Background Mode Support
- Configure iOS background location capability
- Enable audio in background
- Test with screen off
- Handle app suspension/resumption
- Maintain intelligence engine state

### 2. Apple Watch Integration
- Display key metrics on watch face
- Sync power zone status
- Show route-ahead summary
- Trigger haptic alerts
- Standalone workout mode

### 3. Advanced Audio Features
- Volume control for alerts
- Option to disable certain alert types
- Audio alert history display
- Voice selection (male/female)
- Language localization

### 4. Enhanced Visualizations
- Power zone history chart
- Required vs. actual power graph
- Route difficulty heatmap overlay
- Climb profile with zones

### 5. Personalization
- Adjust alert thresholds per user
- Custom power zone percentages
- Alert frequency preferences
- Voice coaching style (encouraging vs. factual)

---

## How It Works: The Intelligence Loop

```
Every Update Cycle (while riding with route):
1. Get current location from LocationManager
2. Calculate distance traveled on route
3. Look ahead 2 miles from current position
4. Filter route points in lookahead window
5. Calculate elevation gain and grades
6. Determine required power based on terrain + FTP
7. Classify difficulty level (easy to extreme)
8. Compare current power to required power
9. Generate specific recommendation
10. Update current power zone
11. Calculate target zone for upcoming terrain
12. Check if audio alert needed (steep climb or big power change)
13. Respect 2-minute cooldown between alerts
14. Publish updates to UI (SwiftUI observes changes)
15. Display RouteAheadCard and PowerZoneGauge
```

---

## Real-World Example

**Scenario**: Rider approaching a steep climb

```
Initial State:
- Current location: Mile 5.2 of route
- Current power: 180W (Endurance zone, 72% FTP)
- Flat road, easy pace

Intelligence Engine Detects (at mile 5.2):
- Lookahead window: miles 5.2-7.2
- Elevation gain: 350 ft
- Average grade: 6.5%
- Max grade: 9.2%
- Required power: 225-245W (90-98% FTP)
- Difficulty: "Very Hard"
- Time estimate: 8 minutes

RouteAheadCard Shows:
- "Next 2.0 Miles" header
- "Very Hard" badge (orange)
- "+350 ft" elevation pill (orange)
- "6.5% avg" grade pill (yellow)
- "8m" time pill (green)
- Current zone: "Endurance" (blue circle)
- Target zone: "Threshold" (yellow circle with down arrow)
- "225-245W target range"
- Recommendation: "Increase effort by 45W for upcoming very hard section"

Audio Alert Triggers (at mile 5.5):
"Steep climb ahead: 9 percent grade in 0.7 miles. Increase effort by 45 watts."

Rider Response:
- Sees orange difficulty badge
- Hears audio warning
- Gradually increases power to 230W
- Enters Threshold zone (yellow)
- Maintains steady effort through climb
- Avoids bonking by pacing appropriately
```

---

## Key Innovations

1. **Proactive Intelligence**: Looks ahead instead of reacting to current conditions
2. **Personalized Recommendations**: Based on individual FTP, not generic advice
3. **Specific Coaching**: "Increase 45W" instead of "go harder"
4. **Multi-Modal Feedback**: Visual (UI), auditory (voice), and text
5. **Safe Audio Design**: 2-minute cooldown prevents distraction
6. **Difficulty Classification**: Clear 5-level system anyone can understand
7. **Power Zone Integration**: Teaches riders about training zones during actual rides
8. **Time Estimates**: Helps with pacing and mental preparation

---

## Phase 2 Progress: 60% Complete

### ✅ Completed:
- Core intelligence engine with route-ahead analysis
- Power zone system (6 zones with FTP-based ranges)
- Required power calculation with terrain adjustments
- Time estimation with grade-adjusted speeds
- Difficulty classification (5 levels)
- Contextual recommendation generation
- Audio alert system with speech synthesis
- RouteAheadCard UI component
- PowerZoneGauge UI component
- Integration with existing ride view

### 🔄 In Progress:
- Background mode implementation
- Apple Watch integration

### ⏳ Still TODO:
- Advanced audio features (volume, history, preferences)
- Enhanced visualizations (charts, heatmaps)
- Personalization settings
- Comprehensive testing on real routes

---

## Next Steps

1. **Implement Background Mode** (2-3 days)
   - Configure capabilities in Xcode
   - Handle background location updates
   - Maintain audio session
   - Test with screen off

2. **Apple Watch Integration** (3-4 days)
   - Create watch app target
   - Sync key metrics
   - Display power zones
   - Implement haptic alerts

3. **Real-World Testing** (1 week)
   - Ride with actual routes
   - Gather user feedback
   - Tune alert thresholds
   - Optimize battery usage

4. **Polish and Document** (2-3 days)
   - User guide for new features
   - Video demonstration
   - Update screenshots
   - Prepare for Phase 3

**Estimated Time to Phase 2 Completion**: 2-3 weeks

---

## User Value Proposition

**Before Phase 2:**
"VeloMind tells me my current stats and general pacing advice."

**After Phase 2:**
"VeloMind is like having a personal coach in my ear, telling me exactly how much power I need for the climb ahead, warning me when I'm going to blow up, and helping me pace perfectly based on MY fitness level, not generic advice."

This is the transformation from a **data display app** to a **real-time coaching assistant**.
