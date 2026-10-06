import React, { useState, useEffect } from 'react';
import { TrekLocation } from '../types';
import { getTreksForCity } from '../services/cityTrekService';
import { COMPREHENSIVE_TREKS } from '../services/trekPresets';
import { Compass, Navigation, ChevronRight, MapPin, Search } from 'lucide-react';

interface CityTrekExplorerProps {
  selectedTrek: TrekLocation;
  onSelectTrek: (trek: TrekLocation) => void;
  disabled?: boolean;
}

const FEATURED_CITIES = [
  { name: 'Bengaluru', label: 'BENGALURU' },
  { name: 'Kolar', label: 'KOLAR' },
  { name: 'Tumakuru', label: 'TUMAKURU' },
  { name: 'Chikkamagaluru', label: 'CHIKKAMAGALURU' },
  { name: 'Coorg', label: 'COORG' },
  { name: 'Dharamshala', label: 'DHARAMSHALA' },
  { name: 'Seattle', label: 'SEATTLE' }
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
    <div className="bg-[#0F1420] border border-white/10 p-5 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-orange-400 font-bold block">
            REGIONAL BASES & WAYPOINTS
          </span>
          <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
            Geographic Expedition Centers
          </h3>
          <p className="text-xs text-white/50">
            Select a mountain hub or search any township to extract summits & trailheads within operating range.
          </p>
        </div>

        {/* Custom Hub Search */}
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 shrink-0">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type base city (e.g. Manali, Ooty)..."
            disabled={disabled}
            className="px-3 py-1.5 bg-[#090D15] border border-white/10 focus:border-orange-500 text-xs font-mono text-white placeholder-white/30 outline-hidden w-48 sm:w-56"
          />
          <button
            type="submit"
            disabled={disabled || !customInput.trim() || isLoading}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? '...' : 'SCAN'}
          </button>
        </form>
      </div>

      {/* Featured Cities Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-[11px]">
        {FEATURED_CITIES.map((c) => {
          const isActive = activeCity.toLowerCase() === c.name.toLowerCase();
          return (
            <button
              key={c.name}
              type="button"
              disabled={disabled}
              onClick={() => loadCity(c.name)}
              className={`px-3 py-1.5 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-orange-500 text-black font-bold'
                  : 'bg-[#141B2B] text-white/60 hover:text-white border border-white/5'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Horizontal Trail Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {treksList.map((trek) => {
          const isSelected = selectedTrek.id === trek.id;
          return (
            <div
              key={trek.id}
              onClick={() => onSelectTrek(trek)}
              className={`p-4 border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-orange-500/10 border-orange-500 text-white'
                  : 'bg-[#101522] border-white/5 hover:border-white/20 text-white/80'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase">
                  <span className="text-orange-400 font-bold">{trek.trailDifficulty || 'MODERATE'}</span>
                  {trek.distanceKm !== undefined && (
                    <span>~{trek.distanceKm} KM OUT</span>
                  )}
                </div>

                <h4 className="font-display text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                  {trek.name}
                </h4>

                <p className="text-[11px] text-white/50 line-clamp-1 font-mono">
                  {trek.region} • {trek.elevation}m MSL
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[10px] font-mono">
                <span className="text-white/40">
                  {trek.trailLengthKm ? `${trek.trailLengthKm} km route` : 'Direct Summit'}
                </span>
                <span className="text-orange-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                  SELECT <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
