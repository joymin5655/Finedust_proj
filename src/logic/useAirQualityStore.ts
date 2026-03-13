import { create } from 'zustand';
import type { AirQualityData } from './types';

interface AirQualityStore {
  data: AirQualityData | null;
  loading: boolean;
  error: string | null;
  setData: (data: AirQualityData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAirQualityStore = create<AirQualityStore>((set) => ({
  data: null,
  loading: false,
  error: null,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));