# Route Features Testing Checklist

## Test Environment
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Browser: Chrome/Firefox/Safari

---

## 1. Route Reversing ✓
- [ ] Navigate to a route detail page
- [ ] Click "⟲ Reverse Route" button
- [ ] Verify "Reversed Direction" badge appears
- [ ] Check start/finish markers swap positions
- [ ] Verify elevation chart updates
- [ ] Verify grade chart updates
- [ ] Check estimated time/speed recalculate
- [ ] Click button again to return to normal

**Expected**: Route displays from opposite direction with accurate data

---

## 2. Custom Waypoints ✓
- [ ] Click on map at any location
- [ ] Verify waypoint marker appears
- [ ] Click marker to see popup
- [ ] Add multiple waypoints (3-5)
- [ ] Click "Remove" button in popup
- [ ] Refresh page
- [ ] Verify waypoints persist after refresh

**Expected**: Waypoints save in localStorage and survive page reload

---

## 3. Climb Detection ✓
- [ ] Load route with climbs (mountainous terrain)
- [ ] Check "Detected Climbs" section appears
- [ ] Verify climb cards show correct data:
  - Distance in miles
  - Elevation gain in feet
  - Average grade percentage
  - Max grade percentage
- [ ] Check category badges (HC, 1, 2, 3, 4)
- [ ] Verify color coding matches severity
- [ ] Click on climb card
- [ ] Verify map pans to climb location
- [ ] Check climb circles on map

**Expected**: Climbs auto-detected with accurate categorization

---

## 4. Interactive Chart-Map ✓
- [ ] Click anywhere on elevation chart
- [ ] Verify red dot appears on chart
- [ ] Verify red circle appears on map
- [ ] Verify map pans to selected location
- [ ] Click elevation circle on map for popup
- [ ] Try clicking grade chart
- [ ] Verify same behavior on grade chart
- [ ] Test multiple points rapidly

**Expected**: Clicking charts highlights exact location on map

---

## 5. Speed/Time Predictions ✓
- [ ] Check "Est. Time" card in stats
- [ ] Verify time format: Xh Ym
- [ ] Check "Avg Speed" card
- [ ] Verify speed in mph
- [ ] Reverse route
- [ ] Verify predictions update
- [ ] Compare with manual calculation:
  - Flat 10 miles ≈ 30 min @ 20 mph
  - Climb 5 miles @ 5% ≈ 25 min @ 12 mph

**Expected**: Reasonable time/speed based on route profile

---

## 6. Difficulty Colors ✓
- [ ] Zoom into route on map
- [ ] Verify polyline has multiple colors
- [ ] Check color transitions:
  - Blue = flat/downhill
  - Green = slight climb
  - Yellow = moderate
  - Orange = hard
  - Red = very hard
- [ ] Compare colors to grade chart
- [ ] Verify colors match grade percentages
- [ ] Test on varied terrain route

**Expected**: Route displays as gradient heatmap

---

## Edge Cases

### No Elevation Data
- [ ] Upload GPX without elevation
- [ ] Verify no climbs detected
- [ ] Check grade profile shows flat
- [ ] Verify all segments are blue/green

### Very Short Route (< 1 mile)
- [ ] Test predictions on short route
- [ ] Check climb detection threshold
- [ ] Verify time calculations

### Very Long Route (> 100 miles)
- [ ] Test performance with many points
- [ ] Check chart rendering speed
- [ ] Verify map responsiveness

### Extreme Grades (> 20%)
- [ ] Test with steep mountain pass
- [ ] Verify color coding handles extremes
- [ ] Check climb categorization

---

## Performance Tests

### Chart Interaction Speed
- [ ] Click chart 10 times rapidly
- [ ] Measure lag/delay
- [ ] Check browser console for errors

**Expected**: < 100ms response time

### Map Rendering
- [ ] Load route with 1000+ points
- [ ] Check initial render time
- [ ] Zoom in/out multiple times
- [ ] Pan around entire route

**Expected**: Smooth 60fps interaction

### Memory Usage
- [ ] Open DevTools > Memory
- [ ] Load route
- [ ] Add 20 waypoints
- [ ] Reverse route multiple times
- [ ] Check for memory leaks

**Expected**: No significant memory growth

---

## Browser Compatibility

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Charts render correctly
- [ ] Map interactions smooth

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Charts render correctly
- [ ] Map interactions smooth

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Charts render correctly
- [ ] Map interactions smooth

---

## Mobile Testing (Bonus)

### iOS Safari
- [ ] Touch interactions work
- [ ] Chart tap detection
- [ ] Map pan/zoom gestures
- [ ] Waypoint placement
- [ ] Responsive layout

### Android Chrome
- [ ] Touch interactions work
- [ ] Chart tap detection
- [ ] Map pan/zoom gestures
- [ ] Waypoint placement
- [ ] Responsive layout

---

## Known Limitations

1. **Waypoints**: No type categorization yet
2. **Predictions**: Uses default rider params (no UI to customize)
3. **Climb Names**: Auto-generated (Climb 1, Climb 2...)
4. **Route Segments**: No custom segment splits
5. **Export**: Can't export reversed route as new GPX

---

## Bug Reporting Template

```
**Feature**: [Route Reversing | Waypoints | Climbs | Charts | Predictions | Colors]
**Browser**: [Chrome/Firefox/Safari + version]
**Issue**: [Describe the problem]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Screenshots**: [If applicable]
**Console Errors**: [Copy from browser console]
```

---

## Success Criteria

All 6 features must:
- ✓ Load without errors
- ✓ Respond to user interactions
- ✓ Display accurate data
- ✓ Update dynamically
- ✓ Persist where appropriate (waypoints)
- ✓ Match VeloMind brand styling
- ✓ Work across browsers

---

## Next Steps After Testing

1. Fix any critical bugs
2. Gather user feedback
3. Implement custom rider params UI
4. Add waypoint type selection
5. Create export reversed route feature
6. Optimize for mobile devices
7. Add keyboard shortcuts
8. Implement undo/redo for waypoints
