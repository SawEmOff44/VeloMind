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
    @Published var bluetoothState: CBManagerState = .unknown
    @Published var scanStatusMessage: String?
    
    // MARK: - Private Properties
    private var centralManager: CBCentralManager!
    private let logger = Logger(subsystem: "com.velomind.app", category: "BLE")
    private let preferredPeripheralIDsKey = "velomind.ble.preferredPeripheralIDs"

    private var pendingScanRequest = false
    private var activeScanID: UUID?
    private var preferredPeripheralIDs = Set<UUID>()
    private var peripheralSensorTypes: [UUID: Set<BLESensorType>] = [:]
    
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
        preferredPeripheralIDs = loadPreferredPeripheralIDs()
        centralManager = CBCentralManager(delegate: self, queue: .main)
    }
    
    // MARK: - Public Methods
    func startScanning() {
        guard centralManager.state == .poweredOn else {
            pendingScanRequest = true
            scanStatusMessage = scanBlockedMessage(for: centralManager.state)
            logger.warning("Scan requested but Bluetooth not ready (state=\(self.centralManager.state.rawValue, privacy: .public)). Will start when powered on.")
            return
        }
        
        isScanning = true
        pendingScanRequest = false
        scanStatusMessage = "Scanning for cadence/speed sensors..."
        discoveredDevices.removeAll()
        let scanID = UUID()
        activeScanID = scanID
        
        // Restart scanning so repeated taps always refresh discovery.
        centralManager.stopScan()

        preloadKnownPeripherals()

        // Use nil services so sensors that don't advertise service UUIDs are still discoverable.
        centralManager.scanForPeripherals(withServices: nil, options: [
            CBCentralManagerScanOptionAllowDuplicatesKey: true
        ])

        Task { [weak self] in
            try? await Task.sleep(for: .seconds(8))
            await MainActor.run {
                guard let self = self else { return }
                guard self.isScanning, self.activeScanID == scanID, self.discoveredDevices.isEmpty else { return }
                self.scanStatusMessage = "No sensors found yet. Spin wheel/crank and make sure sensor is not connected to another app/device."
            }
        }
        
        logger.info("Started scanning for BLE sensors")
    }
    
    func stopScanning() {
        isScanning = false
        pendingScanRequest = false
        activeScanID = nil
        scanStatusMessage = "Scan stopped"
        centralManager.stopScan()
        logger.info("Stopped scanning for BLE sensors")
    }
    
    func connect(to peripheral: CBPeripheral, remember: Bool = true) {
        if remember {
            rememberPeripheral(peripheral)
        }
        peripheral.delegate = self
        centralManager.connect(peripheral, options: nil)
        logger.info("Attempting to connect to \(peripheral.name ?? "Unknown Device")")
    }
    
    func disconnect(from peripheral: CBPeripheral, forget: Bool = true) {
        if forget {
            forgetPeripheral(peripheral)
        }
        centralManager.cancelPeripheralConnection(peripheral)
        logger.info("Disconnecting from \(peripheral.name ?? "Unknown Device")")
    }
    
    func disconnectAll(forget: Bool = false) {
        for peripheral in connectedDevices {
            disconnect(from: peripheral, forget: forget)
        }
    }
    
    // MARK: - Private Methods
    private func parseCSCData(_ data: Data) {
        // CSC Measurement (0x2A5B) is variable-length:
        // Flags (1 byte) + optional wheel data (6 bytes) + optional crank data (4 bytes)
        guard !data.isEmpty else {
            logger.warning("CSC data empty")
            return
        }
        
        let flags = data[0]
        let hasWheelData = (flags & 0x01) != 0
        let hasCrankData = (flags & 0x02) != 0
        
        var index = 1
        
        // Parse wheel data (speed)
        if hasWheelData && data.count >= index + 6 {
            let wheelRevolutions = readUInt32LE(data, offset: index)
            let wheelEventTime = readUInt16LE(data, offset: index + 4)
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
            let crankRevolutions = readUInt16LE(data, offset: index)
            let crankEventTime = readUInt16LE(data, offset: index + 2)
            
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

    private func readUInt16LE(_ data: Data, offset: Int) -> UInt16 {
        guard offset + 1 < data.count else { return 0 }
        return UInt16(data[offset]) | (UInt16(data[offset + 1]) << 8)
    }

    private func readUInt32LE(_ data: Data, offset: Int) -> UInt32 {
        guard offset + 3 < data.count else { return 0 }
        return UInt32(data[offset]) |
        (UInt32(data[offset + 1]) << 8) |
        (UInt32(data[offset + 2]) << 16) |
        (UInt32(data[offset + 3]) << 24)
    }

    private func loadPreferredPeripheralIDs() -> Set<UUID> {
        let ids = UserDefaults.standard.stringArray(forKey: preferredPeripheralIDsKey) ?? []
        return Set(ids.compactMap(UUID.init(uuidString:)))
    }

    private func persistPreferredPeripheralIDs() {
        UserDefaults.standard.set(preferredPeripheralIDs.map(\.uuidString), forKey: preferredPeripheralIDsKey)
    }

    private func rememberPeripheral(_ peripheral: CBPeripheral) {
        preferredPeripheralIDs.insert(peripheral.identifier)
        persistPreferredPeripheralIDs()
    }

    private func forgetPeripheral(_ peripheral: CBPeripheral) {
        preferredPeripheralIDs.remove(peripheral.identifier)
        persistPreferredPeripheralIDs()
    }
    
    private func preloadKnownPeripherals() {
        let connected = centralManager.retrieveConnectedPeripherals(withServices: [cscServiceUUID, hrServiceUUID])
        for peripheral in connected {
            upsertDiscovered(peripheral)
            handleConnectedPeripheral(peripheral)
        }

        if !preferredPeripheralIDs.isEmpty {
            let saved = centralManager.retrievePeripherals(withIdentifiers: Array(preferredPeripheralIDs))
            for peripheral in saved {
                upsertDiscovered(peripheral)
                if peripheral.state == .connected {
                    handleConnectedPeripheral(peripheral)
                }
            }
        }

        if !connected.isEmpty {
            scanStatusMessage = connected.count == 1 ? "Found 1 connected sensor" : "Found \(connected.count) connected sensors"
        }
    }

    private func upsertDiscovered(_ peripheral: CBPeripheral) {
        if let idx = discoveredDevices.firstIndex(where: { $0.identifier == peripheral.identifier }) {
            discoveredDevices[idx] = peripheral
        } else {
            discoveredDevices.append(peripheral)
        }
    }

    private func handleConnectedPeripheral(_ peripheral: CBPeripheral) {
        peripheral.delegate = self
        connectedDevices.insert(peripheral)
        peripheral.discoverServices([cscServiceUUID, hrServiceUUID])
    }

    private func scanBlockedMessage(for state: CBManagerState) -> String {
        switch state {
        case .poweredOff:
            return "Bluetooth is off. Turn Bluetooth on and scan again."
        case .unauthorized:
            return "Bluetooth permission denied for VeloMind. Allow Bluetooth in iOS Settings."
        case .unsupported:
#if targetEnvironment(simulator)
            return "Bluetooth LE scanning is unavailable in the iOS Simulator. Use a physical iPhone."
#else
            return "Bluetooth LE is not supported on this device."
#endif
        case .resetting, .unknown:
            return "Bluetooth is starting up. Try scanning again in a moment."
        case .poweredOn:
            return "Bluetooth ready"
        @unknown default:
            return "Bluetooth status unknown."
        }
    }

    private func isPotentialCyclingSensor(_ peripheral: CBPeripheral, advertisementData: [String: Any]) -> Bool {
        if preferredPeripheralIDs.contains(peripheral.identifier) {
            return true
        }

        if let serviceUUIDs = advertisementData[CBAdvertisementDataServiceUUIDsKey] as? [CBUUID],
           serviceUUIDs.contains(cscServiceUUID) || serviceUUIDs.contains(hrServiceUUID) {
            return true
        }

        let localName = (advertisementData[CBAdvertisementDataLocalNameKey] as? String) ?? peripheral.name ?? ""
        let lowered = localName.lowercased()
        let keywords = [
            "cadence", "speed", "heart", "hr", "tickr", "rpm", "wahoo",
            "garmin", "polar", "stages", "assioma", "magene", "coospo", "bk9", "sensor"
        ]
        if keywords.contains(where: { lowered.contains($0) }) {
            return true
        }

        // Fallback: include all peripherals. Some bike sensors advertise without local names/UUIDs.
        return true
    }
    
    private func parseHeartRateData(_ data: Data) {
        guard data.count >= 2 else { return }
        
        let flags = data[0]
        let hrFormat = (flags & 0x01) != 0  // 0 = uint8, 1 = uint16
        
        let heartRate: Int
        if hrFormat {
            guard data.count >= 3 else { return }
            heartRate = Int(readUInt16LE(data, offset: 1))
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
            bluetoothState = central.state
            switch central.state {
            case .poweredOn:
                logger.info("Bluetooth powered on")
                scanStatusMessage = "Bluetooth ready"
                if pendingScanRequest {
                    logger.info("Starting pending BLE scan request")
                    startScanning()
                }
            case .poweredOff:
                logger.warning("Bluetooth powered off")
                pendingScanRequest = false
                isScanning = false
                scanStatusMessage = scanBlockedMessage(for: .poweredOff)
            case .unsupported:
                logger.error("Bluetooth not supported")
                pendingScanRequest = false
                isScanning = false
                scanStatusMessage = scanBlockedMessage(for: .unsupported)
            case .unauthorized:
                logger.error("Bluetooth unauthorized")
                pendingScanRequest = false
                isScanning = false
                scanStatusMessage = scanBlockedMessage(for: .unauthorized)
            case .resetting:
                logger.info("Bluetooth resetting")
                scanStatusMessage = scanBlockedMessage(for: .resetting)
            case .unknown:
                logger.info("Bluetooth state unknown")
                scanStatusMessage = scanBlockedMessage(for: .unknown)
            @unknown default:
                logger.warning("Unknown Bluetooth state")
                scanStatusMessage = "Bluetooth status unknown."
            }
        }
    }
    
    nonisolated func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        Task { @MainActor in
            guard isPotentialCyclingSensor(peripheral, advertisementData: advertisementData) else { return }
            let isNewDevice = !discoveredDevices.contains(where: { $0.identifier == peripheral.identifier })
            upsertDiscovered(peripheral)
            if !isNewDevice { return }

            logger.info("Discovered: \(peripheral.name ?? "Unknown") (\(peripheral.identifier))")
            let count = discoveredDevices.count
            scanStatusMessage = count == 1 ? "Found 1 sensor" : "Found \(count) sensors"

            if preferredPeripheralIDs.contains(peripheral.identifier),
               !connectedDevices.contains(where: { $0.identifier == peripheral.identifier }) {
                logger.info("Auto-connecting preferred sensor: \(peripheral.name ?? "Unknown")")
                connect(to: peripheral, remember: false)
            }
        }
    }
    
    nonisolated func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        Task { @MainActor in
            handleConnectedPeripheral(peripheral)
            scanStatusMessage = "Connected to \(peripheral.name ?? "sensor")"
            logger.info("Connected to \(peripheral.name ?? "Unknown")")
        }
    }

    nonisolated func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        Task { @MainActor in
            let message = error?.localizedDescription ?? "Connection failed"
            scanStatusMessage = "Failed to connect to \(peripheral.name ?? "sensor"): \(message)"
            logger.error("Failed to connect to \(peripheral.name ?? "Unknown"): \(message, privacy: .public)")
        }
    }
    
    nonisolated func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        Task { @MainActor in
            connectedDevices.remove(peripheral)
            let disconnectedTypes = peripheralSensorTypes.removeValue(forKey: peripheral.identifier) ?? []
            for sensorType in disconnectedTypes {
                connectionStatus[sensorType] = false
                delegate?.didUpdateConnectionState(false, sensorType: sensorType)
            }

            if let error = error {
                logger.error("Disconnected with error: \(error.localizedDescription)")
            } else {
                logger.info("Disconnected from \(peripheral.name ?? "Unknown")")
            }
            
            // Attempt reconnection for unexpected disconnects
            if error != nil && preferredPeripheralIDs.contains(peripheral.identifier) {
                Task {
                    try? await Task.sleep(for: .seconds(2))
                    await MainActor.run { connect(to: peripheral, remember: false) }
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
                var sensorTypes = peripheralSensorTypes[peripheral.identifier, default: []]
                sensorTypes.insert(.speedAndCadence)
                peripheralSensorTypes[peripheral.identifier] = sensorTypes
                parseCSCData(data)
                connectionStatus[.speedAndCadence] = true
                delegate?.didUpdateConnectionState(true, sensorType: .speedAndCadence)
            case hrCharacteristicUUID:
                var sensorTypes = peripheralSensorTypes[peripheral.identifier, default: []]
                sensorTypes.insert(.heartRate)
                peripheralSensorTypes[peripheral.identifier] = sensorTypes
                parseHeartRateData(data)
                connectionStatus[.heartRate] = true
                delegate?.didUpdateConnectionState(true, sensorType: .heartRate)
            default:
                break
            }
        }
    }
}
