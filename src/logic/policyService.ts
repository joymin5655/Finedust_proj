import { supabase } from './supabase';
import type { PolicyIndexEntry, CountryPolicy } from './types';

/**
 * 모든 국가 리스트 가져오기 (Supabase countries 테이블 사용)
 */
export const fetchPolicyIndex = async (): Promise<PolicyIndexEntry[]> => {
  const { data, error } = await supabase
    .from('countries')
    .select(`
      country:name,
      countryCode:code,
      region,
      flag,
      updated_at
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching policy index:', error);
    throw error;
  }

  // 기존 PolicyIndexEntry 타입에 맞춰 데이터 가공
  return (data as any[]).map(item => ({
    country: item.country,
    countryCode: item.countryCode,
    region: item.region,
    flag: item.flag,
    policyCount: 0, // 나중에 별도 조인이나 필드로 처리 가능
    lastUpdated: item.updated_at,
    dataFile: `${item.country.toLowerCase().replace(/\s+/g, '-')}.json`
  })) as PolicyIndexEntry[];
};

/**
 * 특정 국가의 정책 데이터 가져오기 (Supabase countries + policies 조인)
 */
export const fetchCountryPolicy = async (countryCodeOrFile: string): Promise<CountryPolicy> => {
  // 파일명(예: 'china.json')이 넘어오는 경우와 국가 코드가 넘어오는 경우 모두 처리
  const lookupValue = countryCodeOrFile.includes('.json') 
    ? countryCodeOrFile.split('.')[0].replace(/-/g, ' ')
    : countryCodeOrFile;

  const query = supabase
    .from('countries')
    .select(`
      country:name,
      countryCode:code,
      region,
      flag,
      coordinates,
      policies (*)
    `);

  // 코드(2글자)인지 이름인지에 따라 쿼리 분기
  const { data, error } = lookupValue.length === 2 
    ? await query.eq('code', lookupValue.toUpperCase()).single()
    : await query.ilike('name', `%${lookupValue}%`).single();

  if (error) {
    console.error('Error fetching country policy:', error);
    throw error;
  }

  return data as unknown as CountryPolicy;
};
