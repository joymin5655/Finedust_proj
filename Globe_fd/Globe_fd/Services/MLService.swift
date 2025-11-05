//
//  MLService.swift
//  Globe_fd
//
//  Created on 2025-11-05.
//

import Foundation
import CoreML

class MLService {
    static let shared = MLService()
    
    private init() {}
    
    func predictPM25(from imageData: Data) throws -> Double {
        // CoreML 모델 사용 (필요 시 구현)
        // 현재는 더미 값 반환
        return 0.0
    }
}
