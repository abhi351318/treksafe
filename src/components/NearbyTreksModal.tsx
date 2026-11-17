import React, { useState } from 'react';
import { COMPREHENSIVE_TREKS } from '../services/trekPresets';
import { getTreksForCity } from '../services/cityTrekService';
import { findTreksNearLocation } from '../services/trailPathwayService';
import { TrekLocation } from '../types';
import { X, ChevronRight, Compass, MapPin, Navigation, Search, Loader2 } from 'lucide-react';

interface NearbyTreksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrek: (trek: TrekLocation) => void;
}

const QUICK_CITIES = ['Bengaluru', 'Kolar', 'Chikkamagaluru', 'Coorg', 'Dharamshala', 'Seattle'];

export const NearbyTreksModal: React.FC<NearbyTreksModalProps> = ({
  isOpen,
  onClose,
  onSelectTrek
}) => {
  const [cityQuery, setCityQuery] = useState('');
  const [activeLabel, setActiveLabel] = useState('All Popular Mountain Treks');
  const [treks, setTreks] = useState<Array<TrekLocation & { distanceKm?: number }>>(COMPREHENSIVE_TREKS);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCitySearch = async (city: string) => {
    if (!city.trim()) return;
    setIsSearching(true);
    setNotice(null);
    try {
      const result = await getTreksForCity(city.trim());
      setTreks(result.treks);
      if (result.foundInCity) {
        setActiveLabel(`Treks near ${result.cityName}`);
      } else {
        setActiveLabel('Popular Mountain Treks');
        setNotice(`No specific treks found near "${city.trim()}". Showing popular mountain treks.`);
      }
    } catch (err) {
      console.warn('City search error:', err);
      setTreks(COMPREHENSIVE_TREKS.slice(0, 8));
      setNotice('Could not complete city search. Showing popular treks.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseMyGPS = () => {
    if (!navigator.geolocation) {
      setNotice('Geolocation is not supported in this browser.');
      return;
    }

    setIsLocating(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const nearby = await findTreksNearLocation(
            pos.coords.latitude,
            pos.coords.longitude,
            'Your Location'
          );
          setTreks(nearby);
          setActiveLabel('Treks Nearest to Your GPS Location');
        } catch (err) {
          console.warn('Nearby GPS error:', err);
          setNotice('Unable to load GPS-based trails. Showing popular treks.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setNotice('Location access unavailable. Try selecting or typing a city below.');
        setIsLocating(false);
      },
      { timeout: 6000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E4E0D2] rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#243B2A] text-[#D7A84A] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#243B2A]">
                Find Treks Near Any City
              </h2>
              <p className="text-xs text-[#526B4F]">
                Search a city, use GPS coordinates, or browse curated mountain trails
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EAE6D8] text-[#526B4F] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & GPS Controls */}
        <div className="p-4 sm:p-5 border-b border-[#EAE6D8] bg-[#FAF8F3]/60 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCitySearch(cityQuery);
              }}
              className="flex-1 flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C8675] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="Enter city name (e.g. Bengaluru, Kolar, Manali)..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-sm text-[#1F2520] placeholder-[#8C8675] outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !cityQuery.trim()}
                className="px-4 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {isSearching ? 'Searching...' : 'Search City'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleUseMyGPS}
              disabled={isLocating}
              className="px-4 py-2 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#243B2A] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-[#526B4F]" />
              )}
              <span>My GPS Location</span>
            </button>
          </div>

          {/* Quick Cities */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-[11px] font-medium text-[#6B7262] shrink-0 mr-1">
              Quick cities:
            </span>
            {QUICK_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setCityQuery(city);
                  handleCitySearch(city);
                }}
                className="px-3 py-1 rounded-full bg-white hover:bg-[#243B2A] hover:text-white border border-[#E4E0D2] text-xs font-medium text-[#526B4F] transition-colors shrink-0 cursor-pointer"
              >
                {city}
              </button>
            ))}
          </div>

          {notice && (
            <div className="p-2.5 rounded-xl bg-[#FDF8E8] border border-[#EEDCA8] text-xs text-[#8C6414]">
              {notice}
            </div>
          )}
        </div>

        {/* Trail Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526B4F]">
              {activeLabel}
            </span>
            <span className="text-xs text-[#6B7262] tabular-nums">
              {treks.length} trails
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {treks.map((trek) => (
              <button
                key={trek.id}
                type="button"
                onClick={() => {
                  onSelectTrek(trek);
                  onClose();
                }}
                className="text-left p-4 rounded-xl border border-[#E4E0D2] hover:border-[#243B2A] bg-[#FAF8F3] hover:bg-white transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#243B2A] font-semibold">
                      {trek.trailDifficulty || 'Moderate'}
                    </span>
                    <span className="text-[#6B7262] tabular-nums">
                      {trek.distanceKm !== undefined
                        ? `${trek.distanceKm} km away · ${trek.elevation || 1200}m`
                        : `${trek.elevation || 1200}m elev`}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1F2520] group-hover:text-[#243B2A] transition-colors">
                    {trek.name}
                  </h4>
                  <p className="text-xs text-[#6B7262] line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#526B4F] shrink-0" />
                    <span>{trek.region}</span>
                  </p>
                  {trek.startPoint && trek.endPoint && (
                    <p className="text-[11px] text-[#526B4F] line-clamp-1">
                      {trek.startPoint.name} → {trek.endPoint.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#EAE6D8] text-xs">
                  <span className="text-[#6B7262] tabular-nums">
                    {trek.trailLengthKm ? `${trek.trailLengthKm} km route` : 'Summit ascent'}
                  </span>
                  <span className="text-[#243B2A] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                    Select Trail <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
