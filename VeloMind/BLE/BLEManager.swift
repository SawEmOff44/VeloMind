import CoreBluetooth
import Foundation
import os.log

/// Manages BLE connections to cycling sensors
@MainActor
class BLEManager: NSObject, ObservableObject {
    // MARK: - Published Properties
    @Published var isScanning = false
    @Published var discoveredDevices: [CBPeripheral] = []
    @Published var connectedDevices: Set<CBPeripheral> = []
    @Published var currentSpeed: Double = 0.0        // m/s
    @Published var currentCadence: Double = 0.0      // rpm
    @Published var currentHeartRate: Int = 0         // bpm
    @Published var connectionStatus: [BLESensorType: Bool] = [:]
    
    // MARK: - Private Properties
    private var centralManager: CBCentralManager!
    private let logger = Logger(subsystem: "com.velomind.app", category: "BLE")
    
    // Wheel parameters for speed calculation
    private let wheelCircumference: Double = 2.105  // meters (700x25c default)
    
    // CSC tracking
    private var lastWheelRevolutions: UInt32?
    private var lastWheelEventTime: UInt16?
    private var lastCrankRevolutions: UInt16?
    private var lastCrankEventTime: UInt16?
    
    // Service UUIDs
    private let cscServiceUUID = CBUUID(string: "1816")
    private let cscCharacteristicUUID = CBUUID(string: "2A5B")
    private let hrServiceUUID = CBUUID(string: "180D")
    private let hrCharacteristicUUID = CBUUID(string: "2A37")
    
    weak var delegate: SensorDataDelegate?
    
    // MARK: - Initialization
    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: .main)
    }
    
    // MARK: - Public Methods
    func startScanning() {
        guard centralManager.state == .poweredOn else {
            logger.warning("Cannot start scanning - Bluetooth not powered on")
            return
        }
        
        isScanning = true
        discoveredDevices.removeAll()
        
        let services = [cscServiceUUID, hrServiceUUID]
        centralManager.scanForPeripherals(withServices: services, options: [
            CBCentralManagerScanOptionAllowDuplicatesKey: false
        ])
        
        logger.info("Started scanning for BLE sensors")
    }
    
    func stopScanning() {
        isScanning = false
        centralManager.stopScan()
        logger.info("Stopped scanning for BLE sensors")
    }
    
    func connect(to peripheral: CBPeripheral) {
        peripheral.delegate = self
        centralManager.connect(peripheral, options: nil)
        logger.info("Attempting to connect to \(peripheral.name ?? "Unknown Device")")
    }
    
    func disconnect(from peripheral: CBPeripheral) {
        centralManager.cancelPeripheralConnection(peripheral)
        logger.info("Disconnecting from \(peripheral.name ?? "Unknown Device")")
    }
    
    func disconnectAll() {
        for peripheral in connectedDevices {
            disconnect(from: peripheral)
        }
    }
    
    // MARK: - Private Methods
    private func parseCSCData(_ data: Data) {
        guard data.count >= 11 else {
            logger.warning("CSC data too short: \(data.count) bytes")
            return
        }
        
        let flags = data[0]
        let hasWheelData = (flags & 0x01) != 0
        let hasCrankData = (flags & 0x02) != 0
        
        var index = 1
        
        // Parse wheel data (speed)
        if hasWheelData && data.count >= index + 6 {
            let wheelRevolutions = data.withUnsafeBytes { $0.load(fromByteOffset: index, as: UInt32.self) }
            let wheelEventTime = data.withUnsafeBytes { $0.load(fromByteOffset: index + 4, as: UInt16.self) }
            index += 6
            
            if let lastRev = lastWheelRevolutions, let lastTime = lastWheelEventTime {
                let revDiff = Int(wheelRevolutions) - Int(lastRev)
                var timeDiff = Int(wheelEventTime) - Int(lastTime)
                
                // Handle rollover
                if timeDiff < 0 {
                    timeDiff += 65536
                }
                
                if revDiff > 0 && timeDiff > 0 {
                    let timeSeconds = Double(timeDiff) / 1024.0
                    let distance = Double(revDiff) * wheelCircumference
                    let speed = distance / timeSeconds
                    
                    currentSpeed = speed
                    delegate?.didUpdateSpeed(speed, timestamp: Date())
                    logger.debug("Speed: \(speed * 2.23694, privacy: .public) mph")
                }
            }
            
            lastWheelRevolutions = wheelRevolutions
            lastWheelEventTime = wheelEventTime
        }
        
        // Parse crank data (cadence)
        if hasCrankData && data.count >= index + 4 {
            let crankRevolutions = data.withUnsafeBytes { $0.load(fromByteOffset: index, as: UInt16.self) }
            let crankEventTime = data.withUnsafeBytes { $0.load(fromByteOffset: index + 2, as: UInt16.self) }
            
            if let lastRev = lastCrankRevolutions, let lastTime = lastCrankEventTime {
                let revDiff = Int(crankRevolutions) - Int(lastRev)
                var timeDiff = Int(crankEventTime) - Int(lastTime)
                
                // Handle rollover
                if timeDiff < 0 {
                    timeDiff += 65536
                }
                
                if revDiff > 0 && timeDiff > 0 {
                    let timeMinutes = Double(timeDiff) / 1024.0 / 60.0
                    let cadence = Double(revDiff) / timeMinutes
                    
                    currentCadence = cadence
                    delegate?.didUpdateCadence(cadence, timestamp: Date())
                    logger.debug("Cadence: \(cadence, privacy: .public) rpm")
                }
            }
            
            lastCrankRevolutions = crankRevolutions
            lastCrankEventTime = crankEventTime
        }
    }
    
    private func parseHeartRateData(_ data: Data) {
        guard data.count >= 2 else { return }
        
        let flags = data[0]
        let hrFormat = (flags & 0x01) != 0  // 0 = uint8, 1 = uint16
        
        let heartRate: Int
        if hrFormat {
            heartRate = Int(data.withUnsafeBytes { $0.load(fromByteOffset: 1, as: UInt16.self) })
        } else {
            heartRate = Int(data[1])
        }
        
        currentHeartRate = heartRate
        delegate?.didUpdateHeartRate(heartRate, timestamp: Date())
        logger.debug("Heart Rate: \(heartRate) bpm")
    }
}

