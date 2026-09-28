import React, { useState } from 'react';
import { TrekLocation } from '../types';
import { findTreksNearLocation, calculateDistanceKm } from '../services/trailPathwayService';
import { searchPlaces } from '../services/googleMapsLoader';
import {
  Compass,
  MapPin,
  Navigation,
  Loader2,
  X,
  Mountain,
  Search,
  ArrowRight,
  TrendingUp,
  Map
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
  const [results, setResults] = useState<Array<TrekLocation & { distanceKm: number }>>([]);
  const [currentSearchLabel, setCurrentSearchLabel] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        setCurrentSearchLabel('Your Current GPS Location');
        try {
          const treks = await findTreksNearLocation(latitude, longitude, 'Your Location');
          setResults(treks);
        } catch (err) {
          console.warn('Nearby treks error:', err);
          setErrorMsg('Failed to find nearby treks. Try searching by city name.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation permission error:', err);
        setErrorMsg('Could not retrieve your location. Check browser location permissions or search by city name.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search by city or region name
  const handleSearchCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;

    setErrorMsg(null);
    setIsSearching(true);

    try {
      // Geocode city query
      const places = await searchPlaces(cityInput.trim());
      if (places.length === 0) {
        setErrorMsg(`Could not find coordinates for "${cityInput}". Please try another city or landmark.`);
        setIsSearching(false);
        return;
      }

      const topPlace = places[0];
      setCurrentSearchLabel(topPlace.formattedAddress || topPlace.name);
      const treks = await findTreksNearLocation(
        topPlace.latitude,
        topPlace.longitude,
        topPlace.name
      );
      setResults(treks);
    } catch (err) {
      console.warn('City geocode error:', err);
      setErrorMsg('Failed to locate city. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E4E0D2] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#243B2A] text-[#D7A84A] flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#243B2A] uppercase tracking-wider">
                Find Treks Near City or Location
              </h2>
              <p className="text-xs text-[#526B4F]">
                Discover mountain trails, starting points, and summits closest to you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EAE6D8] text-[#526B4F] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Controls */}
        <div className="p-5 border-b border-[#EAE6D8] bg-[#FAF8F3]/50 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            
            {/* City search input */}
            <form onSubmit={handleSearchCity} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7262]" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter city or hub (e.g. Bangalore, Seattle, Zurich)..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !cityInput.trim()}
                className="px-4 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search</span>
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
            <span className="text-[#6B7262] text-[11px] shrink-0 font-medium">Quick hubs:</span>
            {['Bangalore', 'Dharamshala', 'Seattle', 'Geneva', 'Tokyo', 'Edinburgh'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setCityInput(city);
                  setCurrentSearchLabel(city);
                  searchPlaces(city).then((places) => {
                    if (places.length > 0) {
                      findTreksNearLocation(places[0].latitude, places[0].longitude, city).then(setResults);
                    }
                  });
                }}
                className="px-2.5 py-0.5 rounded-full bg-white border border-[#D5D0C0] text-[#526B4F] hover:text-[#243B2A] hover:border-[#243B2A] text-xs font-medium cursor-pointer shrink-0 transition-colors"
              >
                {city}
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
          {currentSearchLabel && (
            <div className="flex items-center justify-between text-xs text-[#526B4F] border-b border-[#EAE6D8] pb-2">
              <span>
                Treks ordered by distance from <strong>{currentSearchLabel}</strong>:
              </span>
              <span className="font-mono text-[11px]">{results.length} trailheads found</span>
            </div>
          )}

          {results.length === 0 && !isSearching && !isLocating ? (
            <div className="text-center py-12 text-[#6B7262] space-y-2">
              <Compass className="w-8 h-8 mx-auto text-[#D5D0C0]" />
              <p className="font-bold text-sm text-[#243B2A]">Explore Trails Near You</p>
              <p className="text-xs max-w-sm mx-auto text-[#526B4F]">
                Click "My GPS Location" or search for a city to discover mountain summits, trailheads, and complete mapped pathways.
              </p>
            </div>
          ) : (
            results.map((trek) => (
              <div
                key={trek.id}
                className="p-4 rounded-xl border border-[#EAE6D8] hover:border-[#243B2A] transition-all bg-white hover:shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1F2520] group-hover:text-[#243B2A] truncate">
                      {trek.name}
                    </h3>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#FAF8F3] border border-[#D5D0C0] text-[#243B2A] shrink-0">
                      {trek.distanceKm < 1000 ? `${trek.distanceKm} km away` : `${Math.round(trek.distanceKm / 100) * 100} km away`}
                    </span>
                  </div>

                  <p className="text-xs text-[#526B4F] truncate">
                    {trek.region} • Elev: {trek.elevation}m • Difficulty: {trek.trailDifficulty}
                  </p>

                  {trek.startPoint && trek.endPoint && (
                    <div className="text-[11px] text-[#6B7262] flex items-center gap-2 pt-1 font-mono">
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
                          {trek.trailLengthKm} km trail
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
                  <span>Analyze Trail</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E4E0D2] bg-[#FAF8F3] flex justify-end">
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
