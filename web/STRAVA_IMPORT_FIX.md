# Strava Advanced Data Import Fixes

## Problem Summary
Advanced data from Strava activities (power curves, power distribution, normalized power, max heart rate, max cadence) was not being properly imported and displayed on the website.

## Root Causes Identified

1. **Missing Normalized Power Calculation**: The backend was importing raw power data but not calculating Normalized Power (NP), which is critical for training analysis.

2. **Silent Stream Fetch Failures**: When Strava stream data (detailed time-series data) failed to fetch, errors were being logged but not detailed enough to diagnose issues.

3. **Missing Max Values**: Maximum heart rate and cadence values were not being extracted from stream data or stored in the database.

4. **Empty Power Curves**: Sessions without detailed stream data would show empty power curves and distribution charts.

## Fixes Implemented

### 1. Backend - Strava Route (`/web/backend/src/routes/strava.js`)

#### Added Normalized Power Calculation
- Implemented `calculateNormalizedPower()` function that:
  - Calculates 30-second rolling averages of power data
  - Applies the NP formula: 4th root of the average of the 4th power
  - Returns null if insufficient data (<30 data points)

#### Enhanced Stream Import
- Modified `fetchAndStoreStreams()` to return analytics data:
  - Power data array for NP calculation
  - Max heart rate from stream data
  - Max cadence from stream data
  
#### Updated Session Creation
- Added fields to session insert: `average_heart_rate`, `average_cadence`
- After stream import, calculates and updates:
  - `normalized_power`
  - `max_heart_rate`
  - `max_cadence`

#### Improved Error Logging
- Added detailed error logging for stream fetch failures
- Logs both error object and error message for debugging

### 2. Database Migration (`/web/backend/src/migrations/add_max_hr_cadence_columns.sql`)

Added columns to sessions table:
```sql
ALTER TABLE sessions ADD COLUMN max_heart_rate INTEGER;
ALTER TABLE sessions ADD COLUMN max_cadence INTEGER;
```

### 3. Data Recalculation Script (`/web/backend/src/scripts/recalculate-normalized-power.js`)

Created utility script to fix existing sessions:
- Finds all sessions with power data but missing NP/max values
- Recalculates normalized power from stored data points
- Updates max heart rate and cadence
- Provides progress logging

Usage:
```bash
cd web/backend
node src/scripts/recalculate-normalized-power.js
```

### 4. Frontend - Session Detail Page (`/web/frontend/src/pages/SessionDetail.jsx`)

#### Added Manual Sync Button
- New "Sync Strava Data" button for Strava sessions
- Only visible for sessions imported from Strava
- Allows manual re-fetch of stream data if initial import failed
- Shows spinner animation during sync
- Automatically reloads session data after successful sync

#### Enhanced UI/UX
- Import `ArrowPathIcon` for sync button
- Added `syncing` state to disable button during operation
- Provides user feedback via alerts
- Error handling with user-friendly messages

### 5. API Service (`/web/frontend/src/services/api.js`)

Added new API function:
```javascript
export const syncStravaStreams = (sessionId) =>
  api.post(`/strava/sync-streams/${sessionId}`)
```

## Testing Instructions

### 1. Apply Database Migration
```bash
cd web/backend
psql $DATABASE_URL -f src/migrations/add_max_hr_cadence_columns.sql
```

### 2. Recalculate Existing Sessions
```bash
cd web/backend
node src/scripts/recalculate-normalized-power.js
```

### 3. Test New Import
1. Go to Settings → Strava
2. Click "Sync Activities" (or wait for automatic sync)
3. Check that imported activities now have:
   - Normalized Power value
   - Max Heart Rate
   - Max Cadence
   - Complete power curves
   - Power distribution data

### 4. Test Manual Stream Sync
1. Open a Strava session detail page
2. Click "Sync Strava Data" button
3. Verify detailed data is imported
4. Check power curve and distribution charts populate

## Expected Results

After applying these fixes:

✅ **Normalized Power**: Properly calculated for all activities with power data
✅ **Power Curves**: Show best power for all standard durations (5s, 10s, 20s, 30s, 1min, 2min, 5min, 10min, 20min, 30min, 60min)
✅ **Power Distribution**: Show time in each power zone (Z1-Z5)
✅ **Max Values**: Display max heart rate and cadence
✅ **Better Diagnostics**: Detailed error logs if stream fetch fails
✅ **Manual Recovery**: Ability to re-sync failed imports

## Technical Details

### Normalized Power Formula
```
Rolling Avg[i] = Avg(Power[i-29:i])
NP = (Σ(Rolling Avg ^ 4) / n) ^ 0.25
```

### Stream Types Fetched from Strava
- `time`: Timestamp data
- `latlng`: GPS coordinates
- `distance`: Cumulative distance
- `altitude`: Elevation
- `velocity_smooth`: Speed
- `heartrate`: Heart rate
- `cadence`: Cadence
- `watts`: Power
- `grade_smooth`: Grade/slope

### Database Schema Updates
```sql
-- Sessions table now includes:
normalized_power DECIMAL(8,2)
max_heart_rate INTEGER
max_cadence INTEGER
average_heart_rate INTEGER
average_cadence DECIMAL(6,2)
```

## Troubleshooting

### If power curves are still empty:
1. Check if the session has `strava_activity_id`
2. Use the "Sync Strava Data" button to manually fetch streams
3. Check backend logs for Strava API errors
4. Verify Strava tokens haven't expired

### If NP is not calculated:
1. Ensure session has at least 30 power data points
2. Run the recalculation script
3. Check that power values are non-null in `session_data_points`

### If Strava sync fails:
1. Check Strava API credentials in `.env`
2. Verify Strava tokens are valid
3. Check rate limiting (Strava has API limits)
4. Review detailed error logs in backend console

## Related Files Modified

- `/web/backend/src/routes/strava.js` - Core Strava import logic
- `/web/frontend/src/pages/SessionDetail.jsx` - Session detail UI
- `/web/frontend/src/services/api.js` - API client functions
- `/web/backend/src/migrations/add_max_hr_cadence_columns.sql` - Database migration
- `/web/backend/src/scripts/recalculate-normalized-power.js` - Data repair script

## Future Enhancements

Consider adding:
- Automatic retry logic for failed stream fetches
- Background job to periodically sync missing stream data
- UI indicator showing which sessions have detailed data
- Bulk sync button to fetch streams for all sessions missing data
- Intensity Factor (IF) and Training Stress Score (TSS) calculations
