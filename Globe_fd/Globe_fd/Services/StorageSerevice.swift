//
//  StorageService.swift
//  Globe_fd
//
//  Created on 2025-11-05.
//

import Foundation

class StorageService {
    static let shared = StorageService()
    
    private init() {}
    
    func saveData(_ data: Data, key: String) {
        UserDefaults.standard.set(data, forKey: key)
    }
    
    func loadData(key: String) -> Data? {
        return UserDefaults.standard.data(forKey: key)
    }
}
