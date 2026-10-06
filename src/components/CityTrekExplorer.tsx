import React, { useState, useEffect } from 'react';
import { TrekLocation } from '../types';
import { getTreksForCity } from '../services/cityTrekService';
import { COMPREHENSIVE_TREKS } from '../services/trekPresets';
import { MapPin, Compass, Navigation, Search, Mountain, ChevronRight, Activity } from 'lucide-react';

interface CityTrekExplorerProps {
  selectedTrek: TrekLocation;
  onSelectTrek: (trek: TrekLocation) => void;
  disabled?: boolean;
}

const FEATURED_CITIES = [
  { name: 'Bengaluru', label: 'Bengaluru' },
  { name: 'Kolar', label: 'Kolar' },
  { name: 'Tumakuru', label: 'Tumakuru' },
  { name: 'Chikkamagaluru', label: 'Chikkamagaluru' },
  { name: 'Coorg', label: 'Coorg' },
  { name: 'Dharamshala', label: 'Dharamshala' },
  { name: 'Seattle', label: 'Seattle' }
];

export const CityTrekExplorer: React.FC<CityTrekExplorerProps> = ({
  selectedTrek,
  onSelectTrek,
  disabled
}) => {
  const [activeCity, setActiveCity] = useState('Bengaluru');
  const [customInput, setCustomInput] = useState('');
  const [treksList, setTreksList] = useState<Array<TrekLocation & { distanceKm?: number }>>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadCity = async (cityName: string) => {
    if (!cityName.trim()) return;
    setIsLoading(true);
    try {
      const res = await getTreksForCity(cityName);
      setTreksList(res.treks);
      setIsFallback(!res.foundInCity);
      setActiveCity(cityName);
    } catch (err) {
      console.warn('Error loading treks for city:', err);
      setTreksList(COMPREHENSIVE_TREKS.slice(0, 8));
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCity('Bengaluru');
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      loadCity(customInput.trim());
    }
  };

  return (
    <div className="bg-[#111714] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Title & City Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
              <Navigation className="w-4 h-4" />
            </span>
            <h3 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-white">
              Expedition Trailheads by Geographic Hub
            </h3>
          </div>
          <p className="text-xs text-white/50">
            Select a mountain base or enter any city to inspect regional summits & routes.
          </p>
        </div>

        {/* Custom City Search Input */}
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 shrink-0">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Search hub (e.g. Kolar, Mysore)..."
            disabled={disabled}
            className="px-3 py-1.5 bg-black/40 border border-white/10 focus:border-emerald-500 rounded-xl text-xs font-mono text-white placeholder-white/30 outline-hidden w-48 sm:w-56"
          />
          <button
            type="submit"
            disabled={disabled || !customInput.trim() || isLoading}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? '...' : 'Scan'}
          </button>
        </form>
      </div>

      {/* Featured City Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FEATURED_CITIES.map((c) => {
          const isActive = activeCity.toLowerCase() === c.name.toLowerCase();
          return (
            <button
              key={c.name}
              type="button"
              disabled={disabled}
              onClick={() => loadCity(c.name)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-black font-bold shadow-xs'
                  : 'bg-white/[0.03] text-white/60 hover:text-white border border-white/5 hover:border-white/15'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Treks Horizontal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {treksList.map((trek) => {
          const isSelected = selectedTrek.id === trek.id;
          return (
            <div
              key={trek.id}
              onClick={() => onSelectTrek(trek)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_20px_rgba(52,211,153,0.15)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-white/80'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span className="uppercase">{trek.trailDifficulty || 'MODERATE'}</span>
                  {trek.distanceKm !== undefined && (
                    <span className="text-emerald-400">~{trek.distanceKm} km from hub</span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {trek.name}
                </h4>
                <p className="text-[11px] text-white/50 line-clamp-1">
                  {trek.region} • {trek.elevation}m altitude
                </p>
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/5 text-[10px] font-mono">
                <span className="text-white/40">
                  {trek.trailLengthKm ? `${trek.trailLengthKm} km route` : 'Summit Peak'}
                </span>
                <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                  Select <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
