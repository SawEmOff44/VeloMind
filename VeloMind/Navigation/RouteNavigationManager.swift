import Foundation
import CoreLocation
import Combine

/// Manages route navigation and waypoint proximity alerts
@MainActor
class RouteNavigationManager: NSObject, ObservableObject {
    
    // Published properties
    @Published var isNavigating = false
    @Published var currentRoute: Route?
    @Published var currentLocation: CLLocation?
    @Published var distanceToNextWaypoint: Double?
    @Published var nextWaypoint: RouteWaypoint?
    @Published var routeProgress: Double = 0.0  // 0.0 to 1.0
    @Published var distanceRemaining: Double = 0.0  // meters
    @Published var upcomingWaypoints: [RouteWaypoint] = []
    
    // Private properties
    private var locationManager: LocationManager
    private var cancellables = Set<AnyCancellable>()
    private var alertedWaypoints = Set<Int>()
    
    // Constants
    private let WAYPOINT_ALERT_DISTANCE: Double = 304.8  // 1000 feet in meters
    private let ROUTE_PROXIMITY_THRESHOLD: Double = 50.0  // 50 meters off route = lost
    
    init(locationManager: LocationManager) {
        self.locationManager = locationManager
        super.init()
        setupLocationObserver()
    }
    
    private func setupLocationObserver() {
        locationManager.$currentLocation
            .compactMap { $0 }
            .sink { [weak self] location in
                self?.updateNavigation(with: location)
            }
            .store(in: &cancellables)
    }
    
    /// Start navigating a route
    func startNavigation(route: Route) {
        currentRoute = route
        isNavigating = true
        alertedWaypoints.removeAll()
        upcomingWaypoints = route.waypoints
        
        // Start location updates
        locationManager.startLocationUpdates()
        
        print("📍 Navigation started for route: \(route.name)")
        print("📍 Total waypoints: \(route.waypoints.count)")
    }
    
    /// Stop navigation
    func stopNavigation() {
        isNavigating = false
        currentRoute = nil
        nextWaypoint = nil
        distanceToNextWaypoint = nil
        routeProgress = 0.0
        distanceRemaining = 0.0
        upcomingWaypoints = []
        alertedWaypoints.removeAll()
        
        print("📍 Navigation stopped")
    }
    
    /// Update navigation state with current location
    private func updateNavigation(with location: CLLocation) {
        guard let route = currentRoute, isNavigating else { return }
        
        currentLocation = location
        
        // Find nearest point on route
        let nearestPoint = findNearestPoint(to: location, in: route.points)
        
        // Update route progress
        if let nearestPoint = nearestPoint {
            routeProgress = nearestPoint.distance / route.totalDistance
            distanceRemaining = route.totalDistance - nearestPoint.distance
        }
        
        // Check waypoint proximity
        checkWaypointProximity(location: location, route: route)
        
        // Update upcoming waypoints (next 3)
        updateUpcomingWaypoints(location: location, route: route)
    }
    
    /// Find nearest point on route to current location
    private func findNearestPoint(to location: CLLocation, in points: [RoutePoint]) -> RoutePoint? {
        var nearestPoint: RoutePoint?
        var minDistance = Double.infinity
        
        for point in points {
            let pointLocation = CLLocation(latitude: point.latitude, longitude: point.longitude)
            let distance = location.distance(from: pointLocation)
            
            if distance < minDistance {
                minDistance = distance
                nearestPoint = point
            }
        }
        
        return nearestPoint
    }
    
    /// Check proximity to waypoints and trigger alerts
    private func checkWaypointProximity(location: CLLocation, route: Route) {
        for waypoint in route.waypoints {
            // Skip if already alerted
            guard !alertedWaypoints.contains(waypoint.id) else { continue }
            
            let waypointLocation = CLLocation(
                latitude: waypoint.latitude,
                longitude: waypoint.longitude
            )
            
            let distance = location.distance(from: waypointLocation)
            
            // Use custom alert distance or default
            let alertDistance = Double(waypoint.alertDistance) * 0.3048  // feet to meters
            
            if distance <= alertDistance {
                triggerWaypointAlert(waypoint: waypoint, distance: distance)
                alertedWaypoints.insert(waypoint.id)
            }
        }
    }
    
