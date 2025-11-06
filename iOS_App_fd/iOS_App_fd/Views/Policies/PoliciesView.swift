//
//  PoliciesView.swift
//  AirLens
//
//  Created on 2025-11-06
//

import SwiftUI

struct PoliciesView: View {
    @EnvironmentObject var policyViewModel: PolicyViewModel
    @State private var searchText = ""
    @State private var selectedCategory: PolicyCategory?
    @State private var selectedCountry: String?
    @State private var showFilters = false
    
    var filteredPolicies: [AirPolicy] {
        policyViewModel.policies.filter { policy in
            let matchesSearch = searchText.isEmpty ||
                policy.title.localizedCaseInsensitiveContains(searchText) ||
                policy.country.localizedCaseInsensitiveContains(searchText)
            
            let matchesCategory = selectedCategory == nil ||
                policy.category == selectedCategory
            
            let matchesCountry = selectedCountry == nil ||
                policy.country == selectedCountry
            
            return matchesSearch && matchesCategory && matchesCountry
        }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                SearchBar(text: $searchText)
                    .padding(.horizontal)
                    .padding(.top, 8)
                
                // Filter Chips
                if showFilters {
                    FilterChipsView(
                        selectedCategory: $selectedCategory,
                        selectedCountry: $selectedCountry,
                        availableCountries: policyViewModel.availableCountries
                    )
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }
                
                // Content
                if policyViewModel.isLoading {
                    LoadingView(message: "Loading policies...")
                } else if filteredPolicies.isEmpty {
                    EmptyStateView(
                        icon: "doc.text",
                        title: "No Policies Found",
                        message: "Try adjusting your filters or search terms"
                    )
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(filteredPolicies) { policy in
                                PolicyCard(policy: policy)
                            }
                        }
                        .padding()
                    }
                }
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationTitle("Air Policies")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showFilters.toggle() }) {
                        Image(systemName: showFilters ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle")
                    }
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    if policyViewModel.policies.count > 0 {
                        Text("\(policyViewModel.policies.count) policies")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .task {
            if policyViewModel.policies.isEmpty {
                await policyViewModel.fetchPolicies()
            }
        }
    }
}

// MARK: - Search Bar
struct SearchBar: View {
    @Binding var text: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)
            
            TextField("Search policies...", text: $text)
                .textFieldStyle(PlainTextFieldStyle())
            
            if !text.isEmpty {
                Button(action: { text = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                }
            }
        }
        .padding(10)
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(10)
    }
}

// MARK: - Filter Chips View
struct FilterChipsView: View {
    @Binding var selectedCategory: PolicyCategory?
    @Binding var selectedCountry: String?
    let availableCountries: [String]
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                // Category filters
                Menu {
                    Button("All Categories") {
                        selectedCategory = nil
                    }
                    
                    ForEach(PolicyCategory.allCases, id: \.self) { category in
                        Button(action: { selectedCategory = category }) {
                            Label(category.rawValue, systemImage: category.icon)
                        }
                    }
                } label: {
                    PoliciesFilterChip(
                        title: selectedCategory?.rawValue ?? "All Categories",
                        isSelected: selectedCategory != nil
                    )
                }
                
                // Country filter
                Menu {
                    Button("All Countries") {
                        selectedCountry = nil
                    }
                    
                    ForEach(availableCountries, id: \.self) { country in
                        Button(country) {
                            selectedCountry = country
                        }
                    }
                } label: {
                    PoliciesFilterChip(
                        title: selectedCountry ?? "All Countries",
                        isSelected: selectedCountry != nil
                    )
                }
                
                // Clear filters
                if selectedCategory != nil || selectedCountry != nil {
                    Button(action: {
                        selectedCategory = nil
                        selectedCountry = nil
                    }) {
                        PoliciesFilterChip(title: "Clear", isSelected: false, isDestructive: true)
                    }
                }
            }
        }
    }
}

struct PoliciesFilterChip: View {
    let title: String
    let isSelected: Bool
    var isDestructive: Bool = false
    
    var body: some View {
        Text(title)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                isDestructive ? Color.red.opacity(0.2) :
                isSelected ? Color.blue : Color(UIColor.tertiarySystemBackground)
            )
            .foregroundColor(
                isDestructive ? .red :
                isSelected ? .white : .primary
            )
            .cornerRadius(15)
    }
}

// MARK: - Policy Card
struct PolicyCard: View {
    let policy: AirPolicy
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                // Category Icon
                Image(systemName: policy.category.icon)
                    .font(.title2)
                    .foregroundColor(Color(hex: policy.category.color))
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(policy.title)
                        .font(.headline)
                        .lineLimit(isExpanded ? nil : 2)
                    
                    HStack(spacing: 8) {
                        Label(policy.country, systemImage: "mappin.circle")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        Label(policy.authority, systemImage: "building.2")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                // Credibility Score
                VStack {
                    Text("\(Int(policy.credibility * 100))")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(colorForCredibility(policy.credibility))
                    Text("Score")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            // Description
            if let description = policy.description {
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(isExpanded ? nil : 3)
            }
            
            // Category Badge
            HStack {
                CategoryBadge(category: policy.category)
                
                Spacer()
                
                // Expand/Collapse Button
                Button(action: { withAnimation { isExpanded.toggle() } }) {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            // Actions (when expanded)
            if isExpanded {
                HStack(spacing: 12) {
                    // View Source Button
                    Link(destination: URL(string: policy.url)!) {
                        Label("View Source", systemImage: "link")
                            .font(.caption)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(Color.blue.opacity(0.1))
                            .foregroundColor(.blue)
                            .cornerRadius(8)
                    }
                    
                    // Share Button
                    ShareLink(item: policy.url) {
                        Label("Share", systemImage: "square.and.arrow.up")
                            .font(.caption)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(Color(UIColor.tertiarySystemBackground))
                            .cornerRadius(8)
                    }
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    private func colorForCredibility(_ score: Double) -> Color {
        switch score {
        case 0.8...1.0:
            return .green
        case 0.6..<0.8:
            return .yellow
        case 0.4..<0.6:
            return .orange
        default:
            return .red
        }
    }
}

struct CategoryBadge: View {
    let category: PolicyCategory
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: category.icon)
                .font(.caption2)
            Text(category.rawValue)
                .font(.caption2)
                .fontWeight(.medium)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color(hex: category.color).opacity(0.2))
        .foregroundColor(Color(hex: category.color))
        .cornerRadius(6)
    }
}

// MARK: - Loading View
struct LoadingView: View {
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle())
                .scaleEffect(1.5)
            
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(UIColor.systemBackground))
    }
}

// MARK: - Empty State View
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text(title)
                .font(.title2)
                .fontWeight(.semibold)
            
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(UIColor.systemBackground))
    }
}

#Preview {
    PoliciesView()
        .environmentObject(PolicyViewModel())
}