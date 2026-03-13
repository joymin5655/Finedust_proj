import { useState, useEffect } from 'react';
import { fetchPolicyIndex, fetchCountryPolicy } from '../logic/policyService';
import type { 
  PolicyIndex, 
  CountryPolicy, 
  PolicyIndexEntry,
  Policy
} from '../logic/types';
import CountrySelector from '../components/CountrySelector';
import PolicyImpactCard from '../components/PolicyImpactCard';
import PolicyTimelineChart from '../components/PolicyTimelineChart';
import { BarChart3, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';

const PolicyView = () => {
  const [index, setIndex] = useState<PolicyIndex | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCountry, setLoadingCountry] = useState(false);

  useEffect(() => {
    const loadIndex = async () => {
      try {
        const data = await fetchPolicyIndex();
        setIndex(data);
        const defaultCountry = data.countries.find((c: PolicyIndexEntry) => c.countryCode === 'KR') || data.countries[0];
        if (defaultCountry) {
          handleCountrySelect(defaultCountry);
        }
      } catch (error) {
        console.error('Error loading policy index:', error);
      } finally {
        setLoading(false);
      }
    };
    loadIndex();
  }, []);

  const handleCountrySelect = async (entry: PolicyIndexEntry) => {
    setLoadingCountry(true);
    try {
      const data = await fetchCountryPolicy(entry.dataFile);
      setSelectedCountry(data);
    } catch (error) {
      console.error('Error loading country policy:', error);
    } finally {
      setLoadingCountry(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            Policy Impact Analysis 📊
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xl leading-relaxed">
            Quantifying the effectiveness of environmental regulations using counterfactual analysis 
            and real-time PM2.5 monitoring. Data covers 66+ countries and major policy shifts.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <ShieldCheck className="text-emerald-500 w-4 h-4" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">66 Countries Verified</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <CountrySelector 
            countries={index?.countries || []} 
            onSelect={handleCountrySelect}
            selectedCode={selectedCountry?.countryCode}
          />
        </div>

        <div className="lg:col-span-9 flex flex-col gap-8">
          {loadingCountry ? (
            <div className="bg-white dark:bg-black/20 rounded-3xl border border-gray-200 dark:border-white/10 h-[600px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : selectedCountry ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <span className="text-6xl">{selectedCountry.flag}</span>
                <div>
                  <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">
                    {selectedCountry.country}
                  </h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                    {selectedCountry.region} · {selectedCountry.policies.length} Active Policies
                  </p>
                </div>
              </div>

              {selectedCountry.policies.map((policy: Policy) => (
                <div key={policy.id} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-black/20 rounded-3xl border border-gray-200 dark:border-white/10 p-8 flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{policy.type}</span>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                          {policy.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {policy.description}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {policy.measures.map((m: string, idx: number) => (
                          <span key={idx} className="bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-600 dark:text-gray-300">
                            {m}
                          </span>
                        ))}
                      </div>

                      <a 
                        href={policy.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-6 flex items-center gap-2 text-primary text-xs font-bold hover:underline"
                      >
                        <ExternalLink size={14} />
                        View Official Document
                      </a>
                    </div>

                    <PolicyImpactCard impact={policy.impact} />
                  </div>

                  <div className="bg-white dark:bg-black/20 rounded-3xl border border-gray-200 dark:border-white/10 p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart3 className="text-primary w-5 h-5" />
                      <h4 className="font-black text-sm uppercase tracking-widest text-gray-500">PM2.5 Trend & Timeline</h4>
                    </div>
                    <PolicyTimelineChart 
                      timeline={policy.timeline} 
                      implementationDate={policy.implementationDate} 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PolicyView;