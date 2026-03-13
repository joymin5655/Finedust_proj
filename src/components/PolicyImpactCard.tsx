import { TrendingDown, TrendingUp, Info } from 'lucide-react';
import type { PolicyImpact } from '../logic/types';

interface PolicyImpactCardProps {
  impact: PolicyImpact;
}

const PolicyImpactCard = ({ impact }: PolicyImpactCardProps) => {
  const isPositive = impact.analysis.deltaMean < 0;

  return (
    <div className="bg-white dark:bg-black/20 rounded-3xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-gray-900 dark:text-white font-black text-xl tracking-tight uppercase">
            Causal Impact Summary
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Comparing periods before and after implementation</p>
        </div>
        <div className={`p-2 rounded-xl ${isPositive ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-red-100 dark:bg-red-900/40 text-red-600'}`}>
          {isPositive ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] uppercase font-bold text-gray-400">Mean Change</p>
          <div className="flex items-end gap-1">
            <span className={`text-4xl font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {impact.analysis.deltaMean > 0 ? '+' : ''}{impact.analysis.deltaMean}
            </span>
            <span className="text-xs font-bold text-gray-400 pb-1">µg/m³</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] uppercase font-bold text-gray-400">Relative Effect</p>
          <div className="flex items-end gap-1">
            <span className={`text-4xl font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {impact.analysis.percentChange}%
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Before Mean</span>
          <span className="font-bold text-gray-700 dark:text-gray-200">{impact.beforePeriod.meanPM25} µg/m³</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gray-400 rounded-full" style={{ width: '100%' }}></div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">After Mean</span>
          <span className="font-bold text-gray-700 dark:text-gray-200">{impact.afterPeriod.meanPM25} µg/m³</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} 
            style={{ width: `${(impact.afterPeriod.meanPM25 / impact.beforePeriod.meanPM25) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
        <Info className="text-primary shrink-0" size={16} />
        <p className="text-[10px] text-gray-400 leading-relaxed italic">
          This analysis uses the Difference-in-Differences (DID) methodology to separate policy effects from natural variation. 
          P-value: {impact.analysis.pValue} ({impact.analysis.significant ? 'Statistically Significant' : 'Not Significant'}).
        </p>
      </div>
    </div>
  );
};

export default PolicyImpactCard;