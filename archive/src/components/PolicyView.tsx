import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { ArrowLeftIcon } from './Icons';

interface PolicyData {
  id: string;
  country: string;
  countryCode: string;
  authority: string;
  title: string;
  description: string;
  effectiveDate: string;
  targetReduction: number;
  targetYear: number;
  targetPM25: number;
  credibility: number;
  officialURL: string;
  beforeData: Array<{ year: number; pm25: number }>;
  afterData: Array<{ year: number; pm25: number }>;
  improvement: number;
  status: 'effective' | 'moderate' | 'limited';
}

interface PolicyViewProps {
  onBack: () => void;
}

const PolicyView: React.FC<PolicyViewProps> = ({ onBack }) => {
  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyData | null>(null);

  useEffect(() => {
    // Load policies data
    fetch('/data/policies.json')
      .then(res => res.json())
      .then(data => {
        setPolicies(data.policies || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load policies:', err);
        setLoading(false);
      });
  }, []);

  // Get flag emoji
  const getFlagEmoji = (countryCode: string) => {
    if (countryCode === 'EU') return '🇪🇺';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Prepare data for visualizations
  const getEffectivenessData = () => {
    return policies.map(p => ({
      country: p.country,
      improvement: p.improvement,
      target: p.targetReduction,
      status: p.status,
      credibility: p.credibility * 100
    })).sort((a, b) => b.improvement - a.improvement);
  };

  const getTimelineData = () => {
    return policies.map(p => ({
      country: p.country,
      year: new Date(p.effectiveDate).getFullYear(),
      improvement: p.improvement,
      credibility: p.credibility * 100
    })).sort((a, b) => a.year - b.year);
  };

  const getCredibilityDistribution = () => {
    const ranges = [
      { range: '70-80%', count: 0 },
      { range: '80-90%', count: 0 },
      { range: '90-100%', count: 0 }
    ];

    policies.forEach(p => {
      const cred = p.credibility * 100;
      if (cred >= 90) ranges[2].count++;
      else if (cred >= 80) ranges[1].count++;
      else ranges[0].count++;
    });

    return ranges;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'effective': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'limited': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getChartData = (policy: PolicyData) => {
    const combined = [
      ...policy.beforeData.map(d => ({ year: d.year, pm25: d.pm25, period: 'Before' })),
      ...policy.afterData.map(d => ({ year: d.year, pm25: d.pm25, period: 'After' }))
    ];
    return combined.sort((a, b) => a.year - b.year);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading policy data...</p>
        </div>
      </div>
    );
  }

  if (selectedPolicy) {
    const policyYear = new Date(selectedPolicy.effectiveDate).getFullYear();
    const chartData = getChartData(selectedPolicy);

    return (
      <div className="w-full min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-10 p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={onBack}
                className="p-3 rounded-2xl glass-button"
                aria-label="Back"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                ← Back to all policies
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Policy Header */}
          <div className="glass p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <span className="text-6xl">{getFlagEmoji(selectedPolicy.countryCode)}</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedPolicy.title}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">{selectedPolicy.country} • {selectedPolicy.authority}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Credibility</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{(selectedPolicy.credibility * 100).toFixed(0)}%</div>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{selectedPolicy.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Effective Date</div>
                <div className="font-bold text-gray-900 dark:text-white">{new Date(selectedPolicy.effectiveDate).toLocaleDateString()}</div>
              </div>
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target Reduction</div>
                <div className="font-bold text-gray-900 dark:text-white">{selectedPolicy.targetReduction}%</div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actual Improvement</div>
                <div className="font-bold text-green-600 dark:text-green-400">-{selectedPolicy.improvement.toFixed(1)}%</div>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
                <div className={`font-bold capitalize ${
                  selectedPolicy.status === 'effective' ? 'text-green-600 dark:text-green-400' :
                  selectedPolicy.status === 'moderate' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>{selectedPolicy.status}</div>
              </div>
            </div>
          </div>

          {/* Impact Chart */}
          <div className="glass p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">PM2.5 Trend Analysis</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="year"
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    label={{ value: 'Year', position: 'bottom', offset: 40 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    label={{ value: 'PM2.5 Concentration (μg/m³)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine
                    x={policyYear}
                    stroke="#3b82f6"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: `Policy Implemented (${policyYear})`,
                      position: 'top',
                      fill: '#3b82f6',
                      fontWeight: 'bold'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pm25"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="PM2.5 Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Source Link */}
          <div className="glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Official Source</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View the official government documentation</p>
              </div>
              <a
                href={selectedPolicy.officialURL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Visit Official Website →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Research View
  const effectivenessData = getEffectivenessData();
  const timelineData = getTimelineData();
  const credibilityData = getCredibilityDistribution();

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-3 rounded-2xl glass-button"
                aria-label="Back"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Global Air Quality Policy Research</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Analyzing {policies.length} policies from {new Set(policies.map(p => p.country)).size} countries/regions
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Policies</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{policies.length}</div>
          </div>
          <div className="glass p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Countries/Regions</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{new Set(policies.map(p => p.country)).size}</div>
          </div>
          <div className="glass p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Avg. Improvement</div>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
              {(policies.reduce((sum, p) => sum + p.improvement, 0) / policies.length).toFixed(1)}%
            </div>
          </div>
          <div className="glass p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Effective Policies</div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {policies.filter(p => p.status === 'effective').length}
            </div>
          </div>
        </div>

        {/* Policy Effectiveness Ranking */}
        <div className="glass p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Policy Effectiveness Ranking</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Comparison of actual PM2.5 reduction vs. target reduction goals
          </p>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={effectivenessData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="country"
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                  label={{ value: 'Reduction (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="target" fill="#cbd5e1" name="Target Reduction" />
                <Bar dataKey="improvement" name="Actual Improvement">
                  {effectivenessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Implementation Timeline */}
        <div className="glass p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Policy Implementation Timeline</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            When policies were implemented and their effectiveness over time
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={['dataMin - 2', 'dataMax + 2']}
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                  label={{ value: 'Year Implemented', position: 'bottom', offset: 40 }}
                />
                <YAxis
                  dataKey="improvement"
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                  label={{ value: 'Improvement (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Scatter name="Policies" data={timelineData} fill="#3b82f6">
                  {timelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${entry.credibility / 100})`} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            * Opacity indicates data credibility (darker = more credible)
          </p>
        </div>

        {/* Data Source Credibility */}
        <div className="glass p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Data Source Credibility Distribution</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            All policy data is sourced from official government websites and verified against multiple sources
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={credibilityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} label={{ value: 'Number of Policies', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" name="Policies" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Policy Cards Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((policy) => (
              <button
                key={policy.id}
                onClick={() => setSelectedPolicy(policy)}
                className="glass p-6 text-left hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{getFlagEmoji(policy.countryCode)}</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                    policy.status === 'effective' ? 'bg-green-500' :
                    policy.status === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {policy.status}
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{policy.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{policy.country}</p>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Improvement</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">-{policy.improvement.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Credibility</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{(policy.credibility * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Data Sources Section */}
        <div className="glass p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Data Sources & Methodology</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              All policy data has been collected from official government sources and international organizations.
              Each policy entry includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Official government documentation and policy announcements</li>
              <li>PM2.5 measurements before and after policy implementation</li>
              <li>Credibility scores based on data source reliability and verification</li>
              <li>Links to original source documents for transparency</li>
            </ul>
            <p className="mt-6">
              <strong>Countries/Regions Covered:</strong>
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {Array.from(new Set(policies.map(p => p.country))).map(country => (
                <span key={country} className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                  {country}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyView;
