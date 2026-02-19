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
    private var pendingStartTracking = false
    private let minimumReliableMovingSpeed: Double = 0.5 // m/s (~1.1 mph)

    var authorizationStatus: CLAuthorizationStatus {
        locationManager.authorizationStatus
    }
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.activityType = .fitness
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        locationManager.showsBackgroundLocationIndicator = true
        isAuthorized = authorizationStatus == .authorizedAlways || authorizationStatus == .authorizedWhenInUse
    }
    
    func requestPermission() {
        if authorizationStatus == .notDetermined {
            locationManager.requestWhenInUseAuthorization()
        }
    }
    
    func startTracking() {
        switch authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            pendingStartTracking = false
            locationManager.startUpdatingLocation()
            logger.info("Started GPS tracking")
        case .notDetermined:
            pendingStartTracking = true
            locationManager.requestWhenInUseAuthorization()
            logger.info("Requested location authorization before tracking")
        case .denied, .restricted:
            pendingStartTracking = false
            logger.warning("Location tracking unavailable due to denied/restricted authorization")
        @unknown default:
            pendingStartTracking = false
            logger.warning("Unknown location authorization status")
        }
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
            let rawSpeed = max(0, location.speed)
            if rawSpeed < minimumReliableMovingSpeed {
                currentSpeed = 0
            } else {
                currentSpeed = rawSpeed
            }
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
                if pendingStartTracking {
                    pendingStartTracking = false
                    locationManager.startUpdatingLocation()
                    logger.info("Started GPS tracking after authorization")
                }
            case .denied, .restricted:
                isAuthorized = false
                pendingStartTracking = false
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
