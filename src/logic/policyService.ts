import axios from 'axios';
import type { PolicyIndex, CountryPolicy } from './types';

export const fetchPolicyIndex = async (): Promise<PolicyIndex> => {
  const response = await axios.get('/src/assets/data/index.json');
  return response.data;
};

export const fetchCountryPolicy = async (dataFile: string): Promise<CountryPolicy> => {
  const response = await axios.get(`/src/assets/data/${dataFile}`);
  return response.data;
};