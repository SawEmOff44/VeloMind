import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var mass: Double = 85
    @State private var cda: Double = 0.32
    @State private var crr: Double = 0.0045
    @State private var selectedPosition = "Hoods"
    @State private var ftp: String = ""
    @State private var maxHR: String = ""
    @State private var restingHR: String = ""
    @State private var showFTPAlert = false
    @State private var backendStravaConnected: Bool? = nil
    
    let positions = ["Hoods", "Drops"]
    
    var body: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)
            
            Form {
            Section("Account") {
                if let user = authManager.currentUser {
                    HStack {
                        Text("Name")
                        Spacer()
                        Text(user.name)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Email")
                        Spacer()
                        Text(user.email)
                            .foregroundColor(.secondary)
                    }
                }
                
                Button(role: .destructive, action: {
                    authManager.logout()
                }) {
                    Text("Sign Out")
                        .frame(maxWidth: .infinity)
                }
            }
            
            // Learning Mode Section
            Section {
                LearningModeView(learningEngine: coordinator.learningEngine)
            } header: {
                HStack {
                    Image(systemName: "brain.head.profile")
                    Text("Learning Mode")
                }
            } footer: {
                Text("VeloMind learns your unique riding characteristics to provide more accurate predictions over time.")
                    .font(.caption)
            }
            
            // Routes Section
            Section {
                RoutesSyncView(coordinator: coordinator)
            } header: {
                HStack {
                    Image(systemName: "map")
                    Text("Routes & Navigation")
                }
            } footer: {
                Text("Sync routes from web app for turn-by-turn navigation during rides.")
                    .font(.caption)
            }
            
            // FTP & Fitness Section
            Section("Fitness Profile") {
                HStack {
                    Text("FTP (watts)")
                    Spacer()
                    TextField("FTP", text: $ftp)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)
                        .onChange(of: ftp) { _, newValue in
                            if let ftpValue = Double(newValue), ftpValue > 0 {
                                coordinator.powerEngine.riderParameters.ftp = ftpValue
                                coordinator.powerEngine.riderParameters.ftpLastUpdated = Date()
                                coordinator.fitnessProfileManager.saveProfile()
                            }
                        }
                }
                
                // Show estimated FTP if available
                if let estimatedFTP = coordinator.fitnessProfileManager.currentProfile.estimatedFTP {
                    HStack {
                        Text("Estimated FTP")
                        Spacer()
                        Text("\(Int(estimatedFTP))W")
                            .foregroundColor(.secondary)
                    }
                }
                
                // FTP Update Suggestion
                if coordinator.fitnessProfileManager.ftpNeedsUpdate,
                   let suggestion = coordinator.fitnessProfileManager.ftpUpdateSuggestion {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Image(systemName: "info.circle.fill")
                                .foregroundColor(.orange)
                            Text("FTP Update Suggested")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                        }
                        Text(suggestion)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 8)
                }
                
                HStack {
                    Text("Max Heart Rate (bpm)")
                    Spacer()
                    TextField("Max HR", text: $maxHR)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)
                        .onChange(of: maxHR) { _, newValue in
                            if let maxHRValue = Int(newValue), maxHRValue > 0 {
                                coordinator.powerEngine.riderParameters.maxHeartRate = maxHRValue
                                coordinator.fitnessProfileManager.saveProfile()
                            }
                        }
                }
                
                HStack {
                    Text("Resting HR (bpm)")
                    Spacer()
                    TextField("Resting HR", text: $restingHR)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)                        .onChange(of: restingHR) { _, newValue in
                            if let restingHRValue = Int(newValue), restingHRValue > 0 {
                                coordinator.powerEngine.riderParameters.restingHeartRate = restingHRValue
                                coordinator.fitnessProfileManager.saveProfile()
                            }
                        }                }
            }
            
            // Strava Integration Section
            Section("Strava Integration") {
                let isConnected = (backendStravaConnected == true)

                if isConnected {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Connected to Strava")
                            .foregroundColor(.secondary)
                        Spacer()
                    }
                    
                    Button("Sync Activities") {
                        Task {
                            try? await coordinator.apiService.syncStrava()
                            await coordinator.fitnessProfileManager.importStravaActivities()
                        }
                    }
                    .buttonStyle(.bordered)
                    
                    Button("Disconnect", role: .destructive) {
                        // TODO: Implement disconnect
                    }
                } else {
                    Text("Connect Strava in the web app, then return here.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Button("Sync Strava Activities") {
                    Task {
                        try? await coordinator.apiService.syncStrava()
                        await coordinator.fitnessProfileManager.importStravaActivities()
                    }
                }
                .buttonStyle(.bordered)
                .disabled(!(backendStravaConnected == true))
                
                Button("Update Fitness Profile") {
                    applyFitnessProfile()
                }
                .buttonStyle(.borderedProminent)
            }
            
            Section("Rider Parameters") {
                HStack {
                    Text("Total Mass (lbs)")
                    Spacer()
                    TextField("Mass", value: $mass, format: .number)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)
                }
                
                HStack {
                    Text("CdA (m²)")
                    Spacer()
                    TextField("CdA", value: $cda, format: .number)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)
                }
                
                HStack {
                    Text("Crr")
                    Spacer()
                    TextField("Crr", value: $crr, format: .number)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)
                }
                    
                    Picker("Position", selection: $selectedPosition) {
                        ForEach(positions, id: \.self) { position in
                            Text(position)
                        }
                    }
                    
                    Button("Apply Changes") {
                        applyParameters()
                    }
                    .buttonStyle(.borderedProminent)
                }
                
                // Intelligence & Alerts Section
                Section {
                    Group {
                        // Alert Toggles
                        Toggle("Steep Climb Alerts", isOn: Binding(
                            get: { coordinator.intelligenceEngine.alertPreferences.steepClimbAlertsEnabled },
                            set: { coordinator.intelligenceEngine.alertPreferences.steepClimbAlertsEnabled = $0 }
                        ))
                        
                        Toggle("Power Change Alerts", isOn: Binding(
                            get: { coordinator.intelligenceEngine.alertPreferences.powerChangeAlertsEnabled },
                            set: { coordinator.intelligenceEngine.alertPreferences.powerChangeAlertsEnabled = $0 }
                        ))
                        
                        Toggle("Audio Alerts", isOn: Binding(
                            get: { coordinator.intelligenceEngine.alertPreferences.audioEnabled },
                            set: { coordinator.intelligenceEngine.alertPreferences.audioEnabled = $0 }
                        ))
                        
                        Toggle("Haptic Feedback", isOn: Binding(
                            get: { coordinator.intelligenceEngine.alertPreferences.hapticEnabled },
                            set: { coordinator.intelligenceEngine.alertPreferences.hapticEnabled = $0 }
                        ))
                    }
                    
                    // Alert Thresholds
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Steep Grade Threshold: \(Int(coordinator.intelligenceEngine.alertPreferences.steepGradeThreshold))%")
                            .font(.subheadline)
                        Slider(
                            value: Binding(
                                get: { coordinator.intelligenceEngine.alertPreferences.steepGradeThreshold },
                                set: { coordinator.intelligenceEngine.alertPreferences.steepGradeThreshold = $0 }
                            ),
                            in: 5...15,
                            step: 1
                        )
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Power Change Threshold: \(Int(coordinator.intelligenceEngine.alertPreferences.powerChangeThresholdPercent))%")
                            .font(.subheadline)
                        Slider(
                            value: Binding(
                                get: { coordinator.intelligenceEngine.alertPreferences.powerChangeThresholdPercent },
                                set: { coordinator.intelligenceEngine.alertPreferences.powerChangeThresholdPercent = $0 }
                            ),
                            in: 10...40,
                            step: 5
                        )
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Alert Cooldown: \(Int(coordinator.intelligenceEngine.alertPreferences.alertCooldownSeconds))s")
                            .font(.subheadline)
                        Slider(
                            value: Binding(
                                get: { coordinator.intelligenceEngine.alertPreferences.alertCooldownSeconds },
                                set: { coordinator.intelligenceEngine.alertPreferences.alertCooldownSeconds = $0 }
                            ),
                            in: 60...300,
                            step: 30
                        )
                    }
                } header: {
                    HStack {
                        Image(systemName: "bell.badge")
                        Text("Intelligence & Alerts")
                    }
                } footer: {
                    Text("Customize when and how VeloMind alerts you about upcoming terrain and power changes.")
                        .font(.caption)
                }
                
                Section("Calibration") {
                    NavigationLink("Steady-State Calibration") {
                        CalibrationView(mode: .steadyState)
                    }
                    
                    NavigationLink("Coast-Down Test") {
                        CalibrationView(mode: .coastDown)
                    }
                }
                
                Section("Sensors") {
                    NavigationLink("Bluetooth Devices") {
                        SensorSettingsView()
                    }
                }
                
                Section("Strava") {
                    let isConnected = (backendStravaConnected == true)

                    if isConnected {
                        HStack {
                            Text("Status")
                            Spacer()
                            Text("Connected")
                                .foregroundColor(.green)
                        }
                        
                        Button("Disconnect") {
                            // TODO: Implement disconnect
                        }
                        .foregroundColor(.red)
                    } else {
                        Text("Connect Strava in the web app.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .onAppear {
                loadParameters()
            }
            .task {
                backendStravaConnected = try? await coordinator.apiService.fetchStravaStatus()
            }
            .scrollContentBackground(.hidden)
        }
    }
    
    private func loadParameters() {
        let params = coordinator.powerEngine.riderParameters
        mass = params.mass
        cda = params.cda
        crr = params.crr
        
        // Load FTP
        if let ftpValue = params.ftp {
            ftp = String(format: "%.0f", ftpValue)
        }
        
        // Load heart rate values
        if let maxHRValue = params.maxHeartRate {
            maxHR = String(maxHRValue)
        }
        if let restingHRValue = params.restingHeartRate {
            restingHR = String(restingHRValue)
        }
    }
    
    private func applyParameters() {
        coordinator.powerEngine.riderParameters.mass = mass
        coordinator.powerEngine.riderParameters.cda = cda
        coordinator.powerEngine.riderParameters.crr = crr
        
        // Save FTP if provided
        if let ftpValue = Double(ftp), ftpValue > 0 {
            coordinator.powerEngine.riderParameters.ftp = ftpValue
            coordinator.powerEngine.riderParameters.ftpLastUpdated = Date()
        }
        
        // Save heart rate values if provided
        if let maxHRValue = Int(maxHR), maxHRValue > 0 {
            coordinator.powerEngine.riderParameters.maxHeartRate = maxHRValue
        }
        if let restingHRValue = Int(restingHR), restingHRValue > 0 {
            coordinator.powerEngine.riderParameters.restingHeartRate = restingHRValue
        }
        
        // Save to persistence
        coordinator.fitnessProfileManager.currentProfile.mass = mass
        coordinator.fitnessProfileManager.currentProfile.cda = cda
        coordinator.fitnessProfileManager.currentProfile.crr = crr
        coordinator.fitnessProfileManager.currentProfile.drivetrainLoss = coordinator.powerEngine.riderParameters.drivetrainLoss
        coordinator.fitnessProfileManager.currentProfile.ftp = coordinator.powerEngine.riderParameters.ftp
        coordinator.fitnessProfileManager.saveProfile()

        // Sync to backend (best-effort)
        Task {
            do {
                let position = selectedPosition.lowercased()
                try await coordinator.apiService.syncActiveRiderParameters(profile: coordinator.fitnessProfileManager.currentProfile, position: position)
            } catch {
                print("⚠️ Failed to sync rider parameters: \(error.localizedDescription)")
            }
        }
    }
    
    private func applyFitnessProfile() {
        var profile = coordinator.fitnessProfileManager.currentProfile
        
        if let ftpValue = Double(ftp), ftpValue > 0 {
            coordinator.fitnessProfileManager.updateFTP(ftpValue)
        }
        
        if let maxHRValue = Int(maxHR), maxHRValue > 0 {
            profile.maxHeartRate = maxHRValue
        }
        
        if let restingHRValue = Int(restingHR), restingHRValue > 0 {
            profile.restingHeartRate = restingHRValue
        }
        
        // Update intelligence engine with new parameters
        coordinator.intelligenceEngine.updateRiderParameters(profile)

        coordinator.fitnessProfileManager.currentProfile = profile
        coordinator.fitnessProfileManager.saveProfile()

        Task {
            do {
                let position = selectedPosition.lowercased()
                try await coordinator.apiService.syncActiveRiderParameters(profile: coordinator.fitnessProfileManager.currentProfile, position: position)
            } catch {
                print("⚠️ Failed to sync fitness profile: \(error.localizedDescription)")
            }
        }
        
        // Show confirmation
        showFTPAlert = true
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(RideCoordinator())
            .environmentObject(AuthenticationManager())
    }
}

