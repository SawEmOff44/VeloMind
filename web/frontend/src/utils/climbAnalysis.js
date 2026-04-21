// Climb detection and categorization utilities

/**
 * Detects climbs in a route based on gradient and distance
 * @param {Array} points - Route points with elevation and distance
 * @returns {Array} Array of climb objects
 */
export function detectClimbs(points) {
  if (!points || points.length < 2) return []
  
  const climbs = []
  let inClimb = false
  let climbStart = null
  let climbPoints = []
  
  const MIN_CLIMB_GRADE = 3 // Minimum 3% grade to be considered a climb
  const MIN_CLIMB_DISTANCE = 100 // Minimum 100 meters
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    
    const distDiff = curr.distance - prev.distance
    const elevDiff = (curr.elevation || 0) - (prev.elevation || 0)
    const grade = distDiff > 0 ? (elevDiff / distDiff) * 100 : 0
    
    if (grade >= MIN_CLIMB_GRADE) {
      if (!inClimb) {
        inClimb = true
        climbStart = {
          ...prev,
          index: i - 1
        }
        climbPoints = [{ ...prev, grade: 0, index: i - 1 }]
      }
      climbPoints.push({ ...curr, grade, index: i })
    } else if (inClimb) {
      // End of climb - check if it meets minimum criteria
      const climbDistance = climbPoints[climbPoints.length - 1].distance - climbStart.distance
      const climbElevation = (climbPoints[climbPoints.length - 1].elevation || 0) - (climbStart.elevation || 0)
      
      if (climbDistance >= MIN_CLIMB_DISTANCE && climbElevation > 0) {
        const grades = climbPoints.slice(1).map(p => p.grade)
        climbs.push({
          startIndex: climbStart.index,
          endIndex: climbPoints[climbPoints.length - 1].index,
          start: climbStart,
          end: climbPoints[climbPoints.length - 1],
          distance: climbDistance,
          elevationGain: climbElevation,
          avgGrade: (climbElevation / climbDistance) * 100,
          maxGrade: Math.max(...grades),
          points: climbPoints
        })
      }
      
      inClimb = false
      climbStart = null
      climbPoints = []
    }
  }
  
  // Handle climb that goes to the end
  if (inClimb && climbPoints.length > 0) {
    const lastPoint = climbPoints[climbPoints.length - 1]
    const climbDistance = lastPoint.distance - climbStart.distance
    const climbElevation = (lastPoint.elevation || 0) - (climbStart.elevation || 0)
    
    if (climbDistance >= MIN_CLIMB_DISTANCE && climbElevation > 0) {
      const grades = climbPoints.slice(1).map(p => p.grade)
      climbs.push({
        startIndex: climbStart.index,
        endIndex: lastPoint.index,
        start: climbStart,
        end: lastPoint,
        distance: climbDistance,
        elevationGain: climbElevation,
        avgGrade: (climbElevation / climbDistance) * 100,
        maxGrade: Math.max(...grades),
        points: climbPoints
      })
    }
  }
  
  return climbs.map(climb => ({
    ...climb,
    category: categorizeClimb(climb)
  }))
}

/**
 * Categorizes a climb using cycling climb categories
 * Based on a combination of elevation gain and average gradient
 * @param {Object} climb - Climb object with distance, elevationGain, and avgGrade
 * @returns {String} Climb category (HC, 1, 2, 3, 4, or 'Uncategorized')
 */
export function categorizeClimb(climb) {
  const { elevationGain, avgGrade } = climb
  
  // Calculate "difficulty points" - combination of elevation and gradient
  const difficultyScore = elevationGain * avgGrade / 100
  
  // HC (Hors Catégorie) - Beyond categorization
  if (elevationGain > 1500 && avgGrade > 7) return 'HC'
  if (difficultyScore > 80000) return 'HC'
  
  // Category 1 - Very difficult
  if (elevationGain > 1200 && avgGrade > 6) return '1'
  if (difficultyScore > 50000) return '1'
  
  // Category 2 - Difficult
  if (elevationGain > 800 && avgGrade > 5) return '2'
  if (difficultyScore > 30000) return '2'
  
  // Category 3 - Moderate
  if (elevationGain > 500 && avgGrade > 4) return '3'
  if (difficultyScore > 15000) return '3'
  
  // Category 4 - Easy climb
  if (elevationGain > 300 && avgGrade > 3) return '4'
  if (difficultyScore > 8000) return '4'
  
  return 'Uncategorized'
}

function getFallbackClimbLabel(climb) {
  if (!climb) return 'Easy climb'

  const elevationFeet = (climb.elevationGain || 0) * 3.28084
  const distanceMiles = (climb.distance || 0) / 1609.34
  const avgGrade = climb.avgGrade || 0

  if (elevationFeet >= 900 || (distanceMiles >= 0.8 && avgGrade >= 6)) {
    return 'Major climb'
  }

  if (elevationFeet >= 350 || avgGrade >= 7 || (distanceMiles >= 0.5 && avgGrade >= 5.5)) {
    return 'Hard climb'
  }

  if (elevationFeet >= 120 || avgGrade >= 5 || distanceMiles >= 0.3) {
    return distanceMiles < 0.25 ? 'Punchy climb' : 'Moderate climb'
  }

  return distanceMiles < 0.2 ? 'Rolling rise' : 'Easy climb'
}

/**
 * Gets color for climb category
 */
export function getClimbCategoryColor(category) {
  switch (category) {
    case 'HC': return '#FF0000' // Red
    case '1': return '#FF6B00' // Orange-red
    case '2': return '#FFA500' // Orange
    case '3': return '#FFD700' // Gold
    case '4': return '#90EE90' // Light green
    default: return '#D3D3D3' // Light gray
  }
}

/**
 * Gets label for climb category
 */
export function getClimbCategoryLabel(category, climb = null) {
  switch (category) {
    case 'HC': return 'Epic climb'
    case '1': return 'Major climb'
    case '2': return 'Hard climb'
    case '3': return 'Moderate climb'
    case '4': return 'Easy climb'
    default: return getFallbackClimbLabel(climb)
  }
}
