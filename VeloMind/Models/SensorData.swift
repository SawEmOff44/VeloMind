import Foundation

/// Represents sensor data from BLE devices
struct SensorData {
    let speed: Double?           // m/s
    let cadence: Double?         // rpm
    let heartRate: Int?          // bpm
    let timestamp: Date
    
    var speedMph: Double? {
        speed.map { $0 * 2.23694 }
    }
}

/// Protocol for sensor data updates
protocol SensorDataDelegate: AnyObject {
    func didUpdateSpeed(_ speed: Double, timestamp: Date)
    func didUpdateCadence(_ cadence: Double, timestamp: Date)
    func didUpdateHeartRate(_ heartRate: Int, timestamp: Date)
    func didUpdateConnectionState(_ isConnected: Bool, sensorType: BLESensorType)
}

/// Types of BLE sensors
enum BLESensorType: String, CaseIterable {
    case speedAndCadence = "Cycling Speed and Cadence"
    case heartRate = "Heart Rate"
    
    var serviceUUID: String {
        switch self {
        case .speedAndCadence: return "1816"
        case .heartRate: return "180D"
        }
    }
    
    var characteristicUUID: String {
        switch self {
        case .speedAndCadence: return "2A5B"
        case .heartRate: return "2A37"
        }
    }
}