struct CalibrationView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    let mode: CalibrationMode
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        VStack(spacing: 20) {
            Text(mode == .steadyState ? "Steady-State Calibration" : "Coast-Down Test")
                .font(.title2)
                .padding()
            
            Text(mode == .steadyState ?
                 "Ride at a steady effort for 10-15 minutes on flat or consistent grade terrain." :
                 "Find a safe, flat road. Coast from 20 mph to 13 mph without pedaling.")
                .multilineTextAlignment(.center)
                .padding()
            
            if coordinator.calibrationManager.isCalibrating {
                ProgressView(value: coordinator.calibrationManager.calibrationProgress)
                    .padding()
                
                Text("Progress: \(Int(coordinator.calibrationManager.calibrationProgress * 100))%")
                    .font(.headline)
                
                Button("Stop Calibration") {
                    coordinator.calibrationManager.stopCalibration(powerEngine: coordinator.powerEngine)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
            } else {
                Button("Start Calibration") {
                    coordinator.calibrationManager.startCalibration(mode: mode)
                }
                .buttonStyle(.borderedProminent)
            }
            
            Spacer()
        }
        .padding()
        .navigationTitle("Calibration")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct SensorSettingsView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    
    var body: some View {
        List {
            Section("Connected Sensors") {
                ForEach(Array(coordinator.bleManager.connectedDevices), id: \.identifier) { device in
                    HStack {
                        Image(systemName: "sensor.fill")
                            .foregroundColor(.green)
                        Text(device.name ?? "Unknown Device")
                        Spacer()
                        Button("Disconnect") {
                            coordinator.bleManager.disconnect(from: device)
                        }
                        .font(.caption)
                        .foregroundColor(.red)
                    }
                }
            }
            
            Section("Available Devices") {
                if coordinator.bleManager.isScanning {
                    HStack {
                        ProgressView()
                        Text("Scanning...")
                            .foregroundColor(.secondary)
                    }
                }
                
                ForEach(coordinator.bleManager.discoveredDevices, id: \.identifier) { device in
                    Button(action: {
                        coordinator.bleManager.connect(to: device)
                    }) {
                        HStack {
                            Image(systemName: "sensor")
                            Text(device.name ?? "Unknown Device")
                            Spacer()
                            Image(systemName: "plus.circle")
                                .foregroundColor(.veloTeal)
                        }
                    }
                }
            }
        }
        .navigationTitle("Sensors")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(coordinator.bleManager.isScanning ? "Stop Scan" : "Scan") {
                    if coordinator.bleManager.isScanning {
                        coordinator.bleManager.stopScanning()
                    } else {
                        coordinator.bleManager.startScanning()
                    }
                }
            }
        }
    }
}

