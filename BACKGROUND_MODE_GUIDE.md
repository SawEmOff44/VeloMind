# Background Mode Implementation & Testing Guide

## Overview
VeloMind now supports full background operation, allowing the intelligence engine to continue analyzing routes and providing audio alerts even when the screen is off or the app is in the background.

---

## What's Been Implemented

### 1. Background Capabilities (`Info.plist`)
Added three background modes:
- **`location`**: Continuous GPS tracking in background
- **`bluetooth-central`**: Sensor data collection with screen off
- **`audio`**: Voice alerts and speech synthesis in background

### 2. BackgroundTaskManager (`Services/BackgroundTaskManager.swift`)
New service managing background execution:

**Lifecycle Management:**
- Monitors app entering/leaving background
- Manages background task tokens
- Tracks background time remaining
- Handles app suspension/resumption

**Audio Session Management:**
- Configures AVAudioSession for background playback
- Category: `.playback` with mode `.spokenAudio`
- Options: `.mixWithOthers`, `.duckOthers` (plays nicely with music)
- Activates on ride start, deactivates on ride stop

**Battery Optimization:**
- Detects low power mode via `ProcessInfo`
- Adjusts update interval: 1s normal, 5s low power
- Monitors background time remaining
- Logs warnings when <30s remaining

**Status Monitoring:**
- `isInBackground`: Published boolean for UI
- `backgroundTimeRemaining`: Published time interval
- `getStatusDescription()`: Human-readable status

### 3. RideCoordinator Integration
Enhanced ride lifecycle:

**On Ride Start:**
```swift
- Configure audio session for background
- Activate audio session
- Start location tracking
- Start BLE scanning
- Start intelligence engine
- Start update loop (adaptive interval)
```

**On Ride Stop:**
```swift
- Stop all services
- Deactivate audio session
- Release background task
```

**Adaptive Update Loop:**
- Normal: 1 second interval
- Low Power Mode: 5 second interval
- Automatically adjusts when power mode changes
- Observer for `.NSProcessInfoPowerStateDidChange`

### 4. UI Enhancements (`RideView.swift`)

**BackgroundStatusBanner:**
New banner displayed when app is in background:
- Yellow moon icon
- "Background Mode" label
- Low power mode indicator (battery icon + "Low Power")
- Background time remaining (in minutes)
- Yellow-to-orange gradient background
- Only visible when `isInBackground == true`

**Placement:**
- Top of ride screen (above navigation box)
- Automatic show/hide based on background state
- Adjusts padding for other elements

---

## How Background Mode Works

### iOS Background Execution
iOS provides ~3 minutes of background execution time by default. VeloMind extends this through:

1. **Location Updates** (unlimited with proper permissions)
   - `allowsBackgroundLocationUpdates = true`
   - `pausesLocationUpdatesAutomatically = false`
   - `showsBackgroundLocationIndicator = true` (blue bar shown)
   - Continues GPS tracking with screen off

2. **Audio Session** (unlimited while playing)
   - Audio session keeps app alive
   - Voice alerts maintain background state
   - `.mixWithOthers` allows music to play simultaneously
   - `.duckOthers` reduces music volume during alerts

3. **Background Task** (3 minutes baseline)
   - Provides fallback time for non-audio/location tasks
   - Automatically renewed
   - Monitored for expiration

### What Continues in Background:
✅ GPS tracking (location updates)
✅ BLE sensor data (speed/cadence/heart rate)
✅ Route-ahead analysis (2-mile lookahead)
✅ Power calculations (all physics models)
✅ Intelligence engine (power zones, recommendations)
✅ Audio alerts (voice announcements)
✅ Route navigation (proximity warnings)
✅ Learning engine (segment detection)

### What's Limited in Background:
⚠️ Screen updates (UI not visible but state maintained)
⚠️ Weather updates (reduced frequency)
⚠️ Update loop (5s interval in low power mode vs 1s)

---

## Testing Instructions

### Test 1: Basic Background Operation

1. **Setup:**
   - Load a GPX route with climbs
   - Start ride with navigation
   - Ensure audio alerts enabled

2. **Enter Background:**
   - Press home button or lock screen
   - Observe blue location indicator bar at top
   - BackgroundStatusBanner should appear when returning

3. **Verify Continued Operation:**
   - Let app run for 2-3 minutes in background
   - Return to app
   - Check that:
     - Ride time continued
     - Distance continued tracking
     - Power calculations updated
     - Route position advanced

4. **Test Audio Alerts:**
   - Position yourself near a steep climb (>8% grade)
   - Lock screen
   - Should hear: "Steep climb ahead: X percent grade in X miles"
   - Audio should be clear and not cut off

### Test 2: Low Power Mode

1. **Enable Low Power Mode:**
   - Settings → Battery → Low Power Mode ON
   - Or Control Center → Battery icon

2. **Start Ride:**
   - Observe BackgroundStatusBanner shows battery icon
   - Update loop should use 5-second interval

3. **Verify Reduced Frequency:**
   - Lock screen
   - Audio alerts still work but UI updates less often
   - Battery drain should be ~50% lower

