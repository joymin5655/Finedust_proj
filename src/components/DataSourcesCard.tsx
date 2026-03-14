import { Radio, Satellite, ShieldCheck, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DataSourcesCardProps {
  sources: string[];
  dqss: number;
  loading: boolean;
}

const DataSourcesCard = ({ sources, dqss, loading }: DataSourcesCardProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-[2.5rem] border border-earth-brown/10 bg-white/80 dark:bg-black/40 p-8 shadow-xl backdrop-blur-md relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
        <Database size={100} />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-forest/10 p-2 rounded-xl">
            <ShieldCheck className="text-forest w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-clay font-black">{t('LABELS.INTEGRITY_SCORE')}</p>
            <h3 className="text-xl font-bold text-earth-brown">DQSS: {loading ? '--' : dqss}</h3>
          </div>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <p className="text-xs font-bold text-clay uppercase tracking-widest border-b border-earth-brown/5 pb-2">
          {t('LABELS.ACTIVE_PIPELINES')}
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="animate-pulse flex gap-4 items-center">
              <div className="w-10 h-10 bg-sage/20 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-2 bg-sage/20 rounded w-1/2"></div>
                <div className="h-2 bg-sage/20 rounded w-1/4"></div>
              </div>
            </div>
          ) : (
            sources.map((source, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-sage/10 rounded-2xl border border-soft-green/5 hover:border-forest/20 transition-all">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  {source.includes('NASA') || source.includes('MAIAC') ? (
                    <Satellite size={18} className="text-forest" />
                  ) : (
                    <Radio size={18} className="text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-earth-brown truncate">{source}</p>
                  <p className="text-[10px] text-clay uppercase font-black tracking-tighter">
                    {source.includes('NASA') ? 'Direct Earthdata (1km)' : 'Ground Station (REST)'}
                  </p>
                </div>
                {source.includes('NASA') && (
                  <div className="bg-forest text-warm-cream text-[8px] px-2 py-0.5 rounded-full font-black uppercase animate-pulse">
                    Live
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-earth-brown/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dqss > 80 ? 'bg-soft-green' : 'bg-amber-400'}`}></div>
          <span className="text-[10px] font-bold text-clay uppercase">{dqss > 80 ? 'High Confidence' : 'Hybrid Estimating'}</span>
        </div>
        <span className="text-[10px] text-clay/40 font-serif italic">v4.0 Edge Pipeline</span>
      </div>
    </div>
  );
};

export default DataSourcesCard;
