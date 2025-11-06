export type View = 'camera' | 'globe' | 'settings' | 'history';

export interface PredictionBreakdown {
  station: number;
  camera: number;
  satellite: number;
}

export interface PM25Prediction {
  pm25: number;
  confidence: number;
  uncertainty: number;
  breakdown: PredictionBreakdown;
  sources: string[];
  timestamp?: number;
  location?: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  imageData?: string;
}

export enum PolicyCategory {
  PM25_REDUCTION = "PM2.5 Reduction",
  OZONE_PROTECTION = "Ozone Layer Protection",
  EMISSION_STANDARDS = "Emission Standards",
  CLIMATE_ACTION = "Climate Action",
  PUBLIC_HEALTH = "Public Health",
}

export interface Policy {
  id: string;
  country: string;
  authority: string;
  category: PolicyCategory;
  title: string;
  description: string;
  officialURL: string;
  credibility: number;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  prediction: PM25Prediction;
  synced: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  language: 'en' | 'ko';
  autoSync: boolean;
  offlineMode: boolean;
}
