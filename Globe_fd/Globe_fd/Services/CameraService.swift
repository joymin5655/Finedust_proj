//
//  CameraService.swift
//  Globe_fd
//
//  Created on 2025-11-05.
//

import Foundation

class CameraService {
    static let shared = CameraService()
    
    private init() {}
    
    func captureImage(completion: @escaping (Data?) -> Void) {
        // 카메라 캡처 로직 (필요 시 구현)
        completion(nil)
    }
}
