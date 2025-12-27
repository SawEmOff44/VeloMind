# VeloMind Advanced Route Features

## Overview
VeloMind's Route Detail page now includes 6 advanced features for GPX route analysis and interaction:

## 1. 🔄 Route Reversing
**Purpose**: View routes from the opposite direction

**Features**:
- One-click route reversal button in the header
- Automatically recalculates distances from new start point
- Updates start/finish markers on map
- Visual indicator shows when route is reversed
- All charts and stats update accordingly

**How to use**: Click "⟲ Reverse Route" button in the top-right corner

---

## 2. 📍 Custom Waypoints
**Purpose**: Mark important points along the route (nutrition stops, photo spots, danger zones)

**Features**:
- Click anywhere on the map to add a waypoint
- Custom markers appear at selected locations
- Waypoints persist in localStorage
- Each waypoint has a popup with remove button
- Waypoints survive page refreshes

**How to use**: 
1. Click on the map at desired location
2. Waypoint marker appears with popup
3. Click "Remove" in popup to delete waypoint

---

## 3. 🏔️ Climb Detection & Categorization
**Purpose**: Automatically identify and classify significant climbs

**Algorithm**:
- Minimum 3% gradient required
- Minimum 100m (328 ft) distance required
- Categories follow Tour de France standards:
  - **HC** (Hors Catégorie): Most difficult, 80,000+ difficulty score
  - **Cat 1**: 50,000+ difficulty score
  - **Cat 2**: 30,000+ difficulty score
  - **Cat 3**: 15,000+ difficulty score
  - **Cat 4**: 8,000+ difficulty score
- Difficulty score = Elevation gain (m) × Average grade (%)

**Display**:
- Grid of climb cards with category badges
- Each card shows: distance, elevation gain, avg/max grade
- Color-coded by category (dark red for HC → yellow for Cat 4)
- Click on climb card to pan map to climb location
- Climb circles on map show climb start positions

---

## 4. 🎯 Interactive Chart ↔ Map
**Purpose**: Synchronize chart and map for detailed route analysis

**Features**:
- Click on elevation chart to highlight location on map
- Click on grade chart to highlight location on map
- Red dot appears on both charts at selected point
- Red circle appears on map at selected location
- Map automatically pans to selected point
- Popup shows elevation and distance data

**How to use**: Click anywhere on the elevation or grade profile charts

---

## 5. ⚡ Speed & Time Predictions
**Purpose**: Estimate ride duration and average speed

**Physics Model**:
- Based on rider FTP (Functional Threshold Power)
- Factors in rider mass and aerodynamic drag (CdA)
- Considers gradient for each segment
- Uses realistic power-to-speed calculations

**Default Parameters**:
- FTP: 250 watts
- Mass: 85 kg (187 lbs)
- CdA: 0.32 (road bike position)

**Display**:
- Estimated time card (hours and minutes)
- Average speed card (mph)
- Highlighted with gradient backgrounds
- Updates automatically when route is reversed

---

## 6. 🌈 Segment Difficulty Colors
**Purpose**: Visual heatmap showing difficult sections

**Color Scale**:
- **Dark Blue**: -5% to -2% (downhill)
- **Blue**: -2% to 0% (slight downhill)
- **Green**: 0% to 2% (flat)
- **Yellow**: 2% to 5% (moderate climb)
- **Orange**: 5% to 10% (hard climb)
- **Red**: 10% to 15% (very hard climb)
- **Dark Red**: 15%+ (extreme climb)

**Features**:
- Route polyline divided into colored segments
- Each segment reflects the gradient
- Semi-transparent for better map visibility
- Updates when route is reversed

---

## Technical Implementation

### Files Modified
- `RouteDetail.jsx` - Main component with all feature integration
- `climbAnalysis.js` - Climb detection algorithm
- `routeUtils.js` - Route manipulation and prediction utilities

### Key Technologies
- **React**: Component state management
- **Leaflet**: Interactive maps
- **Recharts**: Interactive charts
- **localStorage**: Waypoint persistence

### State Management
- `selectedPoint`: Currently highlighted point from chart click
- `waypoints`: Array of custom markers
- `showReversed`: Toggle for route direction
- `riderParams`: Power/mass/CdA for predictions

---

## Future Enhancements

### Potential Additions
1. **Waypoint Types**: Categorize waypoints (nutrition, photo, danger, rest)
2. **Route Segments**: Split route into custom segments with lap times
3. **Weather Integration**: Show wind/temp forecasts along route
4. **Strava Segments**: Overlay popular Strava segments
5. **Turn-by-Turn**: Navigation cues for complex routes
6. **Elevation Totals**: Separate ascent vs descent tracking
7. **Power Zones**: Show predicted power zones for each segment
8. **Custom Parameters**: UI to adjust FTP/mass/CdA

### User Settings
- Save custom rider parameters
- Preferred unit system (metric/imperial)
- Default map tile style
- Chart color preferences

---

## Color Palette
All features use VeloMind brand colors:
- **Cyan**: `#06b6d4` - Primary action color
- **Blue**: `#0284c7` - Secondary highlights
- **Teal**: `#14b8a6` - Success states
- **Green**: `#10b981` - Positive metrics

---

## Performance Notes
- Climb detection runs once on route load
- Route reversal recalculates distances efficiently
- Chart interactions use React's event system
- Map markers use Leaflet's optimized rendering
- localStorage capped at waypoint data only (small footprint)

---

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Touch-optimized charts and maps

---

## Data Requirements
Routes must have:
- GPS coordinates (latitude/longitude)
- Elevation data for each point
- Distance calculated between points

Missing elevation data will:
- Disable climb detection
- Show flat grade profiles
- Set all segments to green color
