//
//  CameraViewModel.swift
//  Globe_fd
//
//  Created by JOYMIN on 11/5/25.
//
import Foundation
import Combine
import UIKit
import CoreLocation

class CameraViewModel: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var prediction: PredictionResult?
    @Published var selectedImage: UIImage?
    @Published var isProcessing = false
    @Published var error: String?
    
    private let apiClient = APIClient.shared
    private let locationManager = CLLocationManager()
    
    override init() {
        super.init()
        setupLocation()
    }
    
    private func setupLocation() {
        locationManager.delegate = self
        locationManager.requestWhenInUseAuthorization()
    }
    
    func processImage(_ image: UIImage) async {
        DispatchQueue.main.async {
            self.isProcessing = true
            self.selectedImage = image
            self.error = nil
        }
        
        do {
            guard let imageData = image.jpegData(compressionQuality: 0.8) else {
                throw NSError(domain: "Image", code: -1)
            }
            
            let result = try await apiClient.predictPM25(imageData: imageData)
            
            DispatchQueue.main.async {
                self.prediction = result
            }
        } catch {
            DispatchQueue.main.async {
                self.error = error.localizedDescription
            }
        }
        
        DispatchQueue.main.async {
            self.isProcessing = false
        }
    }
}