4. **Disable Low Power Mode:**
   - Turn off low power mode
   - Update loop should automatically switch to 1s interval

### Test 3: Music Playback Integration

1. **Start Music:**
   - Open Apple Music / Spotify
   - Start playing a song

2. **Start VeloMind Ride:**
   - Music should continue playing
   - VeloMind audio session should not interrupt

3. **Trigger Audio Alert:**
   - Approach steep climb or force alert
   - Music should duck (reduce volume)
   - Alert plays clearly
   - Music returns to normal volume after alert

4. **Lock Screen:**
   - Music controls still available on lock screen
   - VeloMind continues tracking in background

### Test 4: Long Ride (Battery Test)

1. **Full Charge:**
   - Start with 100% battery

2. **3-Hour Ride:**
   - Load long route (50+ miles)
   - Start ride with screen mostly off
   - Check battery at 1hr, 2hr, 3hr intervals

3. **Expected Battery Usage:**
   - Screen on: ~30-40% per hour
   - Screen off (normal): ~10-15% per hour
   - Screen off (low power): ~5-8% per hour

4. **Verify Data Quality:**
   - All ride data captured
   - No gaps in GPS track
   - Power calculations complete
   - Audio alerts triggered appropriately

### Test 5: Background Time Monitoring

1. **Start Ride:**
   - Observe initial background time (should be ~180s)

2. **Lock Screen:**
   - Return to app after 1-2 minutes
   - Check BackgroundStatusBanner for time remaining

3. **Verify Renewal:**
   - Time should reset when location updates occur
   - Time should reset when audio plays
   - Should never run out during active ride

4. **Warning Logs:**
   - Check Xcode console for warnings if <30s remaining
   - Should see: "Low background time remaining: Xs"

### Test 6: Interruption Handling

1. **Phone Call During Ride:**
   - Start ride
   - Receive/make phone call
   - VeloMind should pause but maintain state
   - Resume tracking after call ends

2. **App Switcher:**
   - Start ride
   - Open app switcher (double-click home)
   - Switch to other apps
   - Return to VeloMind
   - Ride should continue without gaps

3. **Force Background:**
   - Start ride
   - Open another app (Maps, Safari, etc.)
   - Use that app for 5+ minutes
   - Return to VeloMind
   - Check data continuity

---

## Battery Optimization Tips

### For Users:
1. **Use Low Power Mode** on long rides (3+ hours)
2. **Lock Screen** when not actively viewing metrics
3. **Reduce Screen Brightness** if screen needed
4. **Disable Unnecessary Sensors** (only connect needed BLE devices)
5. **Use Airplane Mode** if no internet needed (offline navigation)

### For Developers:
1. **Adaptive Update Interval** based on power mode ✅
2. **Coalesce Location Updates** (use significant location changes on flat sections)
3. **Cache Weather Data** (reduce API calls)
4. **Lazy Intelligence** (skip complex calculations when far from climbs)
5. **Background Task Renewal** (maintain background status) ✅

---

## Troubleshooting

### Issue: Audio Alerts Not Playing in Background
**Cause:** Audio session not configured or not activated
**Solution:**
- Check Info.plist has `audio` background mode
- Verify `configureAudioSession()` called in `startRide()`
- Check Xcode logs for audio session errors
- Ensure device not in silent mode (alerts use system audio)

### Issue: GPS Stops When Screen Off
**Cause:** Background location updates not enabled
**Solution:**
- Check Info.plist has `location` background mode
- Verify `allowsBackgroundLocationUpdates = true` in LocationManager
- Check location permission is "Always" not "When in Use"
- Look for blue location bar at top when in background

### Issue: Battery Drains Too Fast
**Cause:** Update loop too aggressive or location accuracy too high
**Solution:**
- Enable low power mode for automatic 5s interval
- Consider reducing location accuracy on long flat sections
- Check for unnecessary weather API calls
- Profile with Instruments to find hotspots

### Issue: App Terminates After 3 Minutes
**Cause:** Background task not renewed, audio not playing, location not updating
**Solution:**
- Check location updates are continuous (not paused)
- Verify audio alerts trigger periodically
- Monitor background time remaining in BackgroundStatusBanner
- Check Xcode console for background task warnings

### Issue: BackgroundStatusBanner Not Showing
**Cause:** `isInBackground` not publishing correctly
**Solution:**
- Check NotificationCenter observers setup in BackgroundTaskManager
- Verify @Published property is updating
- Test by adding print statements to app lifecycle methods
- Force background by locking screen and returning

---

## Code Flow Diagram

