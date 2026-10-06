import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../services/googleMapsLoader';
import { TrekLocation } from '../types';
import { MapPin, Mountain, Flag, Compass, Route, Layers, Maximize2 } from 'lucide-react';

interface MapViewProps {
  trek: TrekLocation;
  riskScore: number;
}

export const MapView: React.FC<MapViewProps> = ({ trek, riskScore }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const startMarkerRef = useRef<google.maps.Marker | null>(null);
  const endMarkerRef = useRef<google.maps.Marker | null>(null);
  const pathwayPolylineRef = useRef<google.maps.Polyline | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'terrain' | 'satellite' | 'roadmap'>('terrain');

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      try {
        setLoadError(null);
        const googleMaps = await loadGoogleMaps();
        if (!isMounted || !googleMaps || !googleMaps.maps) return;

        const startCoords = trek.startPoint
          ? { lat: trek.startPoint.latitude, lng: trek.startPoint.longitude }
          : { lat: trek.latitude - 0.02, lng: trek.longitude - 0.02 };

        const endCoords = trek.endPoint
          ? { lat: trek.endPoint.latitude, lng: trek.endPoint.longitude }
          : { lat: trek.latitude, lng: trek.longitude };

        const pathwayCoords =
          trek.pathway && trek.pathway.length > 0
            ? trek.pathway
            : [startCoords, endCoords];

        const bounds = new googleMaps.maps.LatLngBounds();
        pathwayCoords.forEach((p) => bounds.extend(p));

        if (!mapInstanceRef.current) {
          const map = new googleMaps.maps.Map(mapContainerRef.current, {
            center: endCoords,
            zoom: 13,
            mapTypeId: googleMaps.maps.MapTypeId.TERRAIN,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true
          });

          mapInstanceRef.current = map;
        } else {
          mapInstanceRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
        }

        const map = mapInstanceRef.current;

        // Clear existing markers & paths
        if (startMarkerRef.current) startMarkerRef.current.setMap(null);
        if (endMarkerRef.current) endMarkerRef.current.setMap(null);
        if (pathwayPolylineRef.current) pathwayPolylineRef.current.setMap(null);
        if (circleRef.current) circleRef.current.setMap(null);

        // Render Start Marker
        startMarkerRef.current = new googleMaps.maps.Marker({
          position: startCoords,
          map,
          title: `Start: ${trek.startPoint?.name || 'Trailhead'}`,
          icon: {
            path: googleMaps.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2.5
          }
        });

        // Render Summit Marker
        endMarkerRef.current = new googleMaps.maps.Marker({
          position: endCoords,
          map,
          title: `Summit: ${trek.endPoint?.name || trek.name}`,
          icon: {
            path: googleMaps.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        });

        // Dynamic trail glow based on risk score
        const pathStrokeColor = riskScore > 65 ? '#EF4444' : riskScore > 40 ? '#F59E0B' : '#10B981';

        // Render Pathway Polyline
        pathwayPolylineRef.current = new googleMaps.maps.Polyline({
          path: pathwayCoords,
          geodesic: true,
          strokeColor: pathStrokeColor,
          strokeOpacity: 0.9,
          strokeWeight: 5,
          map
        });

        map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      } catch (err: any) {
        if (isMounted) {
          setLoadError(err.message || 'Google Maps service unavailable');
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [trek, riskScore]);

  const switchMapType = (type: 'terrain' | 'satellite' | 'roadmap') => {
    setMapType(type);
    if (!mapInstanceRef.current) return;
    const gmaps = (window as any).google?.maps;
    if (!gmaps) return;

    if (type === 'satellite') {
      mapInstanceRef.current.setMapTypeId(gmaps.MapTypeId.HYBRID);
    } else if (type === 'roadmap') {
      mapInstanceRef.current.setMapTypeId(gmaps.MapTypeId.ROADMAP);
    } else {
      mapInstanceRef.current.setMapTypeId(gmaps.MapTypeId.TERRAIN);
    }
  };

  return (
    <div className="bg-[#111714] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[380px] sm:min-h-[440px]">
      {/* Top Map Header / Layer Toggles */}
      <div className="px-4 py-3 bg-[#151D18] border-b border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-emerald-400" />
            Topographic Trailway Vector
          </h3>
        </div>

        {/* Layer Selectors */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => switchMapType('terrain')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              mapType === 'terrain'
                ? 'bg-emerald-500 text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Terrain
          </button>
          <button
            type="button"
            onClick={() => switchMapType('satellite')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              mapType === 'satellite'
                ? 'bg-emerald-500 text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => switchMapType('roadmap')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              mapType === 'roadmap'
                ? 'bg-emerald-500 text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Roadmap
          </button>
        </div>
      </div>

      {/* Map View Canvas */}
      <div className="relative flex-1 w-full bg-[#0B0F0D]">
        <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" />

        {loadError && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-2">
            <Mountain className="w-10 h-10 text-emerald-400/80 mb-1" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Interactive Topo Map Standby
            </span>
            <p className="text-xs text-white/60 max-w-sm">
              Coordinates: {trek.latitude.toFixed(4)}° N, {trek.longitude.toFixed(4)}° E. Check Google Maps API Key in configuration.
            </p>
          </div>
        )}

        {/* Trailway Elevation Overlay Strip */}
        <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-mono text-white/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Trailhead: {trek.startPoint?.name || 'Base Camp'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Summit: {trek.endPoint?.name || trek.name} ({trek.elevation}m)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
