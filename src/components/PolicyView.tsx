import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Policy, PolicyCategory, PolicyEffect } from '../types';
import { policies, policyEffects, getPolicyEffect } from '../data/policyData';

interface PolicyViewProps {
  onBack: () => void;
}

const PolicyView: React.FC<PolicyViewProps> = ({ onBack }) => {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique countries
  const countries = ['all', ...Array.from(new Set(policies.map(p => p.countryCode)))];
  const categories = ['all', ...Object.values(PolicyCategory)];

  // Filter policies
  const filteredPolicies = policies.filter(policy => {
    const countryMatch = selectedCountry === 'all' || policy.countryCode === selectedCountry;
    const categoryMatch = selectedCategory === 'all' || policy.category === selectedCategory;
    return countryMatch && categoryMatch;
  });

  // Get country flag emoji
  const getFlagEmoji = (countryCode: string) => {
    if (countryCode === 'EU') return '🇪🇺';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Get credibility badge color
  const getCredibilityColor = (credibility: number) => {
    if (credibility >= 90) return 'from-green-500 to-green-600';
    if (credibility >= 75) return 'from-blue-500 to-blue-600';
    return 'from-yellow-500 to-yellow-600';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'effective':
        return 'from-green-500 to-green-600';
      case 'moderate':
        return 'from-yellow-500 to-yellow-600';
      case 'limited':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Prepare chart data
  const getChartData = (effect: PolicyEffect) => {
    const allData = [...effect.beforeData, ...effect.afterData].map((d, idx) => ({
      ...d,
      phase: idx < effect.beforeData.length ? 'Before' : 'After',
    }));
    return allData;
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{payload[0].payload.month}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            PM2.5: <span className="font-bold text-blue-600 dark:text-blue-400">{payload[0].value} μg/m³</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {payload[0].payload.phase} Policy
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 p-4 md:p-6 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onBack}
              className="p-2 md:p-3 rounded-2xl bg-white/10 dark:bg-gray-800 backdrop-blur-md hover:bg-white/20 dark:hover:bg-gray-700 active:scale-95 transition-all duration-200 shadow-lg"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Global Air Quality Policies</h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">전세계 미세먼지 정책 및 효과 분석</p>
            </div>
          </div>
          <div className="text-2xl md:text-3xl">🌍</div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-4 md:mt-6 max-w-7xl mx-auto">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm md:text-base font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Countries</option>
            {countries.filter(c => c !== 'all').map((code) => (
              <option key={code} value={code}>
                {getFlagEmoji(code)} {policies.find(p => p.countryCode === code)?.country}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm md:text-base font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'all').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {selectedPolicy ? (
            // Policy Detail View
            <div className="space-y-6">
              <button
                onClick={() => setSelectedPolicy(null)}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to list
              </button>

              {/* Policy Info Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{getFlagEmoji(selectedPolicy.countryCode)}</span>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{selectedPolicy.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedPolicy.country} • {selectedPolicy.authority}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getCredibilityColor(selectedPolicy.credibility)} text-white font-bold text-sm shadow-lg`}>
                    {selectedPolicy.credibility}% 신뢰도
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Category</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedPolicy.category}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Effective Date</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedPolicy.effectiveDate}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Target Reduction</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedPolicy.targetReduction}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">Status</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {(() => {
                        const effect = getPolicyEffect(selectedPolicy.id);
                        return effect ? effect.status.toUpperCase() : 'N/A';
                      })()}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedPolicy.description}</p>
                </div>

                <a
                  href={selectedPolicy.officialURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg"
                >
                  Official Website
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Before/After Comparison Chart */}
              {(() => {
                const effect = getPolicyEffect(selectedPolicy.id);
                if (!effect) return null;

                const chartData = getChartData(effect);
                const avgBefore = effect.beforeData.reduce((sum, d) => sum + d.pm25, 0) / effect.beforeData.length;
                const avgAfter = effect.afterData.reduce((sum, d) => sum + d.pm25, 0) / effect.afterData.length;

                return (
                  <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Policy Impact Analysis</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">시행 전후 PM2.5 농도 비교</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor(effect.status)} text-white font-bold shadow-lg`}>
                        {effect.improvement.toFixed(1)}% Improvement
                      </div>
                    </div>

                    {/* Line Chart */}
                    <div className="mb-8">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            label={{ value: 'PM2.5 (μg/m³)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <ReferenceLine
                            x={effect.beforeData[effect.beforeData.length - 1].month}
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            label={{ value: 'Policy Start', fill: '#ef4444', fontSize: 12 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="pm25"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6 }}
                            name="PM2.5 Level"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Before/After Comparison Bars */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">Before Policy</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-gray-900 dark:text-white">{avgBefore.toFixed(1)}</span>
                          <span className="text-lg text-gray-600 dark:text-gray-400">μg/m³</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">6개월 평균</p>
                      </div>

                      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">After Policy</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-gray-900 dark:text-white">{avgAfter.toFixed(1)}</span>
                          <span className="text-lg text-gray-600 dark:text-gray-400">μg/m³</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">12개월 평균</p>
                      </div>
                    </div>

                    {/* Impact Summary */}
                    <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Impact Summary</p>
                          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                            This policy achieved a <strong>{effect.improvement.toFixed(1)}%</strong> reduction in average PM2.5 levels
                            over 12 months following implementation. The policy is classified as <strong>{effect.status}</strong> based
                            on the achieved improvement compared to the target reduction of {selectedPolicy.targetReduction}%.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            // Policy List View
            <div>
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredPolicies.length} policies found
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredPolicies.map((policy) => {
                  const effect = getPolicyEffect(policy.id);
                  return (
                    <div
                      key={policy.id}
                      onClick={() => setSelectedPolicy(policy)}
                      className="group p-5 md:p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.99]"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-3xl md:text-4xl">{getFlagEmoji(policy.countryCode)}</span>
                        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getCredibilityColor(policy.credibility)} text-white text-xs font-bold shadow-lg`}>
                          {policy.credibility}%
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {policy.title}
                      </h3>

                      {/* Country & Authority */}
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {policy.country} • {policy.authority}
                      </p>

                      {/* Category Badge */}
                      <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium mb-3">
                        {policy.category}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Target</p>
                          <p className="font-bold text-gray-900 dark:text-white">{policy.targetReduction}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Result</p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {effect ? (
                              <span className={effect.improvement >= policy.targetReduction ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
                                {effect.improvement.toFixed(1)}%
                              </span>
                            ) : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {effect && (
                        <div className={`mt-3 px-3 py-1.5 rounded-lg bg-gradient-to-r ${getStatusColor(effect.status)} text-white text-xs font-bold text-center`}>
                          {effect.status.toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredPolicies.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No policies found matching your filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyView;
