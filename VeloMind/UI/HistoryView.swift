import SwiftUI

struct HistoryView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @State private var showStravaAuth = false
    
    var body: some View {
        List {
                if coordinator.stravaManager.isAuthenticated {
                    Section("Strava Activities") {
                        ForEach(coordinator.stravaManager.recentActivities) { activity in
                            ActivityRow(activity: activity)
                        }
                    }
                    
                    if let metrics = coordinator.fitnessManager.currentMetrics {
                        Section("Fitness") {
                            FitnessMetricsView(metrics: metrics)
                        }
                    }
                } else {
                    ContentUnavailableView(
                        "Connect to Strava",
                        systemImage: "figure.outdoor.cycle",
                        description: Text("Sign in to view your training history and fitness metrics")
                    )
                    
                    Button("Connect Strava") {
                        showStravaAuth = true
                    }
                    .buttonStyle(.borderedProminent)
                }
        }
        .sheet(isPresented: $showStravaAuth) {
            StravaAuthView()
                .environmentObject(coordinator.stravaManager)
        }
        .refreshable {
            await coordinator.stravaManager.fetchRecentActivities()
        }
    }
}

struct ActivityRow: View {
    let activity: StravaActivity
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(activity.name)
                .font(.headline)
            
            HStack {
                Text("\(String(format: "%.1f", activity.distance / 1609.34)) mi")
                Text("•")
                Text(formatDuration(activity.movingTime))
                
                if let avgWatts = activity.averageWatts {
                    Text("•")
                    Text("\(Int(avgWatts)) W")
                }
            }
            .font(.subheadline)
            .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
    
    private func formatDuration(_ seconds: Int) -> String {
        let hours = seconds / 3600
        let minutes = (seconds % 3600) / 60
        
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes)m"
        }
    }
}

struct FitnessMetricsView: View {
    let metrics: FitnessMetrics
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                MetricLabel(title: "Fitness", value: String(format: "%.0f", metrics.fitness))
                Spacer()
                MetricLabel(title: "Fatigue", value: String(format: "%.0f", metrics.fatigue))
                Spacer()
                MetricLabel(title: "Form", value: metrics.formStatus)
            }
            
            HStack {
                Text("TSB: \(String(format: "%.1f", metrics.trainingStressBalance))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct MetricLabel: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.headline)
        }
    }
}

#Preview {
    HistoryView()
        .environmentObject(RideCoordinator())
}
