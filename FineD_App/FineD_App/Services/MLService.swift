//
//  MLService.swift
//  FineD_App
//
//  Created on 2025-11-06.
//

import Foundation
import CoreML
import UIKit

class MLService {
    static let shared = MLService()
    
    private init() {}
    
    func predictPM25(from image: UIImage) throws -> Double {
        // CoreML 모델 사용 (필요 시 구현)
        // 현재는 더미 값 반환
        return 0.0
    }
}