    /// Trigger waypoint alert
    private func triggerWaypointAlert(waypoint: RouteWaypoint, distance: Double) {
        let distanceFeet = Int(distance / 0.3048)
        let label = waypoint.label ?? "Waypoint"
        
        print("🚨 WAYPOINT ALERT: \(label) in \(distanceFeet) feet")
        
        // Send to Apple Watch
        WatchConnectivityManager.shared.sendWaypointAlert(waypoint: waypoint, distanceFeet: Double(distanceFeet))
        
        // Create notification content
        let content = UNMutableNotificationContent()
        content.title = "\(waypoint.type.icon) \(label)"
        content.body = waypoint.notes ?? "Approaching waypoint in \(distanceFeet) feet"
        content.sound = .default
        content.categoryIdentifier = "WAYPOINT_ALERT"
        
        // Trigger immediately
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.1, repeats: false)
        let request = UNNotificationRequest(
            identifier: "waypoint_\(waypoint.id)",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ Failed to schedule notification: \(error)")
            }
        }
        
        // Also trigger haptic feedback
        triggerHapticFeedback(for: waypoint.type)
        
        // Speak alert if available
        speakAlert(text: "\(label). \(waypoint.notes ?? "")")
    }
    
    /// Update list of upcoming waypoints
    private func updateUpcomingWaypoints(location: CLLocation, route: Route) {
        // Find nearest point on route
        guard let nearestPoint = findNearestPoint(to: location, in: route.points) else { return }
        
        // Filter waypoints that are ahead on route
        let ahead = route.waypoints.filter { waypoint in
            if let waypointDist = waypoint.distanceFromStart {
                return waypointDist > nearestPoint.distance
            }
            return false
        }
        
        // Take next 3, sorted by distance
        upcomingWaypoints = Array(ahead.prefix(3))
        
        // Update next waypoint
        if let first = upcomingWaypoints.first {
            nextWaypoint = first
            if let waypointDist = first.distanceFromStart {
                distanceToNextWaypoint = waypointDist - nearestPoint.distance
            }
        } else {
            nextWaypoint = nil
            distanceToNextWaypoint = nil
        }
    }
    
    /// Trigger haptic feedback based on waypoint type
    private func triggerHapticFeedback(for type: WaypointType) {
        let generator = UINotificationFeedbackGenerator()
        
        switch type {
        case .danger, .steep:
            generator.notificationOccurred(.warning)
        case .alert, .turn:
            generator.notificationOccurred(.warning)
        default:
            generator.notificationOccurred(.success)
        }
    }
    
    /// Speak alert using AVSpeechSynthesizer
    private func speakAlert(text: String) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = 0.5
        
        let synthesizer = AVSpeechSynthesizer()
        synthesizer.speak(utterance)
    }
    
    /// Get distance in human-readable format
    func formatDistance(_ meters: Double) -> String {
        let feet = meters * 3.28084
        let miles = meters / 1609.34
        
        if miles >= 1.0 {
            return String(format: "%.1f mi", miles)
        } else {
            return String(format: "%.0f ft", feet)
        }
    }
    
    /// Request notification permissions
    static func requestNotificationPermissions() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                print("✅ Notification permissions granted")
            } else if let error = error {
                print("❌ Notification permission error: \(error)")
            }
        }
    }
}

// MARK: - Route Download Extension
extension RouteNavigationManager {
    
    /// Download route from backend with waypoints
    func downloadRoute(id: Int, token: String) async throws -> Route {
        let url = URL(string: "https://your-api-url.com/api/gpx/\(id)/download")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let route = try JSONDecoder().decode(Route.self, from: data)
        
        // Save to local storage
        saveRouteLocally(route)
        
        return route
    }
    
    /// Save route locally for offline access
    private func saveRouteLocally(_ route: Route) {
        let encoder = JSONEncoder()
        if let data = try? encoder.encode(route) {
            let filename = "route_\(route.id).json"
            let url = getDocumentsDirectory().appendingPathComponent(filename)
            try? data.write(to: url)
            print("💾 Route saved locally: \(filename)")
        }
    }
    
    /// Load route from local storage
    func loadLocalRoute(id: Int) -> Route? {
        let filename = "route_\(id).json"
        let url = getDocumentsDirectory().appendingPathComponent(filename)
        
        guard let data = try? Data(contentsOf: url) else { return nil }
        let decoder = JSONDecoder()
        return try? decoder.decode(Route.self, from: data)
    }
    
    /// Get documents directory
    private func getDocumentsDirectory() -> URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
}

// Required imports for speech and haptics
import AVFoundation
import UIKit
import UserNotifications