// MARK: - CBCentralManagerDelegate
extension BLEManager: CBCentralManagerDelegate {
    nonisolated func centralManagerDidUpdateState(_ central: CBCentralManager) {
        Task { @MainActor in
            switch central.state {
            case .poweredOn:
                logger.info("Bluetooth powered on")
            case .poweredOff:
                logger.warning("Bluetooth powered off")
            case .unsupported:
                logger.error("Bluetooth not supported")
            case .unauthorized:
                logger.error("Bluetooth unauthorized")
            case .resetting:
                logger.info("Bluetooth resetting")
            case .unknown:
                logger.info("Bluetooth state unknown")
            @unknown default:
                logger.warning("Unknown Bluetooth state")
            }
        }
    }
    
    nonisolated func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        Task { @MainActor in
            if !discoveredDevices.contains(where: { $0.identifier == peripheral.identifier }) {
                discoveredDevices.append(peripheral)
                logger.info("Discovered: \(peripheral.name ?? "Unknown") (\(peripheral.identifier))")
            }
        }
    }
    
    nonisolated func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        Task { @MainActor in
            connectedDevices.insert(peripheral)
            peripheral.discoverServices([cscServiceUUID, hrServiceUUID])
            logger.info("Connected to \(peripheral.name ?? "Unknown")")
        }
    }
    
    nonisolated func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        Task { @MainActor in
            connectedDevices.remove(peripheral)
            if let error = error {
                logger.error("Disconnected with error: \(error.localizedDescription)")
            } else {
                logger.info("Disconnected from \(peripheral.name ?? "Unknown")")
            }
            
            // Attempt reconnection for unexpected disconnects
            if error != nil {
                Task {
                    try? await Task.sleep(for: .seconds(2))
                    await connect(to: peripheral)
                }
            }
        }
    }
}

// MARK: - CBPeripheralDelegate
extension BLEManager: CBPeripheralDelegate {
    nonisolated func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        Task { @MainActor in
            if let error = error {
                logger.error("Error discovering services: \(error.localizedDescription)")
                return
            }
            
            peripheral.services?.forEach { service in
                logger.info("Discovered service: \(service.uuid)")
                peripheral.discoverCharacteristics([cscCharacteristicUUID, hrCharacteristicUUID], for: service)
            }
        }
    }
    
    nonisolated func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        Task { @MainActor in
            if let error = error {
                logger.error("Error discovering characteristics: \(error.localizedDescription)")
                return
            }
            
            service.characteristics?.forEach { characteristic in
                logger.info("Discovered characteristic: \(characteristic.uuid)")
                
                if characteristic.properties.contains(.notify) {
                    peripheral.setNotifyValue(true, for: characteristic)
                    logger.info("Subscribed to notifications for \(characteristic.uuid)")
                }
            }
        }
    }
    
    nonisolated func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        Task { @MainActor in
            if let error = error {
                logger.error("Error updating value: \(error.localizedDescription)")
                return
            }
            
            guard let data = characteristic.value else { return }
            
            switch characteristic.uuid {
            case cscCharacteristicUUID:
                parseCSCData(data)
                connectionStatus[.speedAndCadence] = true
                delegate?.didUpdateConnectionState(true, sensorType: .speedAndCadence)
            case hrCharacteristicUUID:
                parseHeartRateData(data)
                connectionStatus[.heartRate] = true
                delegate?.didUpdateConnectionState(true, sensorType: .heartRate)
            default:
                break
            }
        }
    }
}
