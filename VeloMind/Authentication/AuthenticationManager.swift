import Foundation
import SwiftUI

@MainActor
class AuthenticationManager: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    
    private let userDefaultsKey = "velomind.currentUser"
    private let tokenKey = "velomind.authToken"
    
    init() {
        loadSavedUser()
    }
    
    func login(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }
        
        // TODO: Implement actual API authentication with backend
        // For now, create a local user for development
        
        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000)
        
        // Create user
        let user = User(
            email: email,
            name: extractNameFromEmail(email)
        )
        
        // Save user
        saveUser(user)
        
        self.currentUser = user
        self.isAuthenticated = true
    }
    
    func register(email: String, password: String, name: String) async throws {
        isLoading = true
        defer { isLoading = false }
        
        // TODO: Implement actual API registration with backend
        
        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000)
        
        // Create user
        let user = User(
            email: email,
            name: name
        )
        
        // Save user
        saveUser(user)
        
        self.currentUser = user
        self.isAuthenticated = true
    }
    
    func logout() {
        currentUser = nil
        isAuthenticated = false
        clearSavedUser()
    }
    
    private func loadSavedUser() {
        guard let data = UserDefaults.standard.data(forKey: userDefaultsKey),
              let user = try? JSONDecoder().decode(User.self, from: data) else {
            return
        }
        
        self.currentUser = user
        self.isAuthenticated = true
    }
    
    private func saveUser(_ user: User) {
        guard let data = try? JSONEncoder().encode(user) else { return }
        UserDefaults.standard.set(data, forKey: userDefaultsKey)
    }
    
    private func clearSavedUser() {
        UserDefaults.standard.removeObject(forKey: userDefaultsKey)
        UserDefaults.standard.removeObject(forKey: tokenKey)
    }
    
    private func extractNameFromEmail(_ email: String) -> String {
        let username = email.components(separatedBy: "@").first ?? email
        return username.capitalized
    }
}