// MARK: - Routes Sync View

struct RoutesSyncView: View {
    @ObservedObject var coordinator: RideCoordinator
    @State private var syncing = false
    @State private var syncError: String?
    @State private var lastSyncDate: Date?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let route = coordinator.routeManager.currentRoute {
                HStack {
                    Image(systemName: "map.fill")
                        .foregroundColor(.green)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Current Route")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(route.name)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                    }
                    Spacer()
                    Text("\(route.totalDistance / 1609.34, specifier: "%.1f") mi")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            } else {
                HStack {
                    Image(systemName: "map")
                        .foregroundColor(.gray)
                    Text("No route loaded")
                        .foregroundColor(.secondary)
                }
            }
            
            Button {
                syncRoutes()
            } label: {
                HStack {
                    Image(systemName: syncing ? "arrow.triangle.2.circlepath" : "arrow.down.circle.fill")
                    Text(syncing ? "Syncing..." : "Sync Routes from Web")
                }
            }
            .disabled(syncing)
            .buttonStyle(.bordered)
            
            if let error = syncError {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
            }
            
            if let lastSync = lastSyncDate {
                Text("Last synced: \(formatDate(lastSync))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private func syncRoutes() {
        syncing = true
        syncError = nil
        
        Task {
            do {
                // Get auth token from authentication manager if available
                if let token = coordinator.authManager?.currentToken {
                    await RouteSyncService.shared.setAuthToken(token)
                }
                
                try await RouteSyncService.shared.syncRoutes(to: coordinator.routeManager)
                
                await MainActor.run {
                    lastSyncDate = Date()
                    syncing = false
                }
            } catch {
                await MainActor.run {
                    syncError = error.localizedDescription
                    syncing = false
                }
            }
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Learning Mode View

struct LearningModeView: View {
    @ObservedObject var learningEngine: LearningEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Overall Progress
            HStack {
                Text("Overall Learning Progress")
                    .font(.subheadline)
                    .fontWeight(.medium)
                Spacer()
                Text("\(Int(learningEngine.learnedParameters.overallProgress))%")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(.cyan)
            }
            
            ProgressView(value: learningEngine.learnedParameters.overallProgress, total: 100)
                .tint(.cyan)
            
            Divider()
            
            // CdA Learning
            LearningMetricRow(
                icon: "wind",
                title: "Aerodynamics (CdA)",
                learnedValue: learningEngine.learnedParameters.learnedCdA.map { String(format: "%.3f m²", $0) },
                defaultValue: "Default: 0.320 m²",
                status: learningEngine.learnedParameters.cdaLearningStatus,
                rideCount: learningEngine.learnedParameters.cdaRideCount,
                confidence: learningEngine.learnedParameters.cdaConfidence
            )
            
            // Fatigue Learning
            LearningMetricRow(
                icon: "bolt.fill",
                title: "Fatigue Rate",
                learnedValue: learningEngine.learnedParameters.learnedFatigueRate.map { 
                    let comparison = $0 > 0.15 ? "faster than average" : "slower than average"
                    return "\(Int(abs($0 - 0.15) / 0.15 * 100))% \(comparison)"
                },
                defaultValue: "Using standard model",
                status: learningEngine.learnedParameters.fatigueLearningStatus,
                rideCount: learningEngine.learnedParameters.fatigueRideCount,
                confidence: learningEngine.learnedParameters.fatigueConfidence
            )
            
            // Heat Sensitivity Learning
            LearningMetricRow(
                icon: "thermometer.sun.fill",
                title: "Heat Sensitivity",
                learnedValue: learningEngine.learnedParameters.learnedHeatCoefficient.map { 
                    String(format: "+%.1f%% per °F (above 65°F)", $0)
                },
                defaultValue: "Default: +0.2% per °F",
                status: learningEngine.learnedParameters.heatLearningStatus,
                rideCount: learningEngine.learnedParameters.heatRideCount,
                confidence: learningEngine.learnedParameters.heatConfidence
            )
            
            // FTP Estimation
            if let estimatedFTP = learningEngine.learnedParameters.estimatedFTP {
                Divider()
                HStack {
                    Image(systemName: "figure.outdoor.cycle")
                        .foregroundColor(.orange)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Estimated FTP")
                            .font(.subheadline)
                        Text("\(Int(estimatedFTP))W")
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.orange)
                    }
                    Spacer()
                    Text("\(learningEngine.learnedParameters.ftpSampleCount) samples")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            // Last Updated
            if learningEngine.learnedParameters.cdaRideCount > 0 {
                Divider()
                HStack {
                    Image(systemName: "clock")
                        .foregroundColor(.gray)
                    Text("Last updated: \(formatDate(learningEngine.learnedParameters.lastUpdated))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 8)
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

struct LearningMetricRow: View {
    let icon: String
    let title: String
    let learnedValue: String?
    let defaultValue: String
    let status: LearnedParameters.LearningStatus
    let rideCount: Int
    let confidence: Double
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(statusColor)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                if let learned = learnedValue {
                    Text(learned)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(statusColor)
                } else {
                    Text(defaultValue)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                HStack(spacing: 4) {
                    ForEach(0..<5) { index in
                        Image(systemName: index < status.stars ? "star.fill" : "star")
                            .font(.caption2)
                            .foregroundColor(index < status.stars ? .yellow : .gray)
                    }
                    
                    Text("• \(rideCount) rides")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
        }
    }
    
    private var statusColor: Color {
        switch status {
        case .collecting: return .gray
        case .lowConfidence: return .orange
        case .mediumConfidence: return .yellow
        case .highConfidence: return .green
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(RideCoordinator())
}
