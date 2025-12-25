# VeloMind - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Open in Xcode
```bash
cd /Users/williamskiles/git/VeloMind
open VeloMind.xcodeproj
```

### 2. Connect Your iPhone
- Plug in via USB
- Select your iPhone as the target device in Xcode

### 3. Configure Signing
- Click on VeloMind project in navigator
- Select VeloMind target
- Signing & Capabilities tab
- Select your Apple Developer account team

### 4. Build & Run
- Press Cmd+R or click the Run button ▶️
- On first launch, accept:
  - Location permission
  - Bluetooth permission

### 5. Connect Sensors (Optional)
- Go to Settings tab → Sensors
- Tap "Scan"
- Connect your speed/cadence sensors

### 6. Start Riding
- Go to Ride tab
- Tap "Start Ride"
- Monitor your power, speed, and cadence in real-time

---

## 📱 Testing Without Sensors

If you don't have physical BLE sensors:

1. **Modify for testing** - Add to `RideCoordinator.swift`:
   ```swift
   // In updateRideData(), add before power calculation:
   if bleManager.currentSpeed == 0 {
       // Mock data for testing
       let mockSpeed = 8.3  // 30 km/h
       let mockCadence = 85.0
       bleManager.currentSpeed = mockSpeed
       bleManager.currentCadence = mockCadence
   }
   ```

2. **Test with GPS only:**
   - Go outside or use Xcode → Debug → Simulate Location
   - App will use GPS speed as fallback

---

## 🗺️ Import a Route

1. Get a GPX file (from Strava, RideWithGPS, etc.)
2. AirDrop it to your iPhone or use Files app
3. In VeloMind:
   - Go to Routes tab
   - Tap "Import GPX"
   - Select your file
4. Route will load with elevation and grade data

---

## 🔗 Connect Strava (Optional)

### Setup:
1. Go to https://www.strava.com/settings/api
2. Create an application:
   - Name: VeloMind
   - Website: Your choice
   - Authorization Callback Domain: `velomind`
3. Copy your Client ID and Client Secret
4. Open `VeloMind/Strava/StravaManager.swift`
5. Replace lines 12-13 with your credentials
6. Rebuild the app

### Connect in app:
1. Go to Settings → Strava
2. Tap "Connect to Strava"
3. Sign in and authorize
4. Activities will sync automatically

---

## 🎯 Core Features Overview

### Live Ride Screen
- **Big Power Number:** 10-second smoothed power estimate
- **Speed:** From wheel sensor or GPS
- **Cadence:** From crank sensor
- **Wind & Grade:** Real-time environmental factors
- **Duration & Distance:** Ride metrics

### Route Following
- Matches your GPS position to imported route
- Shows current grade (30m and 150m windows)
- Warns if you go off-course

### Calibration
- **Steady-State:** Ride 10-15 min steady to calibrate aerodynamics
- **Coast-Down:** Coast from 30→20 km/h to calibrate rolling resistance

### Fitness Tracking
- Import Strava history
- See Training Load (ATL/CTL)
- Get form status and pacing recommendations

---

## 🐛 Troubleshooting

### Sensors not connecting
- Ensure sensors are awake (spin wheel/crank)
- Check sensor battery
- Make sure they're not connected to another device
- Try turning Bluetooth off/on on iPhone

### GPS not working
- Ensure Location permission is granted
- Go outside for better GPS signal
- Check Settings → Privacy → Location Services

### Power seems wrong
- Check Settings → Rider Parameters
- Verify your mass, CdA, and Crr values
- Consider running a calibration session

### Weather not updating
- Check internet connection
- Open-Meteo may have rate limits
- App caches last wind data for offline use

---

## 📊 Understanding Your Data

### Power Zones (typical)
Based on FTP of 250W:
- **Recovery:** <150W (Zone 1)
- **Endurance:** 150-188W (Zone 2)
- **Tempo:** 188-213W (Zone 3)
- **Threshold:** 213-250W (Zone 4)
- **VO2 Max:** 250-300W (Zone 5)

### Form Status
- **Fresh** (TSB > 10): Well rested, ready for hard efforts
- **Optimal** (TSB 0-10): Peak form, great for racing
- **Productive** (TSB 0 to -10): Training stimulus happening
- **Fatigued** (TSB -10 to -20): Need recovery
- **High Fatigue** (TSB < -20): Overreaching, rest needed

---

## 🔋 Battery Tips

VeloMind is power-intensive. To maximize battery:
- Lower screen brightness
- Use airplane mode if you don't need weather updates
- Close other apps
- Consider an external battery pack for rides >3 hours

---

## 💾 Exporting Data

After a ride:
1. Go to History tab
2. Select your ride
3. Tap Share
4. Export as:
   - **CSV** - For analysis in Excel/Python
   - **GPX** - For uploading to Strava/TrainingPeaks

---

## 🎓 Tips for Accurate Power

1. **Calibrate regularly**
   - Run steady-state calibration every few weeks
   - Recalibrate after position changes or equipment changes

2. **Keep parameters updated**
   - Update mass if you change gear or lose/gain weight
   - Different wheel types need different Crr values

3. **Ensure good data quality**
   - Use wheel sensor instead of GPS for speed
   - Stay on known routes for accurate grade
   - Check that wind is updating

4. **Understand limitations**
   - Estimated power is never perfect
   - Great for training relative effort
   - Not accurate enough for official power records

---

## 📱 Recommended Setup

**During rides:**
- Mount iPhone on handlebars
- Keep screen on (adjust auto-lock in iOS settings)
- Have external battery if ride > 3 hours

**Sensors:**
- Speed sensor on rear wheel (most accurate)
- Cadence sensor on crank arm
- Heart rate strap (optional but recommended)

---

## 🚴‍♂️ Ready to Ride!

You're all set. Start a ride and see your estimated power in real-time. The more you use VeloMind and calibrate, the more accurate it becomes.

**Have a great ride!** 🚴💨
