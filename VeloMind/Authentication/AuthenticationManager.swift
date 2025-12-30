import Foundation
import SwiftUI

@MainActor
class AuthenticationManager: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    
    private let userDefaultsKey = "velomind.currentUser"
    private let tokenKey = "velomind.authToken"
    
    private var baseURL: String {
        #if DEBUG
        return "http://127.0.0.1:3001/api"
        #else
        return "https://velomind.onrender.com/api"
        #endif
    }
    
    var currentToken: String? {
        UserDefaults.standard.string(forKey: tokenKey)
    }
    
    init() {
        loadSavedUser()
    }
    
    func login(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }
        
        // Call backend API
        guard let url = URL(string: "\(baseURL)/auth/login") else {
            throw AuthError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email, "password": password]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthError.serverError
        }
        
        if httpResponse.statusCode == 401 {
            throw AuthError.invalidCredentials
        }
        
        guard httpResponse.statusCode == 200 else {
            throw AuthError.serverError
        }
        
        let authResponse = try JSONDecoder().decode(AuthResponse.self, from: data)
        
        // Save token
        UserDefaults.standard.set(authResponse.token, forKey: tokenKey)
        
        // Create and save user
        let user = User(
            id: authResponse.userId,
            email: email,
            name: authResponse.name ?? extractNameFromEmail(email)
        )
        
        saveUser(user)
        
        self.currentUser = user
        self.isAuthenticated = true
    }
    
    func register(email: String, password: String, name: String) async throws {
        isLoading = true
        defer { isLoading = false }
        
        // Call backend API
        guard let url = URL(string: "\(baseURL)/auth/register") else {
            throw AuthError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email, "password": password, "name": name]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthError.serverError
        }
        
        if httpResponse.statusCode == 400 {
            throw AuthError.userExists
        }
        
        guard httpResponse.statusCode == 201 else {
            throw AuthError.serverError
        }
        
        let authResponse = try JSONDecoder().decode(AuthResponse.self, from: data)
        
        // Save token
        UserDefaults.standard.set(authResponse.token, forKey: tokenKey)
        
        // Create and save user
        let user = User(
            id: authResponse.userId,
            email: email,
            name: name
        )
        
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
