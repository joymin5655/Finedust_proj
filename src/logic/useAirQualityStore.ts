import { create } from 'zustand';
import type { AirQualityData } from './types';
import { fetchIntegratedAirQuality } from './airQualityService';

interface AirQualityStore {
  data: AirQualityData | null;
  loading: boolean;
  error: string | null;
  setData: (data: AirQualityData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchData: (lat: number, lon: number) => Promise<void>;
}

export const useAirQualityStore = create<AirQualityStore>((set) => ({
  data: null,
  loading: false,
  error: null,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  fetchData: async (lat, lon) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchIntegratedAirQuality(lat, lon);
      set({ data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Unknown error', loading: false });
    }
  },
}));