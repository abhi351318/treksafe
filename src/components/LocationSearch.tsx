import React, { useState, useEffect, useRef } from 'react';
import { TrekLocation } from '../types';
import { POPULAR_TREKS, searchPlaces } from '../services/googleMapsLoader';
import { enrichTrekWithTrailway } from '../services/trailPathwayService';
import { Search, MapPin, X, Compass, Loader2 } from 'lucide-react';

interface LocationSearchProps {
  selectedTrek: TrekLocation;
  onSelectTrek: (trek: TrekLocation) => void;
  disabled?: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  selectedTrek,
  onSelectTrek,
  disabled
}) => {
  const [query, setQuery] = useState(selectedTrek.name);
  const [suggestions, setSuggestions] = useState<Array<{
    placeId: string;
    name: string;
    formattedAddress: string;
    latitude: number;
    longitude: number;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Sync when selectedTrek updates externally
  useEffect(() => {
    setQuery(selectedTrek.name);
  }, [selectedTrek.name]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlaces(query);
        setSuggestions(results);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelectSuggestion = (s: {
    placeId: string;
    name: string;
    formattedAddress: string;
    latitude: number;
    longitude: number;
  }) => {
    // Check if matches a known preset for rich elevation metadata
    const preset = POPULAR_TREKS.find(
      p => p.name.toLowerCase() === s.name.toLowerCase() ||
           Math.abs(p.latitude - s.latitude) < 0.05 && Math.abs(p.longitude - s.longitude) < 0.05
    );

    const baseTrek: TrekLocation = {
      id: s.placeId,
      name: s.name,
      region: s.formattedAddress,
      latitude: s.latitude,
      longitude: s.longitude,
      elevation: preset ? preset.elevation : 1450,
      trailDifficulty: preset ? preset.trailDifficulty : 'Moderate',
      description: preset ? preset.description : `Trek destination located at ${s.formattedAddress}`
    };

    const newTrek = enrichTrekWithTrailway(baseTrek);

    setQuery(newTrek.name);
    setIsOpen(false);
    onSelectTrek(newTrek);
  };

  const handlePresetClick = (preset: typeof POPULAR_TREKS[0]) => {
    const enriched = enrichTrekWithTrailway(preset);
    setQuery(enriched.name);
    setIsOpen(false);
    onSelectTrek(enriched);
  };

  return (
    <div className="w-full space-y-2.5" ref={searchBoxRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-[#243B2A] flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#526B4F]" /> Trek Location or Trailhead
        </span>
        <span className="text-[11px] font-normal lowercase text-[#526B4F]">Google Places & presets</span>
      </label>

      {/* Input container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#526B4F]">
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#243B2A]" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search trail, peak, mountain pass (e.g., Kudremukh, Rainier)..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#D5D0C0] hover:border-[#243B2A]/50 focus:border-[#243B2A] focus:ring-2 focus:ring-[#243B2A]/10 rounded-xl text-sm font-medium text-[#1F2520] placeholder-[#8C8675] outline-hidden transition-all shadow-2xs"
        />

        {query && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setQuery('');
              setIsOpen(true);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C8675] hover:text-[#1F2520]"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Autocomplete Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#D5D0C0] rounded-xl shadow-lg z-30 max-h-72 overflow-y-auto divide-y divide-[#F0EDE3]">
            {suggestions.length > 0 ? (
              suggestions.map((item) => (
                <button
                  key={item.placeId}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#FAF8F3] transition-colors flex items-start gap-2.5 group cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#526B4F] mt-0.5 shrink-0 group-hover:text-[#243B2A]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1F2520] group-hover:text-[#243B2A] truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#6B7262] truncate">
                      {item.formattedAddress}
                    </p>
                  </div>
                </button>
              ))
            ) : query.trim().length >= 2 && !isSearching ? (
              <div className="p-4 text-center text-xs text-[#6B7262]">
                No places found matching "{query}". Try one of the popular mountain trails below.
              </div>
            ) : null}

            {/* Popular Trek Presets Section in Dropdown */}
            <div className="p-2.5 bg-[#FAF8F3]">
              <div className="text-[11px] font-bold text-[#526B4F] uppercase tracking-wider px-1 pb-1.5 flex items-center gap-1">
                <Compass className="w-3 h-3 text-[#D7A84A]" /> Suggested Mountain Trails
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {POPULAR_TREKS.slice(0, 6).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className="text-left px-2.5 py-1.5 rounded-lg hover:bg-white text-xs text-[#243B2A] font-medium flex items-center justify-between group transition-colors"
                  >
                    <span className="truncate">{preset.name}</span>
                    <span className="text-[10px] text-[#6B7262] font-mono shrink-0 ml-1.5">
                      {preset.elevation}m
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Select Preset Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none text-xs">
        <span className="text-[#6B7262] shrink-0 text-[11px] font-medium mr-1">Popular:</span>
        {POPULAR_TREKS.slice(0, 5).map((preset) => {
          const isSelected = selectedTrek.name === preset.name;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => handlePresetClick(preset)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#243B2A] text-white border-[#243B2A] shadow-2xs'
                  : 'bg-white text-[#243B2A] border-[#DCD7C6] hover:border-[#243B2A] hover:bg-[#FAF8F3]'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
