import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../services/googleMapsLoader';
import { TrekLocation } from '../types';
import { Mountain, MapPin } from 'lucide-react';

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
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
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
            fillColor: '#DC2626',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        });

        const strokeColor =
          riskScore > 65 ? '#DC2626' : riskScore > 40 ? '#D7A84A' : '#2E5A36';

        pathwayPolylineRef.current = new googleMaps.maps.Polyline({
          path: pathwayCoords,
          geodesic: true,
          strokeColor,
          strokeOpacity: 0.92,
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
    <div className="bg-white border border-[#E4E0D2] rounded-2xl overflow-hidden flex flex-col h-full min-h-[400px] shadow-xs">
      {/* Header */}
      <div className="px-4 py-3 bg-[#FAF8F3] border-b border-[#E4E0D2] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#243B2A]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#243B2A]">
            Trail Topography & Route Map
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#EAE6D8] p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => switchMapType('terrain')}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
              mapType === 'terrain'
                ? 'bg-[#243B2A] text-white shadow-xs'
                : 'text-[#526B4F] hover:text-[#243B2A]'
            }`}
          >
            Terrain
          </button>
          <button
            type="button"
            onClick={() => switchMapType('satellite')}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
              mapType === 'satellite'
                ? 'bg-[#243B2A] text-white shadow-xs'
                : 'text-[#526B4F] hover:text-[#243B2A]'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => switchMapType('roadmap')}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
              mapType === 'roadmap'
                ? 'bg-[#243B2A] text-white shadow-xs'
                : 'text-[#526B4F] hover:text-[#243B2A]'
            }`}
          >
            Road
          </button>
        </div>
      </div>

      {/* Map View Canvas */}
      <div className="relative flex-1 w-full bg-[#EAE6D8]">
        <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" />

        {loadError && (
          <div className="absolute inset-0 bg-[#FAF8F3]/95 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#243B2A] text-[#D7A84A] flex items-center justify-center mb-1">
              <Mountain className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-[#243B2A]">
              Map Preview Unavailable
            </span>
            <p className="text-xs text-[#526B4F] max-w-sm">
              Coordinates: {trek.latitude.toFixed(4)}° N, {trek.longitude.toFixed(4)}° E. Check your Google Maps API key in Settings.
            </p>
          </div>
        )}

        {/* Trailhead & Summit Overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs border border-[#E4E0D2] rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-[#1F2520]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            <span className="font-medium">Start: {trek.startPoint?.name || 'Base Trailhead'}</span>
          </div>
          <div className="flex items-center gap-2 text-[#1F2520]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
            <span className="font-medium">
              Summit: {trek.endPoint?.name || trek.name} ({trek.elevation || 1200}m)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
