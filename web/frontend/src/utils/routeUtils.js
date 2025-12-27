// Route manipulation utilities

/**
 * Reverses a route (flips start and end)
 * @param {Object} route - Route object with points
 * @returns {Object} Reversed route
 */
export function reverseRoute(route) {
  if (!route || !route.points) return route
  
  const reversedPoints = [...route.points].reverse()
  
  // Recalculate distances from the new start
  const totalDistance = route.points[route.points.length - 1].distance
  const newPoints = reversedPoints.map((point, index) => {
    const originalDistance = point.distance
    const newDistance = totalDistance - originalDistance
    
    return {
      ...point,
      distance: newDistance,
      sequence: index
    }
  })
  
  return {
    ...route,
    points: newPoints,
    name: `${route.name} (Reversed)`
  }
}

/**
 * Calculates difficulty color based on grade
 * @param {Number} grade - Grade percentage
 * @returns {String} Color code
 */
export function getDifficultyColor(grade) {
  const absGrade = Math.abs(grade)
  
  if (absGrade >= 15) return '#8B0000' // Dark red - Extreme
  if (absGrade >= 12) return '#DC143C' // Crimson - Very hard
  if (absGrade >= 9) return '#FF4500' // Orange-red - Hard
  if (absGrade >= 6) return '#FFA500' // Orange - Moderate-hard
  if (absGrade >= 3) return '#FFD700' // Gold - Moderate
  if (absGrade >= 1) return '#90EE90' // Light green - Easy
  return '#87CEEB' // Sky blue - Flat
}

/**
 * Calculates segment difficulty rating (0-10)
 * @param {Number} grade - Grade percentage
 * @param {Number} distance - Segment distance in meters
 * @returns {Number} Difficulty score 0-10
 */
export function calculateSegmentDifficulty(grade, distance) {
  const absGrade = Math.abs(grade)
  const distanceKm = distance / 1000
  
  // Combine grade and distance for difficulty
  let score = 0
  
  // Grade contribution (0-5 points)
  if (absGrade >= 15) score += 5
  else if (absGrade >= 12) score += 4.5
  else if (absGrade >= 9) score += 4
  else if (absGrade >= 6) score += 3
  else if (absGrade >= 3) score += 2
  else if (absGrade >= 1) score += 1
  
  // Distance contribution (0-5 points)
  if (distanceKm >= 10) score += 5
  else if (distanceKm >= 5) score += 4
  else if (distanceKm >= 2) score += 3
  else if (distanceKm >= 1) score += 2
  else if (distanceKm >= 0.5) score += 1
  
  return Math.min(score, 10)
}

/**
 * Predicts speed based on grade, power, and rider parameters
 * @param {Number} grade - Grade percentage
 * @param {Number} power - Power in watts
 * @param {Number} mass - Total mass (rider + bike) in kg
 * @param {Number} cda - Coefficient of drag area
 * @returns {Number} Speed in m/s
 */
export function predictSpeed(grade, power, mass = 85, cda = 0.32) {
  const g = 9.81 // gravity
  const rho = 1.225 // air density
  const crr = 0.004 // rolling resistance
  const eta = 0.97 // drivetrain efficiency
  
  // This is a simplified calculation
  // In reality, speed calculation from power is complex and requires iteration
  
  // For steep climbs, use simplified climbing equation
  if (Math.abs(grade) > 3) {
    const gradeRad = Math.atan(grade / 100)
    const vClimb = (power * eta) / (mass * g * Math.sin(gradeRad))
    return Math.max(vClimb, 1) // Minimum 1 m/s
  }
  
  // For flats/slight grades, include aerodynamic drag
  // Simplified: assume speed around 8 m/s (18 mph) as baseline
  const baseSpeed = 8
  const aeroForce = 0.5 * rho * cda * baseSpeed * baseSpeed
  const rollForce = crr * mass * g
  const gradeForce = mass * g * (grade / 100)
  
  const totalForce = aeroForce + rollForce + gradeForce
  const speed = (power * eta) / totalForce
  
  return Math.max(speed, 1)
}

/**
 * Calculates time prediction for a route segment
 * @param {Number} distance - Distance in meters  
 * @param {Number} grade - Average grade percentage
 * @param {Number} power - Average power in watts
 * @param {Object} params - Rider parameters
 * @returns {Number} Time in seconds
 */
export function predictSegmentTime(distance, grade, power, params = {}) {
  const speed = predictSpeed(grade, power, params.mass, params.cda)
  return distance / speed
}
