import axios from 'axios';
import type { PolicyIndex, CountryPolicy } from './types';

// Use base URL for assets to ensure compatibility with GitHub Pages / Cloudflare
const BASE_DATA_URL = `${import.meta.env.BASE_URL}data`;

export const fetchPolicyIndex = async (): Promise<PolicyIndex> => {
  const response = await axios.get(`${BASE_DATA_URL}/index.json`);
  return response.data;
};

export const fetchCountryPolicy = async (dataFile: string): Promise<CountryPolicy> => {
  const response = await axios.get(`${BASE_DATA_URL}/${dataFile}`);
  return response.data;
};