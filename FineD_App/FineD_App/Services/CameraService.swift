//
//  CameraService.swift
//  FineD_App
//
//  Created on 2025-11-06.
//

import Foundation
import UIKit

class CameraService {
    static let shared = CameraService()
    
    private init() {}
    
    func captureImage(completion: @escaping (UIImage?) -> Void) {
        // 카메라 캡처 로직 (필요 시 구현)
        completion(nil)
    }
}
