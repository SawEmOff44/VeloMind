import Foundation
import Combine

/// Coordinates all ride-related managers and state
@MainActor
class RideCoordinator: ObservableObject {
    // Managers
    let bleManager = BLEManager()
    let locationManager = LocationManager()
    let routeManager = RouteManager()
    let weatherManager = WeatherManager()
    let powerEngine = PowerEngine()
    let calibrationManager = CalibrationManager()
    let stravaManager = StravaManager()
    let fitnessManager = FitnessManager()
    
    // Ride state
    @Published var isRiding = false
    @Published var rideStartTime: Date?
    @Published var rideDuration: TimeInterval = 0
    @Published var rideDistance: Double = 0
    
    private var cancellables = Set<AnyCancellable>()
    private var updateTimer: Timer?
    
    init() {
        setupDelegates()
    }
    
    private func setupDelegates() {
        bleManager.delegate = self
    }
    
    // MARK: - Ride Control
    
    func startRide() {
        isRiding = true
        rideStartTime = Date()
        rideDuration = 0
        rideDistance = 0
        
        // Start all services
        locationManager.startTracking()
        bleManager.startScanning()
        powerEngine.resetMetrics()
        
        // Start update loop
        startUpdateLoop()
    }
    
    func stopRide() {
        isRiding = false
        
        // Stop services
        stopUpdateLoop()
        locationManager.stopTracking()
        bleManager.stopScanning()
    }
    
    func pauseRide() {
        isRiding = false
        stopUpdateLoop()
    }
    
    func resumeRide() {
        isRiding = true
        startUpdateLoop()
    }
    
    // MARK: - Update Loop
    
    private func startUpdateLoop() {
        updateTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.updateRideData()
            }
        }
    }
    
    private func stopUpdateLoop() {
        updateTimer?.invalidate()
        updateTimer = nil
    }
    
    private func updateRideData() async {
        guard isRiding else { return }
        
        // Update duration
        if let startTime = rideStartTime {
            rideDuration = Date().timeIntervalSince(startTime)
        }
        
        // Get current location
        guard let location = locationManager.currentLocation else { return }
        
        // Fetch weather if needed
        await weatherManager.fetchWeather(at: location)
        
        // Match to route if available
        let routeMatch = routeManager.matchLocation(location)
        
        // Get speed (prefer BLE sensor, fallback to GPS)
        let speed = bleManager.currentSpeed > 0 ? bleManager.currentSpeed : locationManager.currentSpeed
        
        // Get grade from route or calculate from GPS
        let grade = routeMatch?.grade150m ?? 0.0
        
        // Calculate bearing for wind
        let bearing = location.course >= 0 ? location.course : 0
        let headwind = weatherManager.getHeadwind(bearing: bearing)
        
        // Calculate power
        let powerResult = powerEngine.calculatePower(
            speed: speed,
            grade: grade,
            headwind: headwind,
            altitude: location.altitude
        )
        
        // Update distance
        // This is simplified - should track actual distance traveled
        rideDistance += speed * 1.0  // 1 second interval
        
        // Record calibration data if active
        if calibrationManager.isCalibrating {
            calibrationManager.recordData(
                speed: speed,
                grade: grade,
                wind: headwind,
                power: powerResult.totalPower
            )
        }
    }
}

// MARK: - SensorDataDelegate
extension RideCoordinator: SensorDataDelegate {
    func didUpdateSpeed(_ speed: Double, timestamp: Date) {
        // Speed already published by BLEManager
    }
    
    func didUpdateCadence(_ cadence: Double, timestamp: Date) {
        // Cadence already published by BLEManager
    }
    
    func didUpdateHeartRate(_ heartRate: Int, timestamp: Date) {
        // Heart rate already published by BLEManager
    }
    
    func didUpdateConnectionState(_ isConnected: Bool, sensorType: BLESensorType) {
        // Connection state already published by BLEManager
    }
}
