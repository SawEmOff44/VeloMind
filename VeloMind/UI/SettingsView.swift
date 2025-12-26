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
    
    let positions = ["Hoods", "Drops"]
    
    var body: some View {
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
            
            // FTP & Fitness Section
            Section("Fitness Profile") {
                HStack {
                    Text("FTP (watts)")
                    Spacer()
                    TextField("FTP", text: $ftp)
                        .keyboardType(.numberPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)
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
                        .keyboardType(.numberPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)
                }
                
                HStack {
                    Text("Resting HR (bpm)")
                    Spacer()
                    TextField("Resting HR", text: $restingHR)
                        .keyboardType(.numberPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)
                }
                
                Button("Sync Strava Activities") {
                    Task {
                        await coordinator.fitnessProfileManager.importStravaActivities()
                    }
                }
                .buttonStyle(.bordered)
                
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
                    if coordinator.stravaManager.isAuthenticated {
                        HStack {
                            Text("Status")
                            Spacer()
                            Text("Connected")
                                .foregroundColor(.green)
                        }
                        
                        if let athlete = coordinator.stravaManager.athlete {
                            HStack {
                                Text("Athlete")
                                Spacer()
                                Text("\(athlete.firstname) \(athlete.lastname)")
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        Button("Disconnect") {
                            // TODO: Implement disconnect
                        }
                        .foregroundColor(.red)
                    } else {
                        Button("Connect to Strava") {
                            // TODO: Implement OAuth flow
                        }
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
    }
    
    private func loadParameters() {
        let params = coordinator.powerEngine.riderParameters
        mass = params.mass
        cda = params.cda
        crr = params.crr
    }
    
    private func applyParameters() {
        coordinator.powerEngine.riderParameters.mass = mass
        coordinator.powerEngine.riderParameters.cda = cda
        coordinator.powerEngine.riderParameters.crr = crr
        
        // TODO: Save to persistence
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
                 "Find a safe, flat road. Coast from 30 km/h to 20 km/h without pedaling.")
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
                                .foregroundColor(.blue)
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

#Preview {
    SettingsView()
        .environmentObject(RideCoordinator())
}
