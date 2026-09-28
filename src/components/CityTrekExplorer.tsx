import React, { useState, useEffect } from 'react';
import { TrekLocation } from '../types';
import { getTreksForCity } from '../services/cityTrekService';
import { COMPREHENSIVE_TREKS } from '../services/trekPresets';
import { MapPin, Compass, Navigation, Search, CheckCircle2, ChevronRight, Mountain } from 'lucide-react';

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
    <div className="bg-white border border-[#E4E0D2] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Title & City Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE6D8] pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#243B2A] text-[#D7A84A] rounded-lg">
              <Navigation className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#243B2A]">
              Explore Cities & Their Popular Trek Places
            </h3>
          </div>
          <p className="text-xs text-[#526B4F]">
            Click any city or enter a custom city to view its top mountain treks & trails.
          </p>
        </div>

        {/* Custom City Search Input */}
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter city (e.g. Kolar, Mysore)..."
              disabled={disabled}
              className="pl-3 pr-2 py-1.5 bg-[#FAF8F3] border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden w-48 sm:w-56"
            />
          </div>
          <button
            type="submit"
            disabled={disabled || !customInput.trim() || isLoading}
            className="px-3 py-1.5 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Finding...' : 'View'}
          </button>
        </form>
      </div>

      {/* City Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[#6B7262] font-semibold text-[11px] shrink-0 mr-1">Select City:</span>
        {FEATURED_CITIES.map((c) => {
          const isActive = activeCity.toLowerCase() === c.name.toLowerCase();
          return (
            <button
              key={c.name}
              type="button"
              disabled={disabled}
              onClick={() => {
                setCustomInput(c.name);
                loadCity(c.name);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#243B2A] text-white border-[#243B2A] shadow-xs'
                  : 'bg-[#FAF8F3] text-[#526B4F] border-[#D5D0C0] hover:text-[#243B2A] hover:border-[#243B2A]'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Info notice about current city */}
      <div className="flex items-center justify-between text-xs text-[#526B4F] pt-0.5">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#243B2A]" />
          <span>
            Showing {isFallback ? 'Popular Mountain Treks (Fallback for ' : 'Popular Trekking Places in/near '}
            <strong>{activeCity}</strong>
            {isFallback ? ')' : ''}:
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold text-[#243B2A] bg-[#FAF8F3] px-2 py-0.5 rounded-md border border-[#EAE6D8]">
          {treksList.length} Trails
        </span>
      </div>

      {/* Trek Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {treksList.map((trek) => {
          const isSelected = selectedTrek.name.toLowerCase() === trek.name.toLowerCase();

          return (
            <button
              key={trek.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTrek(trek)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-[#FAF8F3]/60 hover:bg-white border-[#EAE6D8] hover:border-[#243B2A] shadow-2xs'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <h4 className="font-bold text-xs text-[#1F2520] group-hover:text-[#243B2A] truncate">
                    {trek.name}
                  </h4>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-[#6B7262] line-clamp-1">
                  {trek.region}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#EAE6D8] text-[10px] text-[#526B4F]">
                <span className="font-mono font-medium">
                  ~{trek.elevation}m elev
                </span>
                <span className="px-1.5 py-0.5 rounded-sm bg-white border border-[#D5D0C0] font-bold text-[#243B2A]">
                  {trek.trailDifficulty || 'Moderate'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
