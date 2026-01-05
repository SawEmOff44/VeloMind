# VeloMind - Smart Cycling Performance App

## Overview

VeloMind is a production-quality iOS app that estimates real-time power output, pacing efficiency, and fatigue using BLE sensors, GPS, route data, wind data, and historical training data from Strava.

**Target Audience:** Serious endurance cyclists  
**Key Feature:** Real-time estimated power without a physical power meter

---

## Tech Stack

- **Platform:** iOS 17+
- **Language:** Swift / SwiftUI
- **Build Tool:** Xcode
- **Backend:** Render (to be configured)
- **Database:** Neon (Postgres) (to be configured)
- **Auth:** Sign in with Apple (to be implemented)
- **Weather API:** Open-Meteo
- **Version Control:** Git

---

## Project Structure

```
VeloMind/
├── VeloMind/
│   ├── VeloMindApp.swift          # App entry point
│   ├── RideCoordinator.swift      # Central coordinator for all ride functionality
│   ├── Info.plist                 # App configuration
│   ├── BLE/
│   │   └── BLEManager.swift       # Bluetooth sensor management
│   ├── Location/
│   │   └── LocationManager.swift  # GPS tracking
│   ├── Routes/
│   │   ├── GPXParser.swift        # GPX file parsing
│   │   └── RouteManager.swift     # Route matching and grade calculation
│   ├── Weather/
│   │   └── WeatherManager.swift   # Open-Meteo integration
│   ├── PowerEngine/
│   │   ├── PowerEngine.swift      # Physics-based power calculation
│   │   └── CalibrationManager.swift # CdA and Crr calibration
│   ├── Strava/
│   │   ├── StravaManager.swift    # OAuth and API integration
│   │   └── FitnessManager.swift   # Training load and fitness modeling
│   ├── Persistence/
│   │   ├── PersistenceManager.swift # Local data storage
│   │   └── ExportManager.swift    # CSV/GPX export
│   ├── Models/
│   │   ├── SensorData.swift
│   │   ├── Route.swift
│   │   ├── WindData.swift
│   │   ├── RiderParameters.swift
│   │   ├── StravaModels.swift
│   │   └── RideSession.swift
│   └── UI/
│       ├── ContentView.swift      # Main tab view
│       ├── RideView.swift         # Live ride display
│       ├── RouteView.swift        # Route management
│       ├── HistoryView.swift      # Strava activities and fitness
│       └── SettingsView.swift     # Settings and calibration
└── VeloMind.xcodeproj/
    └── project.pbxproj
```

---

## Core Modules

### 1. BLE Sensor Management (`BLE/BLEManager.swift`)

**Features:**
- CoreBluetooth integration
- Cycling Speed & Cadence (CSC) service (UUID 0x1816)
- Heart Rate service (optional)
- Automatic reconnection on dropout
- Wheel revolution → speed calculation
- Crank revolution → cadence calculation

**Key Classes:**
- `BLEManager`: Main manager for BLE operations
- `SensorData`: Data model for sensor readings

### 2. GPS & Route Intelligence (`Location/` + `Routes/`)

**Features:**
- High-accuracy GPS tracking
- GPX file import (via Share Sheet or Files app)
- Route matching (projects GPS onto route)
- Off-course detection (30-50m threshold)
- Grade calculation (30m responsive, 150m stable windows)
- Elevation smoothing

**Key Classes:**
- `LocationManager`: GPS tracking
- `RouteManager`: Route processing and matching
- `GPXParser`: XML parsing for GPX files

### 3. Weather & Wind (`Weather/WeatherManager.swift`)

**Features:**
- Open-Meteo API integration
- Fetch every 60s or 0.5-1 mile traveled
- Headwind/tailwind vector calculation
- Offline caching with decay (30 min)
- Background updates

**Key Classes:**
- `WeatherManager`: Weather API client
- `WindData`: Wind data model

### 4. Power Calculation Engine (`PowerEngine/`)

**Physics Model:**
```
P_total = P_aero + P_roll + P_grav + P_drivetrain_loss

P_aero = 0.5 * rho * CdA * v_air^3
P_roll = Crr * m * g * v * cos(grade)
P_grav = m * g * grade * v
P_drivetrain = ~3-4% loss
```

**Features:**
- Real-time power estimation
- 3s and 10s smoothed power
- Normalized Power (NP) calculation
- Altitude-adjusted air density
- CdA calibration from known power

**Key Classes:**
- `PowerEngine`: Main power calculation
- `RiderParameters`: Mass, CdA, Crr, drivetrain loss
- `CalibrationManager`: CdA and Crr calibration workflows

### 5. Calibration System (`PowerEngine/CalibrationManager.swift`)

**Modes:**
1. **Steady-State:** 10-15 minute consistent effort to refine CdA
2. **Coast-Down:** Coast from 30→20 km/h to estimate rolling resistance

