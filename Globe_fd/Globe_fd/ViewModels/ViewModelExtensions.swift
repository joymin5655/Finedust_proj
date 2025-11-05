//
//  ViewModelExtensions.swift
//  Globe_fd
//
//  Extensions for ViewModels
//  Created on 2025-11-05.
//

import Foundation
import SwiftUI
import UIKit

// MARK: - StationViewModel Extensions
extension StationViewModel {
    var averagePM25: Double {
        guard !stations.isEmpty else { return 0 }
        return stations.reduce(0) { $0 + $1.pm25 } / Double(stations.count)
    }
    
    var safeStationsCount: Int {
        stations.filter { $0.pm25 <= 12 }.count
    }
}

// MARK: - CameraViewModel Updated
@MainActor
class CameraViewModel: ObservableObject {
    @Published var prediction: PredictionResult?
    @Published var selectedImage: Image?
    @Published var isProcessing = false
    @Published var error: String?
    
    private let apiClient = APIClient.shared
    
    func processImage(_ uiImage: UIImage) async {
        isProcessing = true
        selectedImage = Image(uiImage: uiImage)
        error = nil
        
        do {
            guard let imageData = uiImage.jpegData(compressionQuality: 0.8) else {
                throw NSError(domain: "Image", code: -1, 
                            userInfo: [NSLocalizedDescriptionKey: "Failed to convert image"])
            }
            
            // For demo purposes, create a mock prediction
            // In production, this would call the actual API
            try await Task.sleep(nanoseconds: 2_000_000_000) // 2 second delay
            
            self.prediction = PredictionResult(
                pm25: Double.random(in: 5...100),
                confidence: Double.random(in: 0.7...0.95),
                breakdown: PredictionBreakdown(
                    camera: Double.random(in: 5...100),
                    station: Double.random(in: 5...100),
                    satellite: Double.random(in: 5...100)
                ),
                timestamp: Date()
            )
            
            print("✅ Prediction: PM2.5 = \(self.prediction?.pm25 ?? 0)")
        } catch {
            self.error = error.localizedDescription
            print("❌ Prediction error: \(error)")
        }
        
        isProcessing = false
    }
}

// MARK: - Camera Manager
import AVFoundation

class CameraManager: NSObject, ObservableObject {
    @Published var isAuthorized = false
    @Published var capturedImage: UIImage?
    
    private let session = AVCaptureSession()
    private var output = AVCapturePhotoOutput()
    
    override init() {
        super.init()
        checkAuthorization()
    }
    
    func checkAuthorization() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            isAuthorized = true
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                DispatchQueue.main.async {
                    self?.isAuthorized = granted
                }
            }
        default:
            isAuthorized = false
        }
    }
    
    func setupSession() {
        guard let device = AVCaptureDevice.default(for: .video) else { return }
        
        do {
            let input = try AVCaptureDeviceInput(device: device)
            if session.canAddInput(input) {
                session.addInput(input)
            }
            
            if session.canAddOutput(output) {
                session.addOutput(output)
            }
            
            session.startRunning()
        } catch {
            print("Failed to setup camera: \(error)")
        }
    }
    
    func capturePhoto() {
        let settings = AVCapturePhotoSettings()
        output.capturePhoto(with: settings, delegate: self)
    }
}

extension CameraManager: AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput, 
                    didFinishProcessingPhoto photo: AVCapturePhoto, 
                    error: Error?) {
        guard let data = photo.fileDataRepresentation(),
              let image = UIImage(data: data) else { return }
        
        DispatchQueue.main.async {
            self.capturedImage = image
        }
    }
}
