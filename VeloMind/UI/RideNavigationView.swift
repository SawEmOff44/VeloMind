import SwiftUI
import MapKit

struct RideNavigationView: View {
    @StateObject private var navigationManager: RouteNavigationManager
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
        span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
    )
    
    let route: Route
    
    init(route: Route, locationManager: LocationManager) {
        self.route = route
        _navigationManager = StateObject(wrappedValue: RouteNavigationManager(locationManager: locationManager))
    }
    
    var body: some View {
        ZStack {
            // Map View
            Map(coordinateRegion: $region, showsUserLocation: true, annotationItems: navigationManager.upcomingWaypoints) { waypoint in
                MapAnnotation(coordinate: waypoint.coordinate) {
                    VStack {
                        Text(waypoint.type.icon)
                            .font(.title)
                            .padding(8)
                            .background(Circle().fill(Color.white))
                            .shadow(radius: 3)
                        Text(waypoint.label ?? "")
                            .font(.caption)
                            .padding(4)
                            .background(Color.white.opacity(0.9))
                            .cornerRadius(4)
                    }
                }
            }
            .edgesIgnoringSafeArea(.all)
            
            // Top Stats Bar
            VStack {
                HStack(spacing: 16) {
                    // Distance Remaining
                    StatCard(
                        title: "Remaining",
                        value: navigationManager.formatDistance(navigationManager.distanceRemaining),
                        color: .cyan
                    )
                    
                    // Progress
                    StatCard(
                        title: "Progress",
                        value: String(format: "%.0f%%", navigationManager.routeProgress * 100),
                        color: .green
                    )
                    
                    // Next Waypoint
                    if let distance = navigationManager.distanceToNextWaypoint {
                        StatCard(
                            title: "Next Alert",
                            value: navigationManager.formatDistance(distance),
                            color: .orange
                        )
                    }
                }
                .padding()
                .background(Color.black.opacity(0.7))
                
                Spacer()
            }
            
            // Bottom Waypoint Panel
            VStack {
                Spacer()
                
                if let nextWaypoint = navigationManager.nextWaypoint {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(nextWaypoint.type.icon)
                                .font(.title)
                            VStack(alignment: .leading) {
                                Text(nextWaypoint.label ?? "Waypoint")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                if let notes = nextWaypoint.notes, !notes.isEmpty {
                                    Text(notes)
                                        .font(.subheadline)
                                        .foregroundColor(.white.opacity(0.8))
                                }
                            }
                            Spacer()
                        }
                        
                        // Upcoming waypoints list
                        if navigationManager.upcomingWaypoints.count > 1 {
                            Divider()
                                .background(Color.white.opacity(0.3))
                            
                            Text("Coming Up:")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.6))
                            
                            ForEach(Array(navigationManager.upcomingWaypoints.dropFirst().prefix(2))) { waypoint in
                                HStack {
                                    Text(waypoint.type.icon)
                                    Text(waypoint.label ?? "Waypoint")
                                        .font(.caption)
                                    Spacer()
                                    if let dist = waypoint.distanceFromStart,
                                       let currentDist = navigationManager.currentRoute?.points.first(where: { 
                                           navigationManager.currentLocation?.distance(from: CLLocation(latitude: $0.latitude, longitude: $0.longitude)) ?? .infinity < 100 
                                       })?.distance {
                                        Text(navigationManager.formatDistance(dist - currentDist))
                                            .font(.caption)
                                            .foregroundColor(.white.opacity(0.6))
                                    }
                                }
                                .foregroundColor(.white.opacity(0.8))
                            }
                        }
                    }
                    .padding()
                    .background(
                        LinearGradient(
                            colors: [Color.cyan.opacity(0.9), Color.blue.opacity(0.9)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(16)
                    .padding()
                }
            }
            
            // Control Buttons
            VStack {
                HStack {
                    Spacer()
                    
                    VStack(spacing: 12) {
                        // Center on user button
                        Button(action: centerOnUser) {
                            Image(systemName: "location.fill")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 50, height: 50)
                                .background(Circle().fill(Color.blue))
                                .shadow(radius: 4)
                        }
                        
                        // Stop navigation button
                        Button(action: stopNavigation) {
                            Image(systemName: "stop.fill")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 50, height: 50)
                                .background(Circle().fill(Color.red))
                                .shadow(radius: 4)
                        }
                    }
                    .padding()
                }
                
                Spacer()
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            navigationManager.startNavigation(route: route)
            centerOnRoute()
            RouteNavigationManager.requestNotificationPermissions()
        }
        .onDisappear {
            navigationManager.stopNavigation()
        }
    }
    
    private func centerOnUser() {
        if let location = navigationManager.currentLocation {
            withAnimation {
                region.center = location.coordinate
            }
        }
    }
    
    private func centerOnRoute() {
        if let firstPoint = route.points.first {
            region.center = firstPoint.coordinate
        }
    }
    
    private func stopNavigation() {
        navigationManager.stopNavigation()
        // Navigate back
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
            Text(value)
                .font(.headline)
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    let locationManager = LocationManager()
    let sampleRoute = Route(
        id: 1,
        name: "Sample Route",
        points: [
            RoutePoint(latitude: 37.7749, longitude: -122.4194, elevation: 100, distance: 0),
            RoutePoint(latitude: 37.7849, longitude: -122.4094, elevation: 150, distance: 1000)
        ],
        totalDistance: 1000,
        totalElevationGain: 50,
        waypoints: [
            RouteWaypoint(
                id: 1,
                routeId: 1,
                latitude: 37.7799,
                longitude: 122.4144,
                type: .danger,
                label: "Aggressive Dogs",
                notes: "Two large dogs often off-leash on right side",
                distanceFromStart: 500,
                alertDistance: 1000
            )
        ]
    )
    
    return RideNavigationView(route: sampleRoute, locationManager: locationManager)
}
