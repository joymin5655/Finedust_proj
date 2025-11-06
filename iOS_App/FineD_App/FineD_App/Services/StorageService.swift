//
//  StorageService.swift
//  FineD_App
//
//  Created on 2025-11-06.
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
