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
    let persistenceManager = PersistenceManager()
    let navigationManager: RouteNavigationManager
    let backgroundTaskManager = BackgroundTaskManager()
    let watchConnectivityManager = WatchConnectivityManager.shared
    let apiService = APIService()
    
    // Intelligence & Fitness
    let intelligenceEngine: IntelligenceEngine
    let fitnessProfileManager: FitnessProfileManager
    let learningEngine: LearningEngine
    var authManager: AuthenticationManager?
    
    // Ride state
    @Published var isRiding = false
    @Published var rideStartTime: Date?
    @Published var rideDuration: TimeInterval = 0
    @Published var rideDistance: Double = 0
    @Published var isNavigating = false
    
    private var cancellables = Set<AnyCancellable>()
    private var updateTimer: Timer?
    private var powerStateObserver: NSObjectProtocol?
    private var lastUpdateTimestamp: Date?

    private var rideDataPoints: [RideDataPoint] = []
    private var totalElevationGain: Double = 0.0
    private var lastAltitude: Double?

    private var isRetryingBackendUploads = false
    private let minimumDistanceIntegrationSpeed: Double = 0.5 // m/s (~1.1 mph)
    
    init() {
        // Initialize intelligence components
        let riderParams = persistenceManager.loadRiderParameters() ?? RiderParameters.default
        
        // Load learned parameters
        _ = Task {
            await SegmentStore.shared.loadLearnedParameters() ?? LearnedParameters()
        }
        
        self.learningEngine = LearningEngine(
            riderParameters: riderParams,
            learnedParameters: LearnedParameters()  // Will be updated async
        )
        self.intelligenceEngine = IntelligenceEngine(riderParameters: riderParams)
        self.fitnessProfileManager = FitnessProfileManager(
            persistenceManager: persistenceManager,
            apiService: apiService
        )
        self.navigationManager = RouteNavigationManager(locationManager: locationManager)

        // Ensure all engines share the same rider profile instance at startup.
        self.fitnessProfileManager.currentProfile = riderParams
        self.powerEngine.riderParameters = riderParams
        self.intelligenceEngine.updateRiderParameters(riderParams)
        
        // Link learning engine to other components
        self.powerEngine.learningEngine = learningEngine
        self.intelligenceEngine.learningEngine = learningEngine
        
        setupDelegates()
        setupWatchNotifications()
        
        // Load learned parameters async
        Task {
            if let params = await SegmentStore.shared.loadLearnedParameters() {
                await MainActor.run {
                    self.learningEngine.learnedParameters = params
                }
            }
        }
    }

    func configurePersistenceUser(_ userId: String?) {
        persistenceManager.setCurrentUser(userId)
        let profile = persistenceManager.loadRiderParameters() ?? RiderParameters.default
        applyRiderProfile(profile, persist: false)
    }

    func applyRiderProfile(_ profile: RiderParameters, persist: Bool = true) {
        fitnessProfileManager.currentProfile = profile
        powerEngine.riderParameters = profile
        intelligenceEngine.updateRiderParameters(profile)
        if persist {
            fitnessProfileManager.saveProfile()
        }
    }
    
    private func setupDelegates() {
        bleManager.delegate = self
    }
    
    private func setupWatchNotifications() {
        // Listen for watch control requests
        NotificationCenter.default.addObserver(
            forName: .watchRequestedRideStart,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.startRide()
            }
        }
        
        NotificationCenter.default.addObserver(
            forName: .watchRequestedRideStop,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.stopRide()
            }
        }
    }
    
    // MARK: - Ride Control
    
    func startRide() {
        guard !isRiding else { return }

        isRiding = true
        rideStartTime = Date()
        rideDuration = 0
        rideDistance = 0
        rideDataPoints = []
        totalElevationGain = 0
        lastAltitude = nil
        lastUpdateTimestamp = nil

        // Trigger OS prompts if needed before location-dependent calculations begin.
        locationManager.requestPermission()
        
        // Configure background support
        backgroundTaskManager.configureAudioSession()
        backgroundTaskManager.activateAudioSession()
        
        // Start all services
        locationManager.startTracking()
        bleManager.startScanning()
        powerEngine.resetMetrics()
        
        // Start intelligence engine
        intelligenceEngine.startRide()
        
        // Start learning engine
        learningEngine.startRide()
        
        // Start update loop
        startUpdateLoop()
    }
    
    func startRideWithNavigation(route: Route) {
        RouteNavigationManager.requestNotificationPermissions()

        // Start normal ride
        startRide()
        
        // Start navigation
        navigationManager.startNavigation(route: route)
        isNavigating = true
    }
    
    func stopRide() {
        isRiding = false

        let endTime = Date()
        
        // Stop navigation if active
        if isNavigating {
            navigationManager.stopNavigation()
            isNavigating = false
        }
        
        // End learning session and save ride data
        learningEngine.endRide(
            totalDistance: rideDistance,
            avgPower: powerEngine.averagePower,
            normalizedPower: powerEngine.normalizedPower,
            avgSpeed: rideDistance / max(rideDuration, 1),
            maxPower: powerEngine.allPowerResults.map { $0.totalPower }.max() ?? 0
        )
        
        // Stop services
        stopUpdateLoop()
        locationManager.stopTracking()
        bleManager.stopScanning()
        lastUpdateTimestamp = nil
        
        // Deactivate background support
        backgroundTaskManager.deactivateAudioSession()

        // Persist + upload completed session
        if let startTime = rideStartTime {
            let avgSpeed = rideDistance / max(rideDuration, 1)
            let avgCadence: Double = {
                let values = rideDataPoints.map { $0.cadence }.filter { $0 > 0 }
                guard !values.isEmpty else { return 0 }
                return values.reduce(0, +) / Double(values.count)
            }()

            let hrValues = rideDataPoints.compactMap { $0.heartRate }.filter { $0 > 0 }
            let avgHeartRate: Int? = hrValues.isEmpty ? nil : Int(Double(hrValues.reduce(0, +)) / Double(hrValues.count))

            let backendRouteId = (routeManager.currentRoute?.id ?? 0) > 0 ? routeManager.currentRoute?.id : nil

            var session = RideSession(
                backendRouteId: backendRouteId,
                startTime: startTime,
                endTime: endTime,
                duration: rideDuration,
                distance: rideDistance,
                averagePower: powerEngine.averagePower,
                normalizedPower: powerEngine.normalizedPower,
                averageSpeed: avgSpeed,
                averageCadence: avgCadence,
                averageHeartRate: avgHeartRate,
                totalElevationGain: totalElevationGain,
                routeID: nil,
                dataPoints: rideDataPoints
            )

            persistenceManager.saveRideSession(session)

            Task {
                do {
                    let ftp = powerEngine.riderParameters.ftp
                    let backendId = try await apiService.uploadSession(session, routeId: backendRouteId, ftp: ftp)
                    session.backendSessionId = backendId
                    persistenceManager.updateRideSession(session)
                    print("✅ Uploaded session to backend: \(backendId)")
                } catch {
                    // Keep session locally; it can be retried later.
                    print("⚠️ Failed to upload session: \(error.localizedDescription)")
                }
            }
        }
    }

    // MARK: - Backend Sync

    /// Best-effort retry of any locally saved sessions that haven't been uploaded.
    /// Call this when the app becomes active and the user is authenticated.
    func retryPendingSessionUploads(maxSessions: Int = 3) {
        guard !isRetryingBackendUploads else { return }
        isRetryingBackendUploads = true

        Task {
            defer { self.isRetryingBackendUploads = false }

            let ftp = persistenceManager.loadRiderParameters()?.ftp

            let pending = persistenceManager
                .loadRideSessions()
                .filter { !$0.isUploadedToBackend }
                .sorted { $0.startTime < $1.startTime }

            guard !pending.isEmpty else { return }

            var uploaded = 0
            for var session in pending {
                if uploaded >= maxSessions { break }
                do {
                    let backendId = try await apiService.uploadSession(session, routeId: session.backendRouteId, ftp: ftp)
                    session.backendSessionId = backendId
                    persistenceManager.updateRideSession(session)
                    uploaded += 1
                    print("✅ Retried upload succeeded: \(backendId)")
                } catch {
                    print("⚠️ Retried upload failed: \(error.localizedDescription)")
                }
            }
        }
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
        stopUpdateLoop()

        // Adapt interval based on power mode
        let interval = backgroundTaskManager.recommendedUpdateInterval()
        updateTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.updateRideData()
            }
        }
        updateTimer?.tolerance = min(0.5, interval * 0.2)
        
        // Restart timer if power mode changes
        powerStateObserver = NotificationCenter.default.addObserver(
            forName: .NSProcessInfoPowerStateDidChange,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.stopUpdateLoop()
                self?.startUpdateLoop()
            }
        }
    }
    
    private func stopUpdateLoop() {
        updateTimer?.invalidate()
        updateTimer = nil

        if let powerStateObserver {
            NotificationCenter.default.removeObserver(powerStateObserver)
            self.powerStateObserver = nil
        }
    }
    
    private func updateRideData() async {
        guard isRiding else { return }

        let now = Date()
        bleManager.refreshSensorState(at: now)
        
        // Update duration
        if let startTime = rideStartTime {
            rideDuration = now.timeIntervalSince(startTime)
        }

        let deltaTime: TimeInterval
        if let lastUpdateTimestamp {
            deltaTime = min(max(now.timeIntervalSince(lastUpdateTimestamp), 0), 10)
        } else {
            deltaTime = backgroundTaskManager.recommendedUpdateInterval()
        }
        lastUpdateTimestamp = now
        
        let location = locationManager.currentLocation

        // Elevation gain (positive deltas)
        if let location {
            if let lastAlt = lastAltitude {
                let delta = location.altitude - lastAlt
                if delta > 0 {
                    totalElevationGain += delta
                }
            }
            lastAltitude = location.altitude
        }
        
        // Fetch weather if needed
        if let location {
            await weatherManager.fetchWeather(at: location)
        }
        
        var routeMatch: RouteMatchResult?
        var upcomingClimb: ClimbSegment?

        // Match to route if available and location exists
        if let location {
            routeMatch = routeManager.matchLocation(location)

            // Analyze upcoming climbs
            if let currentIndex = routeManager.getCurrentPositionIndex() {
                upcomingClimb = routeManager.analyzeUpcomingTerrain(currentIndex: currentIndex)
            }
        }
        
        // Get speed (prefer BLE sensor, fallback to GPS)
        let sensorSpeed = bleManager.currentSpeed
        let gpsSpeed = locationManager.currentSpeed
        let speed = sensorSpeed > 0 ? sensorSpeed : gpsSpeed
        let cadence = bleManager.currentCadence
        
        // Get grade from route or calculate from GPS
        let grade = routeMatch?.grade150m ?? 0.0
        
        // Calculate bearing for wind
        let bearing = (location?.course ?? -1) >= 0 ? (location?.course ?? 0) : 0
        let headwind = weatherManager.getHeadwind(bearing: bearing)
        let altitude = location?.altitude ?? locationManager.currentAltitude
        
        // Calculate power
        let powerResult = powerEngine.calculatePower(
            speed: speed,
            grade: grade,
            headwind: headwind,
            altitude: altitude
        )
        
        // Update intelligence engine with all current data
        intelligenceEngine.update(
            currentPower: powerResult.totalPower,
            currentSpeed: speed,
            currentCadence: cadence,
            heartRate: Double(bleManager.currentHeartRate),
            grade: grade,
            windSpeed: headwind,
            temperature: weatherManager.currentTemperature,
            humidity: weatherManager.currentHumidity,
            rideDuration: rideDuration,
            rideDistance: rideDistance,
            routeAhead: routeManager.currentRoute
        )
        
        // Update learning engine with ride data
        learningEngine.updateRide(
            power: powerResult.totalPower,
            speed: speed,
            grade: grade,
            windSpeed: headwind,
            temperature: weatherManager.currentTemperature ?? 20.0,
            humidity: weatherManager.currentHumidity ?? 50.0,
            heartRate: bleManager.currentHeartRate > 0 ? Double(bleManager.currentHeartRate) : nil
        )
        
        // Update climb preview if available
        if let climb = upcomingClimb, let ftp = intelligenceEngine.riderParameters.ftp {
            let distanceMiles = climb.distance * 0.000621371
            let gradePercent = climb.averageGrade * 100
            
            // Estimate recommended power (1.0-1.1x FTP for moderate climbs)
            let powerMultiplier = 1.0 + (gradePercent / 100.0) // Rough estimate
            let recommendedPower = ftp * powerMultiplier
            
            intelligenceEngine.upcomingClimb = ClimbPreview(
                distance: distanceMiles,
                grade: gradePercent,
                recommendedPower: (recommendedPower - 10)...(recommendedPower + 10)
            )
        } else {
            intelligenceEngine.upcomingClimb = nil
        }
        
        // Update distance
        if speed >= minimumDistanceIntegrationSpeed {
            rideDistance += speed * deltaTime
        }

        // Record datapoint for persistence/backend
        if let location {
            let windSpeed = weatherManager.currentWind?.speed ?? 0.0
            let windDirection = weatherManager.currentWind?.direction ?? 0.0
            let dp = RideDataPoint(
                timestamp: Date(),
                latitude: location.coordinate.latitude,
                longitude: location.coordinate.longitude,
                distance: rideDistance,
                altitude: location.altitude,
                speed: speed,
                cadence: cadence,
                heartRate: bleManager.currentHeartRate > 0 ? bleManager.currentHeartRate : nil,
                power: powerResult.totalPower,
                grade: grade,
                windSpeed: windSpeed,
                windDirection: windDirection
            )
            rideDataPoints.append(dp)
        }
        
        // Sync data to Apple Watch
        syncToWatch(speed: speed, powerResult: powerResult)
        
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
@MainActor
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

// MARK: - Apple Watch Sync

extension RideCoordinator {
    private func syncToWatch(speed: Double, powerResult: PowerResult) {
        watchConnectivityManager.sendRideData(
            power: powerResult.totalPower,
            speed: speed * 2.23694,  // Convert m/s to mph
            cadence: bleManager.currentCadence,
            heartRate: Double(bleManager.currentHeartRate),
            distance: rideDistance * 0.000621371,  // Convert m to miles
            duration: rideDuration,
            currentZone: intelligenceEngine.currentPowerZone.rawValue,
            targetZone: intelligenceEngine.targetPowerZone?.rawValue,
            routeAnalysis: intelligenceEngine.routeAheadAnalysis,
            isRiding: isRiding
        )
        
        // Update complication with key metrics
        if let routeAnalysis = intelligenceEngine.routeAheadAnalysis {
            watchConnectivityManager.updateComplication(
                power: powerResult.totalPower,
                zone: intelligenceEngine.currentPowerZone.rawValue,
                upcomingElevation: routeAnalysis.elevationGain * 3.28084
            )
        }
    }
}
