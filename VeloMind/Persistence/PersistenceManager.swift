import Foundation
import os.log

/// Manages local data persistence
@MainActor
class PersistenceManager: ObservableObject {
    private let logger = Logger(subsystem: "com.velomind.app", category: "Persistence")
    
    private var userId: String?
    
    private var rideSessions: String {
        "rideSessions_\(userId ?? "default")"
    }
    private var routes: String {
        "routes_\(userId ?? "default")"
    }
    private var calibrationSessions: String {
        "calibrationSessions_\(userId ?? "default")"
    }
    private var userPreferences: String {
        "userPreferences_\(userId ?? "default")"
    }
    
    func setCurrentUser(_ userId: String?) {
        self.userId = userId
    }
    
    // MARK: - Ride Sessions
    
    func saveRideSession(_ session: RideSession) {
        do {
            var sessions = loadRideSessions()
            sessions.append(session)
            
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(sessions)
            
            UserDefaults.standard.set(data, forKey: rideSessions)
            logger.info("Saved ride session: \(session.id)")
        } catch {
            logger.error("Failed to save ride session: \(error.localizedDescription)")
        }
    }
    
    func loadRideSessions() -> [RideSession] {
        guard let data = UserDefaults.standard.data(forKey: rideSessions) else {
            return []
        }
        
        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode([RideSession].self, from: data)
        } catch {
            logger.error("Failed to load ride sessions: \(error.localizedDescription)")
            return []
        }
    }
    
    func deleteRideSession(_ id: UUID) {
        var sessions = loadRideSessions()
        sessions.removeAll { $0.id == id }
        
        do {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(sessions)
            UserDefaults.standard.set(data, forKey: rideSessions)
            logger.info("Deleted ride session: \(id)")
        } catch {
            logger.error("Failed to delete ride session: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Routes
    
    func saveRoute(_ route: Route) {
        do {
            var savedRoutes = loadRoutes()
            savedRoutes.append(route)
            
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(savedRoutes)
            
            UserDefaults.standard.set(data, forKey: routes)
            logger.info("Saved route: \(route.name)")
        } catch {
            logger.error("Failed to save route: \(error.localizedDescription)")
        }
    }
    
    func loadRoutes() -> [Route] {
        guard let data = UserDefaults.standard.data(forKey: routes) else {
            return []
        }
        
        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode([Route].self, from: data)
        } catch {
            logger.error("Failed to load routes: \(error.localizedDescription)")
            return []
        }
    }
    
    func deleteRoute(_ id: UUID) {
        var savedRoutes = loadRoutes()
        savedRoutes.removeAll { $0.id == id }
        
        do {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(savedRoutes)
            UserDefaults.standard.set(data, forKey: routes)
            logger.info("Deleted route: \(id)")
        } catch {
            logger.error("Failed to delete route: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Calibration Sessions
    
    func saveCalibrationSession(_ session: CalibrationSession) {
        do {
            var sessions = loadCalibrationSessions()
            sessions.append(session)
            
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(sessions)
            
            UserDefaults.standard.set(data, forKey: calibrationSessions)
            logger.info("Saved calibration session")
        } catch {
            logger.error("Failed to save calibration session: \(error.localizedDescription)")
        }
    }
    
    func loadCalibrationSessions() -> [CalibrationSession] {
        guard let data = UserDefaults.standard.data(forKey: calibrationSessions) else {
            return []
        }
        
        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode([CalibrationSession].self, from: data)
        } catch {
            logger.error("Failed to load calibration sessions: \(error.localizedDescription)")
            return []
        }
    }
    
    // MARK: - User Preferences
    
    func saveRiderParameters(_ parameters: RiderParameters) {
        do {
            let encoder = JSONEncoder()
            let data = try encoder.encode(parameters)
            UserDefaults.standard.set(data, forKey: userPreferences)
            logger.info("Saved rider parameters")
        } catch {
            logger.error("Failed to save rider parameters: \(error.localizedDescription)")
        }
    }
    
    func loadRiderParameters() -> RiderParameters? {
        guard let data = UserDefaults.standard.data(forKey: userPreferences) else {
            return nil
        }
        
        do {
            let decoder = JSONDecoder()
            return try decoder.decode(RiderParameters.self, from: data)
        } catch {
            logger.error("Failed to load rider parameters: \(error.localizedDescription)")
            return nil
        }
    }
    
    // MARK: - Export to CSV
    
    func exportRideSessionToCSV(_ session: RideSession) -> String {
        var csv = "timestamp,latitude,longitude,altitude,speed,cadence,heartRate,power,grade,windSpeed,windDirection\n"
        
        for point in session.dataPoints {
            let row = [
                ISO8601DateFormatter().string(from: point.timestamp),
                String(point.latitude),
                String(point.longitude),
                String(point.altitude),
                String(point.speed),
                String(point.cadence),
                point.heartRate.map { String($0) } ?? "",
                String(point.power),
                String(point.grade),
                String(point.windSpeed),
                String(point.windDirection)
            ].joined(separator: ",")
            
            csv += row + "\n"
        }
        
        return csv
    }
    
    func saveCSVToFile(_ csv: String, filename: String) throws -> URL {
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let fileURL = documentsPath.appendingPathComponent("\(filename).csv")
        
        try csv.write(to: fileURL, atomically: true, encoding: .utf8)
        logger.info("Exported CSV to: \(fileURL.path)")
        
        return fileURL
    }
}
