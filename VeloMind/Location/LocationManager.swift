import CoreLocation
import os.log

/// Manages GPS location tracking
@MainActor
class LocationManager: NSObject, ObservableObject {
    @Published var currentLocation: CLLocation?
    @Published var currentSpeed: Double = 0.0  // m/s from GPS
    @Published var currentAltitude: Double = 0.0
    @Published var isAuthorized = false
    @Published var accuracy: CLLocationAccuracy = 0
    
    private let locationManager = CLLocationManager()
    private let logger = Logger(subsystem: "com.velomind.app", category: "Location")
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.activityType = .fitness
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        locationManager.showsBackgroundLocationIndicator = true
    }
    
    func requestPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startTracking() {
        locationManager.startUpdatingLocation()
        logger.info("Started GPS tracking")
    }
    
    func stopTracking() {
        locationManager.stopUpdatingLocation()
        logger.info("Stopped GPS tracking")
    }
}

// MARK: - CLLocationManagerDelegate
extension LocationManager: CLLocationManagerDelegate {
    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        Task { @MainActor in
            guard let location = locations.last else { return }
            
            currentLocation = location
            currentSpeed = max(0, location.speed)  // GPS speed
            currentAltitude = location.altitude
            accuracy = location.horizontalAccuracy
            
            logger.debug("Location: \(location.coordinate.latitude), \(location.coordinate.longitude), accuracy: \(location.horizontalAccuracy)m")
        }
    }
    
    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            switch manager.authorizationStatus {
            case .authorizedAlways, .authorizedWhenInUse:
                isAuthorized = true
                logger.info("Location authorized")
            case .denied, .restricted:
                isAuthorized = false
                logger.warning("Location denied or restricted")
            case .notDetermined:
                logger.info("Location authorization not determined")
            @unknown default:
                logger.warning("Unknown authorization status")
            }
        }
    }
    
    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            logger.error("Location error: \(error.localizedDescription)")
        }
    }
}
