import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../services/googleMapsLoader';
import { TrekLocation } from '../types';
import { MapPin, Mountain, Flag, Compass, Route, Layers } from 'lucide-react';

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

        // Bounds to frame entire trail path with padding
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

          // 1. Starting Point Marker (Trailhead - Emerald Green Pin)
          const startMarker = new googleMaps.maps.Marker({
            position: startCoords,
            map,
            title: trek.startPoint ? `Start: ${trek.startPoint.name}` : `${trek.name} Trailhead`,
            label: {
              text: 'S',
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: '11px'
            },
            icon: {
              path: googleMaps.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#16A34A', // Green
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2.5
            }
          });

          // 2. Ending Point Marker (Summit - Red / Gold Flag Marker)
          const endMarker = new googleMaps.maps.Marker({
            position: endCoords,
            map,
            title: trek.endPoint ? `Summit: ${trek.endPoint.name}` : `${trek.name} Summit`,
            label: {
              text: 'E',
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: '11px'
            },
            icon: {
              path: googleMaps.maps.SymbolPath.CIRCLE,
              scale: 11,
              fillColor: '#DC2626', // Red
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2.5
            }
          });

          // 3. Pathway Polyline Line describing the trail route
          const polylineColor = riskScore > 60 ? '#DC2626' : riskScore > 40 ? '#D97706' : '#243B2A';
          const polyline = new googleMaps.maps.Polyline({
            path: pathwayCoords,
            geodesic: true,
            strokeColor: polylineColor,
            strokeOpacity: 0.88,
            strokeWeight: 4.5,
            map
          });

          // 4. Perimeter safety buffer around the summit
          const circle = new googleMaps.maps.Circle({
            map,
            center: endCoords,
            radius: 2000,
            fillColor: polylineColor,
            fillOpacity: 0.08,
            strokeColor: polylineColor,
            strokeOpacity: 0.35,
            strokeWeight: 1.5
          });

          // Info Windows
          const startInfoWindow = new googleMaps.maps.InfoWindow({
            content: `
              <div style="font-family: inherit; padding: 6px; font-size: 12px; color: #1F2520;">
                <strong style="color: #16A34A; display: block; font-size: 13px;">Trailhead Start Point</strong>
                <span style="font-weight: 600;">${trek.startPoint?.name || 'Base Entrance'}</span>
                <div style="color: #526B4F; margin-top: 2px;">Elevation: ${trek.startPoint?.elevation || 'Base'}m</div>
              </div>
            `
          });

          const endInfoWindow = new googleMaps.maps.InfoWindow({
            content: `
              <div style="font-family: inherit; padding: 6px; font-size: 12px; color: #1F2520;">
                <strong style="color: #DC2626; display: block; font-size: 13px;">Trail Destination / Summit</strong>
                <span style="font-weight: 600;">${trek.endPoint?.name || trek.name}</span>
                <div style="color: #526B4F; margin-top: 2px;">Summit: ${trek.elevation || 1500}m</div>
                <div style="margin-top: 4px; font-weight: bold; color: ${riskScore > 60 ? '#b91c1c' : '#15803d'};">
                  Risk Score: ${riskScore}/100
                </div>
              </div>
            `
          });

          startMarker.addListener('click', () => startInfoWindow.open(map, startMarker));
          endMarker.addListener('click', () => endInfoWindow.open(map, endMarker));

          map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });

          mapInstanceRef.current = map;
          startMarkerRef.current = startMarker;
          endMarkerRef.current = endMarker;
          pathwayPolylineRef.current = polyline;
          circleRef.current = circle;
        } else {
          // Update existing markers, pathway line, and camera bounds
          const map = mapInstanceRef.current;
          startMarkerRef.current?.setPosition(startCoords);
          endMarkerRef.current?.setPosition(endCoords);

          const polylineColor = riskScore > 60 ? '#DC2626' : riskScore > 40 ? '#D97706' : '#243B2A';
          pathwayPolylineRef.current?.setPath(pathwayCoords);
          pathwayPolylineRef.current?.setOptions({ strokeColor: polylineColor });

          circleRef.current?.setCenter(endCoords);
          circleRef.current?.setOptions({ fillColor: polylineColor, strokeColor: polylineColor });

          map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
        }
      } catch (err: any) {
        console.warn('Google Map loading notice:', err);
        if (isMounted) {
          setLoadError(err.message || 'Could not load Google Maps');
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [trek.latitude, trek.longitude, trek.name, trek.elevation, trek.startPoint, trek.endPoint, trek.pathway, riskScore]);

  const handleMapTypeChange = (type: 'terrain' | 'satellite' | 'roadmap') => {
    setMapType(type);
    if (mapInstanceRef.current && window.google?.maps) {
      const typeMap = {
        terrain: window.google.maps.MapTypeId.TERRAIN,
        satellite: window.google.maps.MapTypeId.HYBRID,
        roadmap: window.google.maps.MapTypeId.ROADMAP
      };
      mapInstanceRef.current.setMapTypeId(typeMap[type]);
    }
  };

  return (
    <div className="bg-white border border-[#E4E0D2] rounded-2xl overflow-hidden shadow-xs relative">
      {/* Top Map Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#FAF8F3] border-b border-[#E4E0D2]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#243B2A]/10 text-[#243B2A] flex items-center justify-center">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#243B2A] uppercase tracking-wider">
                Geospatial Trail Route & Pathway
              </h3>
              {trek.trailLengthKm && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#D5D0C0] text-[#526B4F]">
                  {trek.trailLengthKm} km route
                </span>
              )}
            </div>
            <p className="text-xs text-[#526B4F] truncate max-w-xs sm:max-w-md">
              {trek.startPoint?.name || 'Trailhead'} → {trek.endPoint?.name || trek.name}
            </p>
          </div>
        </div>

        {/* Map Type Controls */}
        <div className="flex items-center bg-[#EBE7DC] p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => handleMapTypeChange('terrain')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mapType === 'terrain'
                ? 'bg-white text-[#243B2A] font-semibold shadow-xs'
                : 'text-[#526B4F] hover:text-[#1F2520]'
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => handleMapTypeChange('satellite')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mapType === 'satellite'
                ? 'bg-white text-[#243B2A] font-semibold shadow-xs'
                : 'text-[#526B4F] hover:text-[#1F2520]'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => handleMapTypeChange('roadmap')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mapType === 'roadmap'
                ? 'bg-white text-[#243B2A] font-semibold shadow-xs'
                : 'text-[#526B4F] hover:text-[#1F2520]'
            }`}
          >
            Roads
          </button>
        </div>
      </div>

      {/* Map Viewport Canvas */}
      <div className="relative w-full h-[340px] sm:h-[400px] bg-[#E8E4D8]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Fallback View */}
        {loadError && (
          <div className="absolute inset-0 bg-[#F4F1E6] flex flex-col items-center justify-center p-6 text-center z-10">
            <Compass className="w-8 h-8 text-[#D7A84A] mb-2 animate-pulse" />
            <h4 className="text-sm font-bold text-[#243B2A] mb-1">
              {trek.name} Trail Route
            </h4>
            <p className="text-xs text-[#526B4F] max-w-sm mb-3">
              Start: {trek.startPoint?.name || 'Base'} • End: {trek.endPoint?.name || 'Summit'}
            </p>
          </div>
        )}

        {/* Interactive Pathway Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-[#E4E0D2] rounded-xl px-3 py-2 shadow-xs flex flex-wrap items-center gap-3 z-10 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#1F2520]">
            <span className="w-3 h-3 rounded-full bg-[#16A34A] text-[9px] text-white flex items-center justify-center">S</span>
            <span>Start: {trek.startPoint?.name || 'Trailhead'}</span>
          </div>
          <div className="h-3 w-px bg-[#E4E0D2]"></div>
          <div className="flex items-center gap-1.5 font-bold text-[#1F2520]">
            <span className="w-3 h-3 rounded-full bg-[#DC2626] text-[9px] text-white flex items-center justify-center">E</span>
            <span>End: {trek.endPoint?.name || 'Summit'}</span>
          </div>
          <div className="h-3 w-px bg-[#E4E0D2]"></div>
          <div className="flex items-center gap-1.5 font-medium text-[#526B4F]">
            <span className="w-4 h-1 bg-[#243B2A] rounded-full inline-block"></span>
            <span>Pathway Line</span>
          </div>
        </div>
      </div>
    </div>
  );
};
