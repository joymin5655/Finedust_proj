//
//  NetworkManager.swift
//  Globe_fd
//
//  Created on 2025-11-05.
//

import Foundation

class NetworkManager {
    static let shared = NetworkManager()
    
    private init() {}
    
    func checkConnectivity() -> Bool {
        // 네트워크 연결 체크
        return true
    }
    
    func isReachable() -> Bool {
        return true
    }
}
