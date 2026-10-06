import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../services/googleMapsLoader';
import { TrekLocation } from '../types';
import { Layers, Mountain, Route } from 'lucide-react';

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

        if (startMarkerRef.current) startMarkerRef.current.setMap(null);
        if (endMarkerRef.current) endMarkerRef.current.setMap(null);
        if (pathwayPolylineRef.current) pathwayPolylineRef.current.setMap(null);

        startMarkerRef.current = new googleMaps.maps.Marker({
          position: startCoords,
          map,
          title: `Start: ${trek.startPoint?.name || 'Trailhead'}`,
          icon: {
            path: googleMaps.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#F97316',
            fillOpacity: 1,
            strokeColor: '#000000',
            strokeWeight: 2
          }
        });

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

        const strokeColor = riskScore > 65 ? '#EF4444' : riskScore > 40 ? '#F59E0B' : '#F97316';

        pathwayPolylineRef.current = new googleMaps.maps.Polyline({
          path: pathwayCoords,
          geodesic: true,
          strokeColor,
          strokeOpacity: 0.95,
          strokeWeight: 4,
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
    <div className="bg-[#0F1420] border border-white/10 flex flex-col h-full min-h-[400px]">
      {/* Top Map Header */}
      <div className="px-4 py-3 bg-[#141B2B] border-b border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-500"></span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">
            TOPOGRAPHIC ORBITAL RECONNAISSANCE
          </span>
        </div>

        {/* Layer Selectors */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 border border-white/10 text-[9px] font-mono">
          <button
            type="button"
            onClick={() => switchMapType('terrain')}
            className={`px-2.5 py-1 cursor-pointer transition-colors ${
              mapType === 'terrain'
                ? 'bg-orange-500 text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            TERRAIN
          </button>
          <button
            type="button"
            onClick={() => switchMapType('satellite')}
            className={`px-2.5 py-1 cursor-pointer transition-colors ${
              mapType === 'satellite'
                ? 'bg-orange-500 text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            SATELLITE
          </button>
          <button
            type="button"
            onClick={() => switchMapType('roadmap')}
            className={`px-2.5 py-1 cursor-pointer transition-colors ${
              mapType === 'roadmap'
                ? 'bg-orange-500 text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            HYBRID
          </button>
        </div>
      </div>

      {/* Map View Canvas */}
      <div className="relative flex-1 w-full bg-[#080B12]">
        <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" />

        {loadError && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center text-white space-y-2">
            <Mountain className="w-10 h-10 text-orange-400 mb-1" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-orange-400">
              VECTOR SATELLITE FEED STANDBY
            </span>
            <p className="text-xs text-white/50 max-w-sm font-mono">
              Coordinates: {trek.latitude.toFixed(4)}° N, {trek.longitude.toFixed(4)}° E. Check Google Maps API Key in configuration.
            </p>
          </div>
        )}

        {/* Trailway Coordinates Bar */}
        <div className="absolute bottom-3 left-3 right-3 bg-[#0E131E]/90 border border-white/10 p-2.5 flex items-center justify-between text-[10px] font-mono text-white/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500"></span>
            <span>TRAILHEAD: {trek.startPoint?.name || 'Base Camp'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500"></span>
            <span>SUMMIT: {trek.endPoint?.name || trek.name} ({trek.elevation}m)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
