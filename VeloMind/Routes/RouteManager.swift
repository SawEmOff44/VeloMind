import Foundation
import CoreLocation
import os.log

/// Manages route data and matching
@MainActor
class RouteManager: ObservableObject {
    @Published var currentRoute: Route?
    @Published var currentMatchResult: RouteMatchResult?
    @Published var isOnRoute = true
    @Published var distanceRemaining: Double = 0
    
    private let logger = Logger(subsystem: "com.velomind.app", category: "Route")
    private var processedPoints: [RoutePoint] = []
    
    // MARK: - Route Loading
    
    func loadRoute(from data: Data, name: String) async throws {
        let parser = GPXParser()
        let rawPoints = try parser.parse(data: data)
        
        // Process points: calculate distances and smooth elevation
        let processed = try await processRoutePoints(rawPoints)
        
        // Calculate total elevation gain
        let elevationGain = calculateElevationGain(processed)
        
        let route = Route(
            name: name,
            points: processed,
            totalDistance: processed.last?.distance ?? 0,
            totalElevationGain: elevationGain
        )
        
        currentRoute = route
        processedPoints = processed
        logger.info("Loaded route '\(name)' with \(processed.count) points, \(route.totalDistance / 1000, privacy: .public) km")
    }
    
    // MARK: - Route Matching
    
    func matchLocation(_ location: CLLocation) -> RouteMatchResult? {
        guard let route = currentRoute, !route.points.isEmpty else {
            return nil
        }
        
        let userCoord = location.coordinate
        var closestPoint: RoutePoint?
        var minDistance = Double.infinity
        var closestIndex = 0
        
        // Find nearest point on route
        for (index, point) in route.points.enumerated() {
            let distance = location.distance(from: CLLocation(
                latitude: point.latitude,
                longitude: point.longitude
            ))
            
            if distance < minDistance {
                minDistance = distance
                closestPoint = point
                closestIndex = index
            }
        }
        
        guard let nearest = closestPoint else {
            return nil
        }
        
        // Calculate grade values
        let grade30m = calculateGrade(at: closestIndex, window: 30)
        let grade150m = calculateGrade(at: closestIndex, window: 150)
        
        // Determine if on route (within 30-50m)
        let onRoute = minDistance <= 40.0
        
        let result = RouteMatchResult(
            nearestPoint: nearest,
            distanceAlongRoute: nearest.distance,
            distanceFromRoute: minDistance,
            grade30m: grade30m,
            grade150m: grade150m,
            isOnRoute: onRoute
        )
        
        currentMatchResult = result
        isOnRoute = onRoute
        distanceRemaining = (currentRoute?.totalDistance ?? 0) - nearest.distance
        
        return result
    }
    
    // MARK: - Private Methods
    
    private func processRoutePoints(_ points: [RoutePoint]) async throws -> [RoutePoint] {
        guard !points.isEmpty else { return [] }
        
        var processed: [RoutePoint] = []
        var cumulativeDistance = 0.0
        
        // First point
        var smoothedElevations = smoothElevation(points.compactMap { $0.elevation })
        
        for (index, point) in points.enumerated() {
            // Calculate distance from previous point
            if index > 0 {
                let prevPoint = points[index - 1]
                let loc1 = CLLocation(latitude: prevPoint.latitude, longitude: prevPoint.longitude)
                let loc2 = CLLocation(latitude: point.latitude, longitude: point.longitude)
                cumulativeDistance += loc1.distance(from: loc2)
            }
            
            let smoothedElevation = smoothedElevations.count > index ? smoothedElevations[index] : point.elevation
            
            let processedPoint = RoutePoint(
                latitude: point.latitude,
                longitude: point.longitude,
                elevation: smoothedElevation,
                distance: cumulativeDistance
            )
            
            processed.append(processedPoint)
        }
        
        return processed
    }
    
    private func smoothElevation(_ elevations: [Double]) -> [Double] {
        guard elevations.count > 2 else { return elevations }
        
        // Simple moving average with window of 5
        let windowSize = 5
        var smoothed: [Double] = []
        
        for i in 0..<elevations.count {
            let start = max(0, i - windowSize / 2)
            let end = min(elevations.count, i + windowSize / 2 + 1)
            let window = elevations[start..<end]
            let average = window.reduce(0, +) / Double(window.count)
            smoothed.append(average)
        }
        
        return smoothed
    }
    
