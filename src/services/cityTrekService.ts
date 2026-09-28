import { TrekLocation } from '../types';
import { COMPREHENSIVE_TREKS } from './trekPresets';
import { KNOWN_CITIES, searchPlaces } from './googleMapsLoader';
import { calculateDistanceKm, enrichTrekWithTrailway } from './trailPathwayService';

export interface CityTrekSearchResult {
  cityName: string;
  foundInCity: boolean;
  treks: Array<TrekLocation & { distanceKm?: number }>;
}

/**
 * Given any city name (e.g., 'Bengaluru', 'Kolar', 'Mumbai', 'Paris'),
 * returns:
 * 1. Trails located specifically in or immediately near this city (< 120km)
 * 2. If none exist near that location, gracefully keeps and falls back to the top popular benchmark treks!
 */
export async function getTreksForCity(inputCity: string): Promise<CityTrekSearchResult> {
  const cleanQuery = inputCity.trim().toLowerCase();

  // 1. Text-based filtering first (e.g. if user types 'Kolar' or 'Bengaluru' or 'Karnataka')
  const directTextMatches = COMPREHENSIVE_TREKS.filter((t) => {
    const regionLower = (t.region || '').toLowerCase();
    const nameLower = t.name.toLowerCase();
    const descLower = (t.description || '').toLowerCase();
    return (
      regionLower.includes(cleanQuery) ||
      nameLower.includes(cleanQuery) ||
      descLower.includes(cleanQuery)
    );
  }).map((t) => enrichTrekWithTrailway(t));

  if (directTextMatches.length > 0) {
    return {
      cityName: inputCity,
      foundInCity: true,
      treks: directTextMatches
    };
  }

  // 2. Coordinate-based proximity filtering
  let cityLat: number | null = null;
  let cityLng: number | null = null;
  let resolvedCityName = inputCity;

  // Check known cities first
  for (const [key, city] of Object.entries(KNOWN_CITIES)) {
    if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
      cityLat = city.lat;
      cityLng = city.lng;
      resolvedCityName = city.name;
      break;
    }
  }

  // If not in known cities, geocode using Google Geocoder / OSM
  if (cityLat === null || cityLng === null) {
    try {
      const places = await searchPlaces(inputCity);
      if (places.length > 0) {
        cityLat = places[0].latitude;
        cityLng = places[0].longitude;
        resolvedCityName = places[0].name;
      }
    } catch (e) {
      console.warn('City geocoding error:', e);
    }
  }

  // If we have coordinates, find treks within ~180km of the city
  if (cityLat !== null && cityLng !== null) {
    const distances = COMPREHENSIVE_TREKS.map((t) => {
      const dist = calculateDistanceKm(cityLat!, cityLng!, t.latitude, t.longitude);
      return {
        ...enrichTrekWithTrailway(t),
        distanceKm: dist
      };
    });

    // Treks within ~160km of the city
    const nearby = distances
      .filter((t) => t.distanceKm <= 160)
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    if (nearby.length > 0) {
      return {
        cityName: resolvedCityName,
        foundInCity: true,
        treks: nearby
      };
    }
  }

  // 3. Fallback: If no treks exist near that city, keep the popular places!
  const popularFallbacks = COMPREHENSIVE_TREKS.slice(0, 8).map((t) =>
    enrichTrekWithTrailway(t)
  );

  return {
    cityName: inputCity,
    foundInCity: false,
    treks: popularFallbacks
  };
}
