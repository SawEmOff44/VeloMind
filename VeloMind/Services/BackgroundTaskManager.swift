import Foundation
import AVFoundation
import UIKit
import os.log

/// Manages background task execution and audio session for screen-off operation
@MainActor
class BackgroundTaskManager: ObservableObject {
    @Published var isInBackground = false
    @Published var backgroundTimeRemaining: TimeInterval = 0
    
    private var backgroundTaskID: UIBackgroundTaskIdentifier = .invalid
    private let audioSession = AVAudioSession.sharedInstance()
    private let logger = Logger(subsystem: "com.velomind.app", category: "Background")
    
    init() {
        setupNotifications()
    }
    
    // MARK: - Lifecycle Management
    
    private func setupNotifications() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appWillEnterForeground),
            name: UIApplication.willEnterForegroundNotification,
            object: nil
        )
    }
    
    @objc private func appDidEnterBackground() {
        Task { @MainActor in
            isInBackground = true
            logger.info("App entered background")
            startBackgroundTask()
        }
    }
    
    @objc private func appWillEnterForeground() {
        Task { @MainActor in
            isInBackground = false
            logger.info("App returned to foreground")
            endBackgroundTask()
        }
    }
    
    // MARK: - Background Task Management
    
    private func startBackgroundTask() {
        guard backgroundTaskID == .invalid else {
            logger.warning("Background task already running")
            return
        }
        
        backgroundTaskID = UIApplication.shared.beginBackgroundTask { [weak self] in
            self?.endBackgroundTask()
        }
        
        logger.info("Started background task: \(self.backgroundTaskID.rawValue)")
        
        // Monitor remaining time
        monitorBackgroundTime()
    }
    
    private func endBackgroundTask() {
        guard backgroundTaskID != .invalid else { return }
        
        UIApplication.shared.endBackgroundTask(backgroundTaskID)
        logger.info("Ended background task: \(self.backgroundTaskID.rawValue)")
        backgroundTaskID = .invalid
    }
    
    private func monitorBackgroundTime() {
        Task { [weak self] in
            guard let self = self else { return }
            while self.backgroundTaskID != .invalid {
                let remaining = UIApplication.shared.backgroundTimeRemaining
                await MainActor.run {
                    self.backgroundTimeRemaining = remaining
                }
                
                if remaining < 30 {
                    self.logger.warning("Low background time remaining: \\(remaining)s")
                }
                
                try? await Task.sleep(nanoseconds: 5_000_000_000) // 5 seconds
            }
        }
    }
    
    // MARK: - Audio Session Management
    
    /// Configure audio session for background playback (voice alerts)
    func configureAudioSession() {
        do {
            try audioSession.setCategory(
                .playback,
                mode: .spokenAudio,
                options: [.mixWithOthers, .duckOthers]
            )
            try audioSession.setActive(true)
            logger.info("Audio session configured for background playback")
        } catch {
            logger.error("Failed to configure audio session: \(error.localizedDescription)")
        }
    }
    
    /// Activate audio session when starting ride
    func activateAudioSession() {
        do {
            try audioSession.setActive(true)
            logger.info("Audio session activated")
        } catch {
            logger.error("Failed to activate audio session: \(error.localizedDescription)")
        }
    }
    
    /// Deactivate audio session when stopping ride
    func deactivateAudioSession() {
        do {
            try audioSession.setActive(false, options: .notifyOthersOnDeactivation)
            logger.info("Audio session deactivated")
        } catch {
            logger.error("Failed to deactivate audio session: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Battery Optimization
    
    /// Check if device is in low power mode
    var isLowPowerModeEnabled: Bool {
        ProcessInfo.processInfo.isLowPowerModeEnabled
    }
    
    /// Optimize update frequency based on power mode
    func recommendedUpdateInterval() -> TimeInterval {
        if isLowPowerModeEnabled {
            return 5.0 // 5 seconds in low power mode
        } else {
            return 1.0 // 1 second normal
        }
    }
    
    // MARK: - Status Monitoring
    
    /// Get human-readable status
    func getStatusDescription() -> String {
        if isInBackground {
            let minutes = Int(backgroundTimeRemaining / 60)
            let seconds = Int(backgroundTimeRemaining.truncatingRemainder(dividingBy: 60))
            return "Background: \(minutes)m \(seconds)s remaining"
        } else {
            return "Foreground"
        }
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
        endBackgroundTask()
    }
}
