//
//  CameraViewModel.swift
//  AirLens
//
//  ViewModel for managing camera capture and PM2.5 prediction
//

import Foundation
import UIKit
import Combine
import CoreLocation

@MainActor
class CameraViewModel: ObservableObject {
    @Published var capturedImage: UIImage?
    @Published var predictionResult: PredictionResult?
    @Published var isAnalyzing = false
    @Published var error: Error?
    @Published var showResults = false

    private let apiService: APIService
    private let cameraService: CameraService
    private var cancellables = Set<AnyCancellable>()

    init(apiService: APIService = .shared, cameraService: CameraService = CameraService()) {
        self.apiService = apiService
        self.cameraService = cameraService

        // Observe camera service changes
        cameraService.$capturedImage
            .sink { [weak self] image in
                self?.capturedImage = image
            }
            .store(in: &cancellables)

        cameraService.$error
            .sink { [weak self] error in
                self?.error = error
            }
            .store(in: &cancellables)
    }

    func setupCamera() -> CameraService {
        return cameraService
    }

    func capturePhoto() {
        cameraService.capturePhoto()
    }

    func analyzeImage(_ image: UIImage, location: CLLocation? = nil) async {
        isAnalyzing = true
        error = nil

        do {
            let latitude = location?.coordinate.latitude
            let longitude = location?.coordinate.longitude

            let result = try await apiService.predictPM25(
                image: image,
                latitude: latitude,
                longitude: longitude
            )

            predictionResult = result
            showResults = true
        } catch {
            self.error = error
            print("Error analyzing image: \(error.localizedDescription)")
        }

        isAnalyzing = false
    }

    func analyzeCurrentImage(location: CLLocation? = nil) async {
        guard let image = capturedImage else {
            error = CameraError.captureFailed
            return
        }

        await analyzeImage(image, location: location)
    }

    func selectImageFromLibrary(_ image: UIImage) {
        capturedImage = image
    }

    func reset() {
        capturedImage = nil
        predictionResult = nil
        showResults = false
        error = nil
    }

    func retake() {
        capturedImage = nil
        predictionResult = nil
        showResults = false
    }

    // For testing/demo purposes
    func generateMockPrediction(pm25Value: Double = 25.0) {
        predictionResult = PredictionResult(
            pm25: pm25Value,
            confidence: 0.87,
            location: LocationInfo(
                latitude: 37.5665,
                longitude: 126.9780,
                country: "South Korea",
                city: "Seoul",
                countryFlag: "🇰🇷"
            ),
            timestamp: ISO8601DateFormatter().string(from: Date()),
            methodology: Methodology(
                imageAnalysis: 0.45,
                weatherData: 0.25,
                historicalTrends: 0.20,
                satelliteData: 0.10
            )
        )
        showResults = true
    }
}
