import React, { useState, useEffect } from 'react';
import { TrekLocation } from '../types';
import { getTreksForCity } from '../services/cityTrekService';
import { COMPREHENSIVE_TREKS } from '../services/trekPresets';
import { Compass, ChevronRight, MapPin, Search } from 'lucide-react';

interface CityTrekExplorerProps {
  selectedTrek: TrekLocation;
  onSelectTrek: (trek: TrekLocation) => void;
  disabled?: boolean;
}

const FEATURED_CITIES = [
  'Bengaluru',
  'Kolar',
  'Tumakuru',
  'Chikkamagaluru',
  'Coorg',
  'Dharamshala',
  'Seattle'
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
      setActiveCity(res.cityName || cityName);
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
    <section className="bg-white border border-[#E4E0D2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header & Custom City Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE6D8] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#526B4F]">
            <Compass className="w-4 h-4 text-[#243B2A]" />
            <span>Explore Popular Treks by City</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#243B2A] mt-0.5">
            {isFallback
              ? `Popular Mountain Treks (No specific trails found near ${activeCity})`
              : `Popular Trekking Places near ${activeCity}`}
          </h3>
          <p className="text-xs text-[#6B7262]">
            Choose a city or enter your own to discover nearby peaks, monoliths, and trailheads.
          </p>
        </div>

        <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C8675] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter any city (e.g. Manali, Pune)..."
              disabled={disabled}
              className="pl-8 pr-3 py-2 bg-[#FAF8F3] border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs text-[#1F2520] placeholder-[#8C8675] outline-hidden w-52 sm:w-60"
            />
          </div>
          <button
            type="submit"
            disabled={disabled || !customInput.trim() || isLoading}
            className="px-4 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {isLoading ? 'Finding...' : 'Find Treks'}
          </button>
        </form>
      </div>

      {/* Featured City Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FEATURED_CITIES.map((city) => {
          const isActive = activeCity.toLowerCase() === city.toLowerCase();
          return (
            <button
              key={city}
              type="button"
              disabled={disabled}
              onClick={() => loadCity(city)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-[#243B2A] text-white border-[#243B2A] shadow-xs'
                  : 'bg-[#FAF8F3] text-[#526B4F] border-[#E4E0D2] hover:bg-[#EAE6D8] hover:text-[#243B2A]'
              }`}
            >
              {city}
            </button>
          );
        })}
      </div>

      {/* Trek Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {treksList.map((trek) => {
          const isSelected = selectedTrek.id === trek.id;
          return (
            <button
              key={trek.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTrek(trek)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-[#243B2A]/5 border-[#243B2A] ring-1 ring-[#243B2A]/20'
                  : 'bg-[#FAF8F3] border-[#E4E0D2] hover:border-[#526B4F] hover:bg-white'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#6B7262]">
                  <span className="text-[#243B2A] font-semibold">
                    {trek.trailDifficulty || 'Moderate'}
                  </span>
                  {trek.distanceKm !== undefined && (
                    <span className="tabular-nums">{trek.distanceKm} km away</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-[#1F2520] group-hover:text-[#243B2A] transition-colors line-clamp-1">
                  {trek.name}
                </h4>

                <p className="text-xs text-[#6B7262] line-clamp-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0 text-[#526B4F]" />
                  <span>
                    {trek.region} · {trek.elevation || 1200}m
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#EAE6D8] text-xs">
                <span className="text-[#6B7262] tabular-nums">
                  {trek.trailLengthKm ? `${trek.trailLengthKm} km trail` : 'Summit trail'}
                </span>
                <span className="text-[#243B2A] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                  Analyze <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
