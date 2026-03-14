// ── Global Types for AirLens ──

export interface AirQualityData {
  pm25: number;
  aqi: number;
  city: string | { name: string };
  station: string;
  source: string;
  sources?: string[];
  lastUpdated: string;
  grade: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy';
  dqss?: number;
  iaqi?: any;
}

export interface PolicyImpact {
  beforePeriod: {
    start: string;
    end: string;
    meanPM25: number;
    medianPM25: number;
    samples: number;
  };
  afterPeriod: {
    start: string;
    end: string;
    meanPM25: number;
    medianPM25: number;
    samples: number;
  };
  analysis: {
    deltaMean: number;
    percentChange: number;
    pValue: number;
    significant: boolean;
    effectSize: string;
  };
}

export interface TimelineEvent {
  date: string;
  event: string;
  pm25: number;
  syntheticPM25?: number; // SDID Synthetic Counterfactual
}

export interface Policy {
  id: string;
  name: string;
  implementationDate: string;
  type: string;
  url: string;
  description: string;
  targetPollutants: string[];
  measures: string[];
  impact: PolicyImpact;
  timeline: TimelineEvent[];
}

export interface CountryPolicy {
  country: string;
  countryCode: string;
  region: string;
  flag: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  policies: Policy[];
}

export interface PolicyIndexEntry {
  country: string;
  countryCode: string;
  region: string;
  flag: string;
  dataFile: string;
  policyCount: number;
  lastUpdated: string;
}

export interface PolicyIndex {
  version: string;
  lastUpdated: string;
  description: string;
  countries: PolicyIndexEntry[];
}
