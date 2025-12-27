import WatchConnectivity
import Foundation
import os.log

/// Manages communication between iPhone and Apple Watch
@MainActor
class WatchConnectivityManager: NSObject, ObservableObject {
    static let shared = WatchConnectivityManager()
    
    @Published var isWatchReachable = false
    @Published var isWatchAppInstalled = false
    
    private let session: WCSession?
    private let logger = Logger(subsystem: "com.velomind.app", category: "WatchConnectivity")
    
    // Data to sync with watch
    struct WatchData: Codable {
        let power: Double
        let speed: Double  // mph
        let cadence: Double
        let heartRate: Double
        let distance: Double  // miles
        let duration: TimeInterval
        let currentZone: String
        let targetZone: String?
        let routeAhead: RouteAheadData?
        let isRiding: Bool
    }
    
    struct RouteAheadData: Codable {
        let distanceMiles: Double
        let elevationFeet: Double
        let avgGrade: Double
        let difficulty: String
        let requiredPowerMin: Double
        let requiredPowerMax: Double
        let estimatedMinutes: Int
    }
    
    override private init() {
        if WCSession.isSupported() {
            session = WCSession.default
        } else {
            session = nil
        }
        super.init()
        
        session?.delegate = self
        session?.activate()
    }
    
    // MARK: - Data Sync
    
    /// Send ride data to Apple Watch
    func sendRideData(
        power: Double,
        speed: Double,
        cadence: Double,
        heartRate: Double,
        distance: Double,
        duration: TimeInterval,
        currentZone: String,
        targetZone: String?,
        routeAnalysis: RouteAheadAnalysis?,
        isRiding: Bool
    ) {
        guard let session = session, session.isReachable else {
            logger.debug("Watch not reachable")
            return
        }
        
        // Convert route analysis to watch format
        var routeData: RouteAheadData?
        if let analysis = routeAnalysis {
            routeData = RouteAheadData(
                distanceMiles: analysis.distanceAhead / 1609.34,
                elevationFeet: analysis.elevationGain * 3.28084,
                avgGrade: analysis.avgGrade,
                difficulty: analysis.difficulty.rawValue,
                requiredPowerMin: analysis.requiredPower.lowerBound,
                requiredPowerMax: analysis.requiredPower.upperBound,
                estimatedMinutes: Int(analysis.estimatedTime / 60)
            )
        }
        
        let watchData = WatchData(
            power: power,
            speed: speed,
            cadence: cadence,
            heartRate: heartRate,
            distance: distance,
            duration: duration,
            currentZone: currentZone,
            targetZone: targetZone,
            routeAhead: routeData,
            isRiding: isRiding
        )
        
        do {
            let data = try JSONEncoder().encode(watchData)
            let message = ["rideData": data]
            
            session.sendMessage(message, replyHandler: nil) { error in
                Task { @MainActor in
                    self.logger.error("Failed to send watch data: \(error.localizedDescription)")
                }
            }
            
            logger.debug("Sent ride data to watch")
        } catch {
            logger.error("Failed to encode watch data: \(error.localizedDescription)")
        }
    }
    
    /// Update watch complication with key metrics
    func updateComplication(power: Double, zone: String, upcomingElevation: Double) {
        guard let session = session else { return }
        
        let complicationData: [String: Any] = [
            "power": power,
            "zone": zone,
            "elevation": upcomingElevation
        ]
        
        if session.isComplicationEnabled {
            session.transferCurrentComplicationUserInfo(complicationData)
            logger.debug("Updated watch complication")
        }
    }
    
    /// Send route waypoint alert to watch
    func sendWaypointAlert(waypoint: RouteWaypoint, distanceFeet: Double) {
        guard let session = session, session.isReachable else { return }
        
        let alert: [String: Any] = [
            "type": "waypoint",
            "label": waypoint.label ?? "",
            "waypointType": waypoint.type.rawValue,
            "distance": distanceFeet,
            "notes": waypoint.notes ?? ""
        ]
        
        session.sendMessage(alert, replyHandler: nil)
        logger.info("Sent waypoint alert to watch: \(waypoint.label ?? "unknown")")
    }
    
    /// Send audio alert text to watch (for haptic feedback)
    func sendAudioAlertToWatch(message: String) {
        guard let session = session, session.isReachable else { return }
        
        let alert = ["type": "audioAlert", "message": message]
        session.sendMessage(alert, replyHandler: nil)
        logger.debug("Sent audio alert to watch")
    }
    
    // MARK: - Ride Control from Watch
    
    /// Handle ride start request from watch
    private func handleStartRide() {
        logger.info("Watch requested ride start")
        NotificationCenter.default.post(name: .watchRequestedRideStart, object: nil)
    }
    
    /// Handle ride stop request from watch
    private func handleStopRide() {
        logger.info("Watch requested ride stop")
        NotificationCenter.default.post(name: .watchRequestedRideStop, object: nil)
    }
}

// MARK: - WCSessionDelegate

extension WatchConnectivityManager: WCSessionDelegate {
    nonisolated func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        Task { @MainActor in
            if let error = error {
                logger.error("Watch session activation failed: \(error.localizedDescription)")
            } else {
                logger.info("Watch session activated: \(activationState.rawValue)")
            }
        }
    }
    
    nonisolated func sessionDidBecomeInactive(_ session: WCSession) {
        Task { @MainActor in
            logger.info("Watch session became inactive")
        }
    }
    
    nonisolated func sessionDidDeactivate(_ session: WCSession) {
        Task { @MainActor in
            logger.info("Watch session deactivated")
            session.activate()
        }
    }
    
    nonisolated func sessionReachabilityDidChange(_ session: WCSession) {
        Task { @MainActor in
            isWatchReachable = session.isReachable
            isWatchAppInstalled = session.isWatchAppInstalled
            logger.debug("Watch reachability: \(session.isReachable)")
        }
    }
    
    nonisolated func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        Task { @MainActor in
            if let command = message["command"] as? String {
                switch command {
                case "startRide":
                    handleStartRide()
                case "stopRide":
                    handleStopRide()
                default:
                    logger.warning("Unknown watch command: \(command)")
                }
            }
        }
    }
}

// MARK: - Notification Names

extension Notification.Name {
    static let watchRequestedRideStart = Notification.Name("watchRequestedRideStart")
    static let watchRequestedRideStop = Notification.Name("watchRequestedRideStop")
}
