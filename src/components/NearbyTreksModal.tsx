import React, { useState, useEffect } from 'react';
import { TrekLocation } from '../types';
import { getTreksForCity } from '../services/cityTrekService';
import { findTreksNearLocation } from '../services/trailPathwayService';
import {
  Compass,
  MapPin,
  Navigation,
  Loader2,
  X,
  Mountain,
  Search,
  Route,
  Map,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface NearbyTreksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrek: (trek: TrekLocation) => void;
}

export const NearbyTreksModal: React.FC<NearbyTreksModalProps> = ({
  isOpen,
  onClose,
  onSelectTrek
}) => {
  const [cityInput, setCityInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Array<TrekLocation & { distanceKm?: number }>>([]);
  const [currentCityLabel, setCurrentCityLabel] = useState<string>('Bengaluru');
  const [isFallbackToPopular, setIsFallbackToPopular] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Bengaluru and surrounding treks by default when modal opens
  useEffect(() => {
    if (isOpen && results.length === 0) {
      handleQueryCity('Bengaluru');
    }
  }, [isOpen]);

  const handleQueryCity = async (cityName: string) => {
    if (!cityName.trim()) return;
    setIsSearching(true);
    setErrorMsg(null);
    setCurrentCityLabel(cityName);

    try {
      const res = await getTreksForCity(cityName);
      setResults(res.treks);
      setIsFallbackToPopular(!res.foundInCity);
    } catch (err: any) {
      console.warn('Error finding treks for city:', err);
      setErrorMsg('Could not find treks. Displaying popular trails instead.');
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  // Use browser geolocation to find treks near user's GPS
  const handleUseCurrentLocation = () => {
    setErrorMsg(null);
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCityLabel('Your GPS Location');
        try {
          const treks = await findTreksNearLocation(latitude, longitude, 'Your GPS');
          setResults(treks);
          setIsFallbackToPopular(false);
        } catch (err) {
          console.warn('Nearby treks error:', err);
          setErrorMsg('Failed to find nearby treks. Displaying popular trails.');
          handleQueryCity('Bengaluru');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation permission error:', err);
        setErrorMsg('Location permission denied or timed out. Type a city name (e.g. Bengaluru, Kolar).');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      handleQueryCity(cityInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E4E0D2] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#243B2A] text-[#D7A84A] flex items-center justify-center shadow-xs">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#243B2A] uppercase tracking-wider">
                Find Mountain Treks by City
              </h2>
              <p className="text-xs text-[#526B4F]">
                Enter any city name to get popular local trek places
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EAE6D8] text-[#526B4F] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Controls */}
        <div className="p-5 border-b border-[#EAE6D8] bg-[#FAF8F3]/50 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            
            {/* City search input */}
            <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7262]" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter city name (e.g. Bengaluru, Kolar, Coorg, Seattle)..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !cityInput.trim()}
                className="px-4 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Find Treks</span>
              </button>
            </form>

            {/* GPS Locate Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="px-3.5 py-2 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#243B2A] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#243B2A]" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-[#526B4F]" />
              )}
              <span>My GPS Location</span>
            </button>

          </div>

          {/* Quick city suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[#6B7262] text-[11px] shrink-0 font-medium">Quick cities:</span>
            {[
              'Bengaluru',
              'Kolar',
              'Chikkamagaluru',
              'Coorg',
              'Dharamshala',
              'Seattle',
              'Zurich'
            ].map((cityName) => (
              <button
                key={cityName}
                type="button"
                onClick={() => {
                  setCityInput(cityName);
                  handleQueryCity(cityName);
                }}
                className={`px-2.5 py-1 rounded-full border text-xs font-medium cursor-pointer shrink-0 transition-all ${
                  currentCityLabel.toLowerCase() === cityName.toLowerCase()
                    ? 'bg-[#243B2A] text-white border-[#243B2A]'
                    : 'bg-white border-[#D5D0C0] text-[#526B4F] hover:text-[#243B2A] hover:border-[#243B2A]'
                }`}
              >
                {cityName}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Proximity / Fallback Banner */}
          {isFallbackToPopular ? (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>No direct trails recorded in "{currentCityLabel}".</strong>
                <p className="text-[#526B4F] text-[11px] mt-0.5">
                  Displaying top popular mountain trails you can explore instead:
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-[#526B4F] border-b border-[#EAE6D8] pb-2">
              <span>
                Popular trekking places in or near <strong>{currentCityLabel}</strong>:
              </span>
              <span className="font-mono text-[11px] font-bold text-[#243B2A]">
                {results.length} trails available
              </span>
            </div>
          )}

          {isSearching || isLocating ? (
            <div className="text-center py-12 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#243B2A] mx-auto" />
              <p className="text-xs text-[#526B4F]">Finding mountain trails for {currentCityLabel}...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-[#6B7262] space-y-2">
              <Compass className="w-8 h-8 mx-auto text-[#D5D0C0]" />
              <p className="font-bold text-sm text-[#243B2A]">No Trails Found</p>
              <p className="text-xs max-w-sm mx-auto text-[#526B4F]">
                Try selecting "Bengaluru" or "Kolar" above to see popular trekking destinations.
              </p>
            </div>
          ) : (
            results.map((trek) => (
              <div
                key={trek.id}
                className="p-4 rounded-xl border border-[#EAE6D8] hover:border-[#243B2A] transition-all bg-white hover:shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-[#1F2520] group-hover:text-[#243B2A]">
                      {trek.name}
                    </h3>
                    {trek.distanceKm !== undefined && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#FAF8F3] border border-[#D5D0C0] text-[#243B2A] shrink-0">
                        {trek.distanceKm <= 5 ? 'In the area' : `${trek.distanceKm} km away`}
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-sm bg-[#526B4F]/15 text-[#243B2A]">
                      {trek.trailDifficulty}
                    </span>
                  </div>

                  <p className="text-xs text-[#526B4F] line-clamp-1">
                    {trek.region} • Elevation ~{trek.elevation}m
                  </p>

                  {trek.startPoint && trek.endPoint && (
                    <div className="text-[11px] text-[#6B7262] flex items-center gap-2 pt-1 font-mono flex-wrap">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        {trek.startPoint.name}
                      </span>
                      <span>→</span>
                      <span className="flex items-center gap-1 text-red-700">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        {trek.endPoint.name}
                      </span>
                      {trek.trailLengthKm && (
                        <span className="text-[#8C8675] border-l border-[#EAE6D8] pl-2">
                          {trek.trailLengthKm} km route
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTrek(trek);
                    onClose();
                  }}
                  className="px-3.5 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
                >
                  <Map className="w-3.5 h-3.5 text-[#D7A84A]" />
                  <span>Analyze Trek</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E4E0D2] bg-[#FAF8F3] flex justify-between items-center text-xs text-[#6B7262]">
          <span>Select any trail to inspect weather hazards, map route, and gear checklist.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