**Features:**
- Progress tracking
- Per-position profiles (hoods/drops)
- Historical calibration sessions

### 6. Strava Integration (`Strava/`)

**Features:**
- OAuth 2.0 authentication
- Activity import (distance, time, elevation, HR, cadence, speed)
- Activity streams (lat/lon, altitude, velocity)
- FTP estimation from historical power
- Training Stress Score (TSS) calculation
- Acute Training Load (ATL) and Chronic Training Load (CTL)
- Form estimation (TSB = CTL - ATL)

**⚠️ Required Configuration:**
-- Configure `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` in the backend environment (Render/Neon)
-- Connect Strava via the web app/backend OAuth flow; iOS reads Strava state via backend endpoints

**Key Classes:**
- `APIService`: Strava status + activities via backend
- `StravaManager`: Legacy client (OAuth should be backend-only)
- `FitnessManager`: Training load modeling
- `StravaActivity`, `StravaStreams`: Data models

### 7. Fitness Modeling (`Strava/FitnessManager.swift`)

**Metrics:**
- **ATL (Acute Training Load):** 7-day exponential weighted average
- **CTL (Chronic Training Load):** 42-day exponential weighted average
- **TSB (Training Stress Balance):** CTL - ATL
- **Form Status:** Fresh / Optimal / Productive / Fatigued / High Fatigue

**Features:**
- FTP estimation from Strava data
- Pacing recommendations based on duration and fatigue
- Power zone guidance

### 8. Live Ride UI (`UI/RideView.swift`)

**Primary Display:**
- Power (10s average) - Large, prominent
- Speed (km/h)
- Cadence (rpm)

**Secondary Display:**
- Wind (head/tail)
- Grade (%)
- Duration
- Distance

**Controls:**
- Start/Pause/Stop ride
- Real-time updates (1 Hz)

### 9. Data Persistence (`Persistence/`)

**Local Storage:**
- UserDefaults for settings and small data
- Full ride time series with data points
- Routes and calibration sessions

**Export:**
- CSV format with all ride data
- GPX format with track points and extensions
- FIT format (planned for future)

**Key Classes:**
- `PersistenceManager`: Save/load operations
- `ExportManager`: CSV/GPX generation

---

## Running the Project

### Prerequisites

1. **macOS** with Xcode 15+ installed
2. **iOS Device** (iPhone) with iOS 17+ for testing
   - Simulator can be used but BLE and GPS won't work
3. **BLE Sensors:**
   - Speed sensor (wheel-based)
   - Cadence sensor
   - Optional: Heart rate strap

### Setup Steps

1. **Clone the repository:**
   ```bash
   cd /Users/williamskiles/git/VeloMind
   ```

2. **Open in Xcode:**
   ```bash
   open VeloMind.xcodeproj
   ```

3. **Configure Signing:**
   - Select the VeloMind target
   - Go to "Signing & Capabilities"
   - Select your development team
   - Xcode will generate a provisioning profile

4. **Configure Strava (Optional but recommended):**
   - Create a Strava API application at https://www.strava.com/settings/api
   - Copy Client ID and Client Secret
   - Update `StravaManager.swift` lines 12-13
   - Add URL scheme to Info.plist:
     ```xml
     <key>CFBundleURLTypes</key>
     <array>
         <dict>
             <key>CFBundleURLSchemes</key>
             <array>
                 <string>velomind</string>
             </array>
         </dict>
     </array>
     ```

5. **Build and Run:**
   - Connect iPhone via USB
   - Select iPhone as target
   - Press Cmd+R or click Run button
   - Accept location and Bluetooth permissions on device

### First Run Checklist

1. ✅ Grant Location permission (When In Use)
2. ✅ Grant Bluetooth permission
3. ✅ Go to Settings tab → Sensors → Scan for devices
4. ✅ Connect speed and cadence sensors
5. ✅ (Optional) Import a GPX route via Routes tab
6. ✅ (Optional) Connect Strava in Settings tab
7. ✅ Start a ride from Ride tab

---

## Testing Without Physical Sensors

### Simulating BLE Sensors

Since BLE doesn't work in the iOS Simulator, you'll need a physical device. However, you can:

1. **Use nRF Connect app** on another device to broadcast fake CSC data
2. **Modify BLEManager.swift** to inject mock data:
   ```swift
   // Add to BLEManager for testing
   func injectMockData() {
       currentSpeed = 8.3  // 30 km/h
       currentCadence = 85.0
       currentHeartRate = 145
   }
   ```

3. **Call mock injection** in RideCoordinator update loop when testing

### Simulating GPS

- GPS works in the Simulator with pre-defined locations
- Use Xcode → Debug → Simulate Location → Apple (or custom GPX)
- For outdoor testing, just use real GPS

### Testing Offline Behavior

