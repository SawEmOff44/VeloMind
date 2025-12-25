import SwiftUI

struct RideView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()
                
                VStack(spacing: 20) {
                    // Primary metrics
                    VStack(spacing: 10) {
                        // Power
                        MetricCard(
                            title: "POWER",
                            value: String(format: "%.0f", coordinator.powerEngine.smoothedPower10s),
                            unit: "W",
                            color: .orange,
                            size: .large
                        )
                        
                        HStack(spacing: 15) {
                            // Speed
                            MetricCard(
                                title: "SPEED",
                                value: String(format: "%.1f", coordinator.bleManager.currentSpeed * 3.6),
                                unit: "km/h",
                                color: .blue
                            )
                            
                            // Cadence
                            MetricCard(
                                title: "CADENCE",
                                value: String(format: "%.0f", coordinator.bleManager.currentCadence),
                                unit: "rpm",
                                color: .green
                            )
                        }
                    }
                    
                    // Secondary metrics
                    VStack(spacing: 10) {
                        HStack(spacing: 15) {
                            // Wind
                            SmallMetricCard(
                                title: "WIND",
                                value: String(format: "%.1f", abs(coordinator.weatherManager.currentWind?.speed ?? 0) * 3.6),
                                unit: "km/h"
                            )
                            
                            // Grade
                            SmallMetricCard(
                                title: "GRADE",
                                value: String(format: "%.1f", (coordinator.routeManager.currentMatchResult?.grade150m ?? 0) * 100),
                                unit: "%"
                            )
                        }
                        
                        HStack(spacing: 15) {
                            // Duration
                            SmallMetricCard(
                                title: "TIME",
                                value: formatDuration(coordinator.rideDuration),
                                unit: ""
                            )
                            
                            // Distance
                            SmallMetricCard(
                                title: "DISTANCE",
                                value: String(format: "%.1f", coordinator.rideDistance / 1000),
                                unit: "km"
                            )
                        }
                    }
                    
                    Spacer()
                    
                    // Ride controls
                    HStack(spacing: 20) {
                        if !coordinator.isRiding {
                            Button(action: {
                                coordinator.startRide()
                            }) {
                                Label("Start Ride", systemImage: "play.circle.fill")
                                    .font(.title2)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.green)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                        } else {
                            Button(action: {
                                coordinator.pauseRide()
                            }) {
                                Label("Pause", systemImage: "pause.circle.fill")
                                    .font(.title2)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.yellow)
                                    .foregroundColor(.black)
                                    .cornerRadius(12)
                            }
                            
                            Button(action: {
                                coordinator.stopRide()
                            }) {
                                Label("Stop", systemImage: "stop.circle.fill")
                                    .font(.title2)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.red)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding()
            }
            .navigationTitle("Ride")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    private func formatDuration(_ duration: TimeInterval) -> String {
        let hours = Int(duration) / 3600
        let minutes = (Int(duration) % 3600) / 60
        let seconds = Int(duration) % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%02d:%02d", minutes, seconds)
        }
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    let unit: String
    let color: Color
    var size: Size = .medium
    
    enum Size {
        case small, medium, large
    }
    
    var body: some View {
        VStack(spacing: 5) {
            Text(title)
                .font(size == .large ? .headline : .caption)
                .foregroundColor(.gray)
            
            HStack(alignment: .lastTextBaseline, spacing: 5) {
                Text(value)
                    .font(size == .large ? .system(size: 72, weight: .bold) : .system(size: 36, weight: .bold))
                    .foregroundColor(color)
                
                Text(unit)
                    .font(size == .large ? .title : .title3)
                    .foregroundColor(.gray)
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

struct SmallMetricCard: View {
    let title: String
    let value: String
    let unit: String
    
    var body: some View {
        VStack(spacing: 5) {
            Text(title)
                .font(.caption2)
                .foregroundColor(.gray)
            
            HStack(alignment: .lastTextBaseline, spacing: 3) {
                Text(value)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.white)
                
                if !unit.isEmpty {
                    Text(unit)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .padding(.horizontal, 8)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }
}

#Preview {
    RideView()
        .environmentObject(RideCoordinator())
}
