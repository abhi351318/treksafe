/**
 * Google Maps API Loader & Helper Service
 * Uses user-configured Google Maps API Key
 */

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

// Popular trek presets with verified coordinates and elevations
export const POPULAR_TREKS = [
  {
    id: 'kudremukh',
    name: 'Kudremukh Peak',
    region: 'Chikkamagaluru, Karnataka',
    country: 'India',
    latitude: 13.136,
    longitude: 75.273,
    elevation: 1894,
    trailDifficulty: 'Moderate' as const,
    description: 'Iconic horse-faced peak in the Western Ghats known for rolling grasslands and sudden mist/rainstorms.'
  },
  {
    id: 'triund',
    name: 'Triund Hill Trek',
    region: 'Dharamshala, Himachal Pradesh',
    country: 'India',
    latitude: 32.2592,
    longitude: 76.3533,
    elevation: 2842,
    trailDifficulty: 'Moderate' as const,
    description: 'Tranquil ridge trail overlooking the Kangra Valley and majestic Dhauladhar ranges.'
  },
  {
    id: 'kedarkantha',
    name: 'Kedarkantha Summit',
    region: 'Uttarkashi, Uttarakhand',
    country: 'India',
    latitude: 31.0242,
    longitude: 78.1725,
    elevation: 3810,
    trailDifficulty: 'Challenging' as const,
    description: 'Classic Himalayan winter summit known for dense pine forests, sub-zero winds, and high snow.'
  },
  {
    id: 'roopkund',
    name: 'Roopkund Trail',
    region: 'Chamoli, Uttarakhand',
    country: 'India',
    latitude: 30.2644,
    longitude: 79.7314,
    elevation: 5029,
    trailDifficulty: 'Strenuous' as const,
    description: 'High-altitude glacial lake trek prone to severe blizzards, zero visibility, and rapid atmospheric pressure drops.'
  },
  {
    id: 'rainier',
    name: 'Mount Rainier Skyline Trail',
    region: 'Washington',
    country: 'United States',
    latitude: 46.8523,
    longitude: -121.7603,
    elevation: 2140,
    trailDifficulty: 'Challenging' as const,
    description: 'Subalpine loop through wildflower meadows up towards the active volcanic glaciated peak.'
  },
  {
    id: 'half_dome',
    name: 'Half Dome Trail',
    region: 'Yosemite, California',
    country: 'United States',
    latitude: 37.7460,
    longitude: -119.5332,
    elevation: 2694,
    trailDifficulty: 'Strenuous' as const,
    description: 'Exposed granite dome with famous steel cables, strictly hazardous during wet rain or lightning.'
  },
  {
    id: 'fuji',
    name: 'Mount Fuji Yoshida Trail',
    region: 'Yamanashi',
    country: 'Japan',
    latitude: 35.3606,
    longitude: 138.7274,
    elevation: 3776,
    trailDifficulty: 'Strenuous' as const,
    description: 'Volcanic gravel ascent subject to extreme summit gales, freezing rain, and rapid hypothermia risks.'
  },
  {
    id: 'ben_nevis',
    name: 'Ben Nevis Mountain Track',
    region: 'Highlands',
    country: 'United Kingdom',
    latitude: 56.7969,
    longitude: -5.0036,
    elevation: 1345,
    trailDifficulty: 'Moderate' as const,
    description: 'Highest peak in the British Isles notorious for gale-force winds, sudden cloud immersion, and driving rain.'
  },
  {
    id: 'mont_blanc',
    name: 'Tour du Mont Blanc (Chamonix)',
    region: 'Haute-Savoie / Valais',
    country: 'France / Italy / Switzerland',
    latitude: 45.8326,
    longitude: 6.8652,
    elevation: 2537,
    trailDifficulty: 'Strenuous' as const,
    description: 'Legendary circumnavigation through high alpine passes with volatile mountain thunderstorms.'
  }
];

export async function searchPlaces(query: string): Promise<Array<{
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}>> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim().toLowerCase();

  // Try Google Maps Autocomplete/Geocoding if loaded
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
    console.log('Google Geocoder fallback to preset/geocoding service:', err);
  }

  // Preset matches
  const matchedPresets = POPULAR_TREKS.filter(
    (t) =>
      t.name.toLowerCase().includes(cleanQuery) ||
      t.region.toLowerCase().includes(cleanQuery) ||
      t.country.toLowerCase().includes(cleanQuery)
  ).map((t) => ({
    placeId: `preset_${t.id}`,
    name: t.name,
    formattedAddress: `${t.region}, ${t.country}`,
    latitude: t.latitude,
    longitude: t.longitude
  }));

  if (matchedPresets.length > 0) {
    return matchedPresets;
  }

  // Global Nominatim / OpenStreetMap fallback geocoder for any custom trail/mountain in the world
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