```
User Presses "Start Ride"
         ↓
RideCoordinator.startRide()
         ↓
    ┌────┴────┐
    │Configure│
    │  Audio  │
    │ Session │
    └────┬────┘
         ↓
    ┌────┴────┐
    │ Activate│
    │  Audio  │
    │ Session │
    └────┬────┘
         ↓
    ┌────┴────────────────────┐
    │Start All Services:      │
    │- LocationManager        │
    │- BLEManager             │
    │- IntelligenceEngine     │
    │- LearningEngine         │
    │- Update Loop (adaptive) │
    └────┬────────────────────┘
         ↓
User Locks Screen
         ↓
BackgroundTaskManager Detects
         ↓
    ┌────┴────┐
    │  Start  │
    │ Bkgrnd  │
    │  Task   │
    └────┬────┘
         ↓
    ┌────┴────────────────────┐
    │All Services Continue:   │
    │- GPS tracking (blue bar)│
    │- BLE sensors            │
    │- Power calculations     │
    │- Intelligence analysis  │
    │- Audio alerts (voice)   │
    └────┬────────────────────┘
         ↓
Audio Alert Triggered
         ↓
    ┌────┴────┐
    │  Duck   │
    │  Music  │
    └────┬────┘
         ↓
    ┌────┴────┐
    │  Speak  │
    │  Alert  │
    └────┬────┘
         ↓
    ┌────┴────┐
    │ Restore │
    │  Music  │
    └────┬────┘
         ↓
User Unlocks Screen
         ↓
BackgroundTaskManager Detects
         ↓
    ┌────┴────┐
    │   End   │
    │ Bkgrnd  │
    │  Task   │
    └────┬────┘
         ↓
UI Updates with Fresh Data
```

---

## Monitoring & Debugging

### Xcode Console Logs
Look for these key messages:

**Audio Session:**
```
Audio session configured for background playback
Audio session activated
Audio session deactivated
```

**Background Tasks:**
```
App entered background
Started background task: 12345
Low background time remaining: 25s
Ended background task: 12345
```

**Location Updates:**
```
Started GPS tracking
Location: 37.7749, -122.4194, accuracy: 5m
Stopped GPS tracking
```

**Power Mode:**
```
Low power mode enabled, using 5s interval
Low power mode disabled, using 1s interval
```

### Instruments Profiling
Profile with these tools:
1. **Energy Log** - Battery impact analysis
2. **Time Profiler** - CPU usage in background
3. **Allocations** - Memory leaks
4. **Core Location** - GPS efficiency

### Background Mode Indicator
iOS shows these system indicators:
- **Blue bar**: Location updates active (VeloMind tracking)
- **Green bar**: Phone call active
- **Red bar**: Screen recording / Siri

---

## Files Modified

### New Files:
1. `/VeloMind/Services/BackgroundTaskManager.swift` (167 lines)
   - Complete background lifecycle management
   - Audio session configuration
   - Battery optimization
   - Status monitoring

### Modified Files:
1. `/VeloMind/Info.plist`
   - Added `audio` to UIBackgroundModes array

2. `/VeloMind/RideCoordinator.swift`
   - Added backgroundTaskManager instance
   - Audio session activation in startRide()
   - Audio session deactivation in stopRide()
   - Adaptive update loop with power mode detection
   - NotificationCenter observer for power changes

3. `/VeloMind/UI/RideView.swift`
   - Added BackgroundStatusBanner component
   - Conditional display based on background state
   - Shows low power mode indicator
   - Shows background time remaining

---

## Next Steps: Testing Checklist

### Before Committing:
- [ ] Test basic background operation (lock screen, verify continued tracking)
- [ ] Test audio alerts in background (should hear voice)
- [ ] Test with music playing (should duck during alerts)
- [ ] Test low power mode (5s interval, battery icon)
- [ ] Test app switcher (open other apps, return)
- [ ] Test phone call interruption
- [ ] Test long ride (2+ hours with screen off)
- [ ] Verify BackgroundStatusBanner appears correctly
- [ ] Check battery usage in Settings → Battery
- [ ] Review Xcode console logs for errors

### iOS Permissions:
- [ ] Location: "Always" (not just "When in Use")
- [ ] Bluetooth: Enabled
- [ ] Notifications: Enabled (for waypoint alerts)
- [ ] Background App Refresh: Enabled

### Real-World Validation:
- [ ] Ride with phone in pocket (screen off)
- [ ] Verify audio alerts audible through earbuds
- [ ] Check data completeness after ride
- [ ] Measure actual battery drain
- [ ] Test in hot weather (thermal throttling)
- [ ] Test in cold weather (battery performance)

---

## Phase 2 Progress Update

**Previously: 60% Complete**
- ✅ Core intelligence engine
- ✅ Power zone system
- ✅ Audio alerts
- ✅ UI components

**Now: 80% Complete**
- ✅ Background mode support ← NEW
- ✅ Audio session management ← NEW
- ✅ Battery optimization ← NEW
- ✅ Background status UI ← NEW
- ⏳ Apple Watch integration (next)
- ⏳ Advanced audio features (remaining)

**Remaining for Phase 2 (20%):**
- Apple Watch app with key metrics
- Enhanced visualizations (charts)
- Advanced audio preferences
- Final polish and testing

---

## User Value Proposition

**Before Background Mode:**
> "I have to keep the screen on to see my metrics, which drains battery."

**After Background Mode:**
> "I can lock my phone and put it in my pocket. VeloMind keeps tracking, analyzing the route ahead, and giving me voice alerts for steep climbs. My battery lasts the entire 3-hour ride, and I can listen to music at the same time."

This is essential for real-world usage - nobody wants to keep their phone screen on for a 3-hour ride!
