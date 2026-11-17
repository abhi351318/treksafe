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

const QUICK_POPULAR_NAMES = [
  'Nandi Hills Trail',
  'Skandagiri (Kalavara Durga)',
  'Antargange Cave Trek',
  'Savandurga Monolith Trek',
  'Makalidurga Fort Trek',
  'Kudremukh Peak',
  'Triund Hill Trek'
];

export const LocationSearch: React.FC<LocationSearchProps> = ({
  selectedTrek,
  onSelectTrek,
  disabled
}) => {
  const [query, setQuery] = useState(selectedTrek.name);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [cityMatchBanner, setCityMatchBanner] = useState<string | null>(null);
  const [noCityMatchFallback, setNoCityMatchFallback] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
      setCityMatchBanner(null);
      setNoCityMatchFallback(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setCityMatchBanner(null);
      setNoCityMatchFallback(false);
      try {
        const cleanQ = query.trim().toLowerCase();

        // 1. Direct matching presets
        const matchingPresets: SuggestionItem[] = POPULAR_TREKS.filter(
          (t) =>
            t.name.toLowerCase().includes(cleanQ) ||
            (t.region && t.region.toLowerCase().includes(cleanQ))
        ).map((t) => ({
          placeId: t.id,
          name: t.name,
          formattedAddress: `${t.region || ''} · Elevation ${t.elevation || 1200}m`,
          latitude: t.latitude,
          longitude: t.longitude,
          isTrekPreset: true,
          trekObj: t
        }));

        // 2. City-based match
        const cityResult = await getTreksForCity(query.trim());
        let combined: SuggestionItem[] = [...matchingPresets];

        if (cityResult.foundInCity && cityResult.treks.length > 0) {
          setCityMatchBanner(cityResult.cityName);
          cityResult.treks.forEach((t) => {
            if (!combined.some((c) => c.name.toLowerCase() === t.name.toLowerCase())) {
              combined.push({
                placeId: t.id,
                name: t.name,
                formattedAddress: t.distanceKm
                  ? `Near ${cityResult.cityName} (${t.distanceKm} km away) · ${t.elevation || 1100}m`
                  : `${t.region || cityResult.cityName} · ${t.elevation || 1100}m`,
                latitude: t.latitude,
                longitude: t.longitude,
                isTrekPreset: true,
                trekObj: t
              });
            }
          });
        }

        // 3. Google / Nominatim place search
        if (combined.length < 4) {
          const googlePlaces = await searchPlaces(query);
          googlePlaces.forEach((p) => {
            if (!combined.some((c) => c.name.toLowerCase() === p.name.toLowerCase())) {
              combined.push({
                placeId: p.placeId,
                name: p.name,
                formattedAddress: p.formattedAddress,
                latitude: p.latitude,
                longitude: p.longitude,
                isTrekPreset: false,
                trekObj: undefined
              });
            }
          });
        }

        if (combined.length === 0) {
          setNoCityMatchFallback(true);
        }

        setSuggestions(combined.slice(0, 8));
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (item: SuggestionItem) => {
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

  const handleQuickSelect = (trek: TrekLocation) => {
    const enriched = enrichTrekWithTrailway(trek);
    setQuery(enriched.name);
    setIsOpen(false);
    onSelectTrek(enriched);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setCityMatchBanner(null);
    setNoCityMatchFallback(false);
    setIsOpen(true);
  };

  const quickPillTreks = QUICK_POPULAR_NAMES.map((name) =>
    POPULAR_TREKS.find((t) => t.name === name)
  ).filter((t): t is TrekLocation => Boolean(t));

  return (
    <div ref={searchBoxRef} className="relative w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#243B2A] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#526B4F]" />
          Trek Location, Peak or City
        </label>
        <span className="text-[11px] text-[#6B7262]">
          Search trail or city name
        </span>
      </div>

      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7262]">
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
          placeholder="Enter city or trail name (e.g. Bengaluru, Kolar, Kudremukh)..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#D5D0C0] hover:border-[#A9A392] focus:border-[#243B2A] focus:ring-2 focus:ring-[#243B2A]/10 rounded-xl text-sm text-[#1F2520] placeholder-[#8C8675] outline-hidden transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C8675] hover:text-[#243B2A] transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Popular Quick Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-1">
        <span className="text-[11px] font-medium text-[#6B7262] shrink-0 mr-0.5">Popular:</span>
        {quickPillTreks.map((t) => {
          const isActive = selectedTrek.id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              disabled={disabled}
              onClick={() => handleQuickSelect(t)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[#243B2A] text-white border-[#243B2A] shadow-xs'
                  : 'bg-[#FAF8F3] text-[#526B4F] border-[#E4E0D2] hover:bg-[#EAE6D8] hover:text-[#243B2A]'
              }`}
            >
              {t.name.replace(' Trail', '').replace(' Trek', '')}
            </button>
          );
        })}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[68px] bg-white border border-[#D5D0C0] rounded-2xl shadow-xl z-50 overflow-hidden max-h-[380px] overflow-y-auto animate-in fade-in duration-150">
          {cityMatchBanner && suggestions.length > 0 && (
            <div className="px-4 py-2 bg-[#FAF8F3] border-b border-[#E4E0D2] text-xs font-medium text-[#243B2A] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#526B4F]" />
              <span>Trails located in or near {cityMatchBanner}:</span>
            </div>
          )}

          {suggestions.length > 0 ? (
            <div className="divide-y divide-[#F0EDE3]">
              {suggestions.map((item) => (
                <button
                  key={item.placeId}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-3 hover:bg-[#FAF8F3] transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#526B4F]/10 text-[#243B2A] flex items-center justify-center shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#1F2520] block truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-[#6B7262] block truncate">
                        {item.formattedAddress}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF8F3] text-[#526B4F] border border-[#E4E0D2] shrink-0">
                    {item.isTrekPreset ? 'Trail' : 'Place'}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {noCityMatchFallback && query.trim().length >= 2 && !isSearching && (
                <div className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E4E0D2] text-xs text-[#526B4F]">
                  No specific trails recorded in "{query.trim()}" — showing popular mountain trails below.
                </div>
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#6B7262] mb-2">
                  Popular Trekking Places
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {POPULAR_TREKS.slice(0, 8).map((trek) => (
                    <button
                      key={trek.id}
                      type="button"
                      onClick={() => handleQuickSelect(trek)}
                      className="text-left p-2.5 rounded-xl border border-[#E4E0D2] hover:border-[#243B2A] hover:bg-[#FAF8F3] transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-[#243B2A] truncate">{trek.name}</div>
                      <div className="text-[11px] text-[#6B7262] truncate">
                        {trek.region} · {trek.elevation}m
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