    private func calculateGrade(at index: Int, window: Double) -> Double {
        guard let route = currentRoute, index >= 0, index < route.points.count else {
            return 0.0
        }
        
        let currentPoint = route.points[index]
        let currentDistance = currentPoint.distance
        
        // Find point approximately 'window' meters back
        var startIndex = index
        for i in stride(from: index, through: 0, by: -1) {
            if currentDistance - route.points[i].distance >= window {
                startIndex = i
                break
            }
        }
        
        guard startIndex != index,
              let startElevation = route.points[startIndex].elevation,
              let endElevation = currentPoint.elevation else {
            return 0.0
        }
        
        let elevationChange = endElevation - startElevation
        let distance = currentDistance - route.points[startIndex].distance
        
        guard distance > 0 else { return 0.0 }
        
        return elevationChange / distance
    }
    
    private func calculateElevationGain(_ points: [RoutePoint]) -> Double {
        var totalGain = 0.0
        
        for i in 1..<points.count {
            if let prevElevation = points[i - 1].elevation,
               let currentElevation = points[i].elevation {
                let gain = currentElevation - prevElevation
                if gain > 0 {
                    totalGain += gain
                }
            }
        }
        
        return totalGain
    }
    
    // MARK: - Climb Analysis
    
    /// Analyze upcoming terrain for climb preview
    func analyzeUpcomingTerrain(currentIndex: Int, lookAheadDistance: Double = 1600) -> ClimbSegment? {
        guard let route = currentRoute, currentIndex >= 0, currentIndex < route.points.count else {
            return nil
        }
        
        let currentDistance = route.points[currentIndex].distance
        let targetDistance = currentDistance + lookAheadDistance
        
        var climbSegments: [ClimbSegment] = []
        var inClimb = false
        var climbStart: RoutePoint?
        var climbStartIndex = currentIndex
        
        // Scan ahead for climbs (grade > 3%)
        for i in (currentIndex + 1)..<route.points.count {
            let point = route.points[i]
            
            if point.distance > targetDistance {
                break
            }
            
            let grade = calculateGrade(at: i, window: 100) // 100m rolling grade
            
            if grade > 0.03 && !inClimb {
                // Start of climb
                inClimb = true
                climbStart = point
                climbStartIndex = i
            } else if grade <= 0.02 && inClimb {
                // End of climb
                if let start = climbStart {
                    let distance = point.distance - start.distance
                    let elevationGain = (point.elevation ?? 0) - (start.elevation ?? 0)
                    let avgGrade = distance > 0 ? elevationGain / distance : 0
                    
                    // Only include significant climbs (>100m, >3% avg)
                    if distance > 100 && avgGrade > 0.03 {
                        climbSegments.append(ClimbSegment(
                            startDistance: start.distance,
                            endDistance: point.distance,
                            distance: distance,
                            elevationGain: elevationGain,
                            averageGrade: avgGrade,
                            maxGrade: calculateMaxGrade(from: climbStartIndex, to: i)
                        ))
                    }
                }
                inClimb = false
                climbStart = nil
            }
        }
        
        // Return the first significant climb
        return climbSegments.first
    }
    
    private func calculateMaxGrade(from startIndex: Int, to endIndex: Int) -> Double {
        guard let route = currentRoute else { return 0 }
        
        var maxGrade = 0.0
        for i in startIndex...min(endIndex, route.points.count - 1) {
            let grade = calculateGrade(at: i, window: 50) // 50m window for max
            maxGrade = max(maxGrade, grade)
        }
        return maxGrade
    }
    
    /// Get current position index in route
    func getCurrentPositionIndex() -> Int? {
        guard let matchResult = currentMatchResult,
              let route = currentRoute else {
            return nil
        }
        
        // Find index of current matched point
        for (index, point) in route.points.enumerated() {
            if point.latitude == matchResult.nearestPoint.latitude &&
               point.longitude == matchResult.nearestPoint.longitude {
                return index
            }
        }
        return nil
    }
}

/// Represents a climb segment on the route
struct ClimbSegment {
    let startDistance: Double    // meters
    let endDistance: Double       // meters
    let distance: Double          // meters
    let elevationGain: Double     // meters
    let averageGrade: Double      // decimal (0.05 = 5%)
    let maxGrade: Double          // decimal
}

