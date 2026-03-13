import { Search } from 'lucide-react';
import { useState } from 'react';
import type { PolicyIndexEntry } from '../logic/types';

interface CountrySelectorProps {
  countries: PolicyIndexEntry[];
  onSelect: (country: PolicyIndexEntry) => void;
  selectedCode?: string;
}

const CountrySelector = ({ countries, onSelect, selectedCode }: CountrySelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countries.filter(c => 
    c.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.countryCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-black/20 rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-gray-100 dark:border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search countries..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-700 dark:text-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-primary/20">
        <div className="grid grid-cols-1 gap-1">
          {filteredCountries.map((c) => (
            <button
              key={c.countryCode}
              onClick={() => onSelect(c)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                selectedCode === c.countryCode
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 border border-transparent'
              }`}
            >
              <span className="text-2xl">{c.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{c.country}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{c.region}</p>
              </div>
              <div className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md text-[10px] font-black">
                {c.policyCount}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CountrySelector;