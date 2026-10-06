import React, { useState, useEffect, useRef } from 'react';
import { TrekLocation } from '../types';
import { POPULAR_TREKS, searchPlaces } from '../services/googleMapsLoader';
import { enrichTrekWithTrailway } from '../services/trailPathwayService';
import { getTreksForCity } from '../services/cityTrekService';
import { Search, MapPin, X, Compass, Loader2, Navigation } from 'lucide-react';

interface LocationSearchProps {
  selectedTrek: TrekLocation;
  onSelectTrek: (trek: TrekLocation) => void;
  disabled?: boolean;
}

interface SuggestionItem {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  isTrekPreset?: boolean;
  trekObj?: TrekLocation;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  selectedTrek,
  onSelectTrek,
  disabled
}) => {
  const [query, setQuery] = useState(selectedTrek.name);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCitySearchMode, setIsCitySearchMode] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selectedTrek.name);
  }, [selectedTrek.name]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setSuggestions([]);
      setIsCitySearchMode(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const matchingPresets = POPULAR_TREKS.filter(
          (t) =>
            t.name.toLowerCase().includes(query.toLowerCase()) ||
            (t.region && t.region.toLowerCase().includes(query.toLowerCase()))
        ).map((t) => ({
          placeId: t.id,
          name: t.name,
          formattedAddress: `${t.region || ''}, Elevation: ${t.elevation}m`,
          latitude: t.latitude,
          longitude: t.longitude,
          isTrekPreset: true,
          trekObj: t
        }));

        const googlePlaces = await searchPlaces(query);

        const placeSuggestions = googlePlaces.map((p) => ({
          placeId: p.placeId,
          name: p.name,
          formattedAddress: p.formattedAddress,
          latitude: p.latitude,
          longitude: p.longitude,
          isTrekPreset: false,
          trekObj: undefined
        }));

        let combined: SuggestionItem[] = [...matchingPresets];
        placeSuggestions.forEach((gp) => {
          if (!combined.some((c) => c.name.toLowerCase() === gp.name.toLowerCase())) {
            combined.push(gp);
          }
        });

        if (combined.length === 0) {
          const cityResult = await getTreksForCity(query.trim());
          if (cityResult.foundInCity && cityResult.treks.length > 0) {
            setIsCitySearchMode(true);
            combined = cityResult.treks.map((t) => ({
              placeId: t.id,
              name: t.name,
              formattedAddress: `Trek near ${cityResult.cityName} (${t.distanceKm} km away)`,
              latitude: t.latitude,
              longitude: t.longitude,
              isTrekPreset: true,
              trekObj: t
            }));
          }
        }

        setSuggestions(combined.slice(0, 8));
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (item: typeof suggestions[0]) => {
    let trekToSelect: TrekLocation;

    if (item.trekObj) {
      trekToSelect = enrichTrekWithTrailway(item.trekObj);
    } else {
      trekToSelect = enrichTrekWithTrailway({
        id: item.placeId,
        name: item.name,
        region: item.formattedAddress,
        latitude: item.latitude,
        longitude: item.longitude,
        elevation: 1200,
        trailDifficulty: 'Moderate'
      });
    }

    setQuery(item.name);
    setIsOpen(false);
    onSelectTrek(trekToSelect);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div ref={searchBoxRef} className="relative w-full space-y-2">
      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/70 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Target Peak / Trailhead / City
        </span>
        <span className="text-[10px] text-white/40">Geospatial Search</span>
      </label>

      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
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
          placeholder="Search peak (e.g. Kudremukh, Savandurga, Rainier)..."
          className="w-full pl-10 pr-9 py-2.5 bg-black/40 border border-white/10 hover:border-white/20 focus:border-emerald-500 rounded-xl text-xs sm:text-sm font-mono font-medium text-white placeholder-white/30 outline-hidden transition-all shadow-inner"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#111714] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-150">
          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <div
                key={item.placeId}
                onClick={() => handleSelect(item)}
                className="px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-emerald-400">
                    {item.isTrekPreset ? (
                      <Compass className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {item.name}
                    </span>
                    <span className="text-[11px] font-mono text-white/40 line-clamp-1">
                      {item.formattedAddress}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-emerald-400 border border-white/10 shrink-0">
                  {item.isTrekPreset ? 'Route Mapped' : 'Google Place'}
                </span>
              </div>
            ))
          ) : query.trim().length >= 2 && !isSearching ? (
            <div className="px-4 py-6 text-center text-xs font-mono text-white/40">
              No matching peaks found. Try typing a nearby town or mountain ridge.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
