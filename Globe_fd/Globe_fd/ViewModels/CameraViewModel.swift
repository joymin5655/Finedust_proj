//
//  CameraViewModel.swift
//  Globe_fd
//
//  Created on 2025-11-05.
//

import Foundation
import SwiftUI
import Combine

@MainActor
class CameraViewModel: ObservableObject {
    @Published var prediction: PredictionResult?
    @Published var selectedImage: Image?
    @Published var selectedImageData: Data?  // ✅ 원본 데이터 저장
    @Published var isProcessing = false
    @Published var error: String?
    
    private let apiClient = APIClient.shared
    
    // 이미지 데이터 직접 처리
    func processImage(_ imageData: Data) async {
        isProcessing = true
        error = nil
        
        do {
            self.selectedImageData = imageData
            
            // SwiftUI Image로도 표시
            if let image = createImage(from: imageData) {
                self.selectedImage = image
            }
            
            let result = try await apiClient.predictPM25(imageData: imageData)
            self.prediction = result
            print("✅ Prediction: PM2.5 = \(result.pm25)")
        } catch {
            self.error = error.localizedDescription
            print("❌ Prediction error: \(error)")
        }
        
        isProcessing = false
    }
    
    // Data → SwiftUI Image 변환
    private func createImage(from data: Data) -> Image? {
        #if os(iOS)
        if let uiImage = UIImage(data: data) {
            return Image(uiImage: uiImage)
        }
        #else
        if let nsImage = NSImage(data: data) {
            return Image(nsImage: nsImage)
        }
        #endif
        return nil
    }
}
