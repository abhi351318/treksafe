/**
 * Google Maps API Loader & Helper Service
 * Uses user-configured Google Maps API Key
 */
import { COMPREHENSIVE_TREKS } from './trekPresets';

export const DEFAULT_GOOGLE_MAPS_KEY = "AIzaSyC0s9MazIsPaeY8HOZa8HoVd2FF9kLthQ4";

let googleMapsPromise: Promise<typeof google> | null = null;
let scriptElement: HTMLScriptElement | null = null;

export function getStoredMapsKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('treksafe_gmaps_key') || DEFAULT_GOOGLE_MAPS_KEY;
  }
  return DEFAULT_GOOGLE_MAPS_KEY;
}

export function setStoredMapsKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('treksafe_gmaps_key', key.trim());
    googleMapsPromise = null;
    if (scriptElement && scriptElement.parentNode) {
      scriptElement.parentNode.removeChild(scriptElement);
      scriptElement = null;
    }
  }
}

export function loadGoogleMaps(apiKey?: string): Promise<typeof google> {
  const key = apiKey || getStoredMapsKey();

  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not available'));
  }

  // Already loaded
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = `__googleMapsCallback_${Date.now()}`;

    // Global callback
    (window as unknown as Record<string, unknown>)[callbackName] = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error('Google Maps script loaded but window.google is undefined'));
      }
    };

    const script = document.createElement('script');
    script.id = 'google-maps-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      key
    )}&libraries=places,geometry&callback=${callbackName}&loading=async`;
    script.async = true;
    script.defer = true;

    script.onerror = (err) => {
      googleMapsPromise = null;
      console.warn('Google Maps JS script error (likely key restriction or network):', err);
      reject(new Error('Failed to load Google Maps script. Check key restrictions or network.'));
    };

    scriptElement = script;
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export const POPULAR_TREKS = COMPREHENSIVE_TREKS;

// Well-known Indian & global city coordinates to ensure instant resolution even if offline
export const KNOWN_CITIES: Record<string, { lat: number; lng: number; name: string; region: string }> = {
  bengaluru: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', region: 'Karnataka, India' },
  bangalore: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', region: 'Karnataka, India' },
  kolar: { lat: 13.1378, lng: 78.1294, name: 'Kolar', region: 'Karnataka, India' },
  chikkaballapur: { lat: 13.4355, lng: 77.7275, name: 'Chikkaballapur', region: 'Karnataka, India' },
  mysore: { lat: 12.2958, lng: 76.6394, name: 'Mysuru', region: 'Karnataka, India' },
  mysuru: { lat: 12.2958, lng: 76.6394, name: 'Mysuru', region: 'Karnataka, India' },
  tumakuru: { lat: 13.3409, lng: 77.1010, name: 'Tumakuru', region: 'Karnataka, India' },
  tumkur: { lat: 13.3409, lng: 77.1010, name: 'Tumakuru', region: 'Karnataka, India' },
  chikkamagaluru: { lat: 13.3153, lng: 75.7754, name: 'Chikkamagaluru', region: 'Karnataka, India' },
  chikmagalur: { lat: 13.3153, lng: 75.7754, name: 'Chikkamagaluru', region: 'Karnataka, India' },
  coorg: { lat: 12.4244, lng: 75.7382, name: 'Madikeri (Coorg)', region: 'Karnataka, India' },
  madikeri: { lat: 12.4244, lng: 75.7382, name: 'Madikeri (Coorg)', region: 'Karnataka, India' },
  dharamshala: { lat: 32.2190, lng: 76.3234, name: 'Dharamshala', region: 'Himachal Pradesh, India' },
  manali: { lat: 32.2432, lng: 77.1892, name: 'Manali', region: 'Himachal Pradesh, India' },
  shimla: { lat: 31.1048, lng: 77.1734, name: 'Shimla', region: 'Himachal Pradesh, India' },
  dehradun: { lat: 30.3165, lng: 78.0322, name: 'Dehradun', region: 'Uttarakhand, India' },
  rishikesh: { lat: 30.0869, lng: 78.2676, name: 'Rishikesh', region: 'Uttarakhand, India' },
  mumbai: { lat: 19.0760, lng: 72.8777, name: 'Mumbai', region: 'Maharashtra, India' },
  pune: { lat: 18.5204, lng: 73.8567, name: 'Pune', region: 'Maharashtra, India' },
  delhi: { lat: 28.6139, lng: 77.2090, name: 'New Delhi', region: 'Delhi, India' },
  seattle: { lat: 47.6062, lng: -122.3321, name: 'Seattle', region: 'Washington, USA' },
  zurich: { lat: 47.3769, lng: 8.5417, name: 'Zurich', region: 'Switzerland' },
  geneva: { lat: 46.2044, lng: 6.1432, name: 'Geneva', region: 'Switzerland' },
  tokyo: { lat: 35.6762, lng: 139.6503, name: 'Tokyo', region: 'Japan' },
  edinburgh: { lat: 55.9533, lng: -3.1883, name: 'Edinburgh', region: 'Scotland, UK' }
};

export async function searchPlaces(query: string): Promise<Array<{
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}>> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim().toLowerCase();

  // 1. Direct match with Known Cities (Instant, 100% reliable)
  for (const [key, city] of Object.entries(KNOWN_CITIES)) {
    if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
      return [{
        placeId: `known_city_${key}`,
        name: city.name,
        formattedAddress: `${city.name}, ${city.region}`,
        latitude: city.lat,
        longitude: city.lng
      }];
    }
  }

  // 2. Direct match with Curated Treks
  const matchedPresets = COMPREHENSIVE_TREKS.filter(
    (t) =>
      t.name.toLowerCase().includes(cleanQuery) ||
      (t.region && t.region.toLowerCase().includes(cleanQuery)) ||
      (t.country && t.country.toLowerCase().includes(cleanQuery))
  ).map((t) => ({
    placeId: `preset_${t.id}`,
    name: t.name,
    formattedAddress: `${t.region || ''}, ${t.country || ''}`,
    latitude: t.latitude,
    longitude: t.longitude
  }));

  if (matchedPresets.length > 0) {
    return matchedPresets;
  }

  // 3. Try Google Maps Geocoder if loaded
  try {
    const googleMaps = await loadGoogleMaps();
    if (googleMaps && googleMaps.maps && googleMaps.maps.Geocoder) {
      const geocoder = new googleMaps.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address: query }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`Geocode failed: ${status}`));
          }
        });
      });

      if (result && result.length > 0) {
        return result.slice(0, 5).map((r) => ({
          placeId: r.place_id,
          name: r.address_components?.[0]?.long_name || r.formatted_address,
          formattedAddress: r.formatted_address,
          latitude: r.geometry.location.lat(),
          longitude: r.geometry.location.lng()
        }));
      }
    }
  } catch (err) {
    console.log('Google Geocoder fallback:', err);
  }

  // 4. Global OpenStreetMap / Nominatim fallback
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=5&addressdetails=1`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          placeId: String(item.place_id),
          name: item.name || item.display_name.split(',')[0],
          formattedAddress: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon)
        }));
      }
    }
  } catch (e) {
    console.warn('Fallback geocoding error:', e);
  }

  return [];
}