1. Enable Airplane Mode on device
2. Start a ride
3. App should:
   - Continue using BLE sensors
   - Use last known wind data (with decay)
   - Track GPS (GPS works offline)
   - Calculate power with cached parameters

---

## Key Assumptions & Design Decisions

### Power Calculation
- **Default CdA:** 0.32 m² (hoods position, typical road bike)
- **Default Crr:** 0.0045 (road tires on asphalt)
- **Default Mass:** 85 kg (75kg rider + 10kg bike)
- **Air Density:** 1.225 kg/m³ adjusted for altitude
- **Drivetrain Loss:** 3%

### Route Matching
- **On-route threshold:** 40 meters
- **Off-route warning:** After 10 seconds beyond threshold
- **Grade windows:** 30m (responsive) and 150m (stable)

### Weather
- **Update interval:** 60 seconds or 800 meters
- **Cache decay:** 30 minutes exponential decay
- **Fallback:** Last known value with decay toward neutral

### Fitness Modeling
- **ATL time constant:** 7 days
- **CTL time constant:** 42 days
- **FTP estimation:** 95% of best 20-minute power

---

## Known TODOs & Limitations

### Immediate TODOs
1. **Strava OAuth:** Need to implement proper OAuth callback handling
2. **Sign in with Apple:** Backend integration needed
3. **Backend Setup:** 
   - Deploy to Render
   - Configure Neon database
   - Store Strava tokens server-side
4. **Webhooks:** Auto-sync new Strava activities
5. **Proper Xcode project:** Current .pbxproj is minimal placeholder

### Future Features (DO NOT IMPLEMENT YET)
- Predictive pacing based on route profile
- Climb previews with power recommendations
- Real-time fatigue modeling
- Effort scoring
- Web dashboard
- AI-assisted coaching
- FIT file export

### Current Limitations
- No background ride recording (needs testing)
- No Apple Watch companion app
- No turn-by-turn navigation
- Basic offline support (can be improved)
- UserDefaults for persistence (consider Core Data for large datasets)
- No multi-user support yet

---

## Debugging Tips

### BLE Issues
```swift
// Enable verbose logging in BLEManager
private let logger = Logger(subsystem: "com.velomind.app", category: "BLE")
```

Check logs:
```bash
# In Xcode, filter Console by "BLE" subsystem
```

### GPS Accuracy Issues
- Ensure Location permission is "When In Use" or "Always"
- Check `desiredAccuracy` is set to `kCLLocationAccuracyBest`
- Outdoor testing recommended for GPS

### Power Calculation Issues
- Verify speed is non-zero
- Check grade values are reasonable (-0.3 to 0.3 typically)
- Confirm wind data is being fetched
- Review CdA and Crr values in Settings

---

## Performance Considerations

### Battery Life
- GPS + BLE + computation is power-intensive
- Typical ride: 3-4 hours at 100% brightness
- Recommendations:
  - Lower screen brightness
  - Enable auto-lock (with caution)
  - Close background apps

### Data Storage
- Full ride at 1 Hz = ~3600 data points/hour
- Each point ~200 bytes = ~720 KB/hour
- UserDefaults limit: ~1 MB total recommended
- **Consider Core Data for production** if storing many rides

### Network Usage
- Open-Meteo API: ~1 KB per request
- Strava API: ~10-50 KB per activity
- Minimal data usage overall

---

## API Rate Limits

### Open-Meteo
- Free tier: 10,000 requests/day
- VeloMind usage: ~60 requests/hour = ~180 requests per 3-hour ride
- **Well within limits**

### Strava
- Rate limit: 100 requests per 15 minutes, 1000 requests per day
- VeloMind usage: Initial sync ~30 requests, then minimal
- **Stay within limits with proper caching**

---

## Building for TestFlight

### Release Build Steps

1. **Archive the app:**
   ```
   Product → Archive
   ```

2. **Distribute:**
   - Window → Organizer
   - Select archive
   - Distribute App → App Store Connect
   - Upload

3. **TestFlight Setup:**
   - Go to App Store Connect
   - Select app
   - TestFlight tab
   - Add internal/external testers
   - Submit for beta review (external only)

4. **Beta Testing Checklist:**
   - Test on multiple iPhone models
   - Test with actual BLE sensors
   - Test offline behavior
   - Test battery drain over full ride
   - Verify permissions are requested properly

---

## Contact & Support

**Developer:** William Skiles  
**Repository:** /Users/williamskiles/git/VeloMind  
**Date Created:** December 25, 2025

---

## License

[To be determined - Add license information]

---

## Acknowledgments

- **Open-Meteo:** Free weather API
- **Strava:** Activity data and API
- **Apple:** CoreBluetooth, CoreLocation, SwiftUI frameworks
- **Cycling Community:** Physics formulas and power modeling research
