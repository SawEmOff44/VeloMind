# VeloMind 🚴‍♂️

**Smart Cycling Performance App for iOS**

VeloMind estimates real-time power output without a power meter, using physics-based calculations combined with BLE sensors, GPS, wind data, and route intelligence.

---

## Features

✅ **Real-Time Power Estimation** - Physics-based calculation using speed, grade, wind, and rider parameters  
✅ **BLE Sensor Integration** - Speed, cadence, and heart rate from Bluetooth sensors  
✅ **GPS Route Following** - Import GPX routes with grade calculation and off-course detection  
✅ **Wind Integration** - Real-time headwind/tailwind from Open-Meteo API  
✅ **Calibration System** - Steady-state and coast-down tests to refine CdA and Crr  
✅ **Strava Integration** - Import activities, track fitness (ATL/CTL/TSB), estimate FTP  
✅ **Offline Support** - Continues working with cached wind data in poor cellular coverage  
✅ **Data Export** - CSV and GPX export for further analysis  

---

## Quick Start

### Prerequisites
- iOS 17+ device (iPhone)
- Xcode 15+
- BLE sensors: Speed (wheel-based) and Cadence (optional)
- Apple Developer account (for device deployment)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd VeloMind
   ```

2. **Open in Xcode:**
   ```bash
   open VeloMind.xcodeproj
   ```

3. **Configure signing:**
   - Select VeloMind target
   - Signing & Capabilities → Select your team

4. **Build and run:**
   - Connect iPhone via USB
   - Press Cmd+R

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

---

## Documentation

- **[RUNBOOK.md](RUNBOOK.md)** - Comprehensive technical documentation
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide

---

## Tech Stack

- **iOS 17+** / Swift / SwiftUI
- **CoreBluetooth** - BLE sensor communication
- **CoreLocation** - GPS tracking
- **Open-Meteo API** - Weather and wind data
- **Strava API** - OAuth and activity import

---

## Power Calculation Model

VeloMind uses a physics-based model:

```
P_total = P_aero + P_roll + P_grav

P_aero = 0.5 × ρ × CdA × v_air³
P_roll = Crr × m × g × v × cos(grade)
P_grav = m × g × grade × v
```

**Variables:**
- **CdA** - Aerodynamic drag (m²) - calibrated per riding position
- **Crr** - Rolling resistance coefficient - calibrated per tire/surface
- **m** - Total mass (rider + bike)
- **ρ** - Air density (adjusted for altitude)
- **v** - Speed from wheel sensor or GPS
- **grade** - From route or GPS elevation

---

## Architecture

```
┌──────────────────────────────────────────┐
│         RideCoordinator                  │
│  (Central state management)              │
└────────────┬─────────────────────────────┘
             │
    ┌────────┼────────┬────────┬────────┐
    │        │        │        │        │
┌───▼───┐ ┌─▼──┐ ┌───▼───┐ ┌──▼───┐ ┌─▼────┐
│  BLE  │ │GPS │ │Route  │ │Power │ │Strava│
│Manager│ │Mgr │ │Manager│ │Engine│ │ Mgr  │
└───────┘ └────┘ └───────┘ └──────┘ └──────┘
    │        │        │        │        │
    └────────┴────────┴────────┴────────┘
                     │
              ┌──────▼──────┐
              │  SwiftUI    │
              │  Views      │
              └─────────────┘
```

---

## MVP Feature Checklist

- [x] Live power estimation
- [x] BLE sensor integration (CSC + HR)
- [x] GPS location tracking
- [x] GPX route import and matching
- [x] Wind integration (Open-Meteo)
- [x] Grade calculation (30m + 150m windows)
- [x] Calibration workflows (steady-state + coast-down)
- [x] Strava OAuth and activity import
- [x] Fitness modeling (ATL/CTL/TSB)
- [x] Live ride UI
- [x] Settings and sensor management
- [x] Data persistence
- [x] CSV/GPX export
- [ ] Backend deployment (Render)
- [ ] Database setup (Neon)
- [ ] Sign in with Apple
- [ ] TestFlight distribution

---

## License

[To be determined]

---

## Author

**William Skiles**  
Built for serious endurance cyclists who want power data without a power meter.

---

**Ready to ride?** See [QUICKSTART.md](QUICKSTART.md) to get started in 5 minutes.
