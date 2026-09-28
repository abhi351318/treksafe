import { TrekLocation } from '../types';
import { COMPREHENSIVE_TREKS } from './trekPresets';

/**
 * Calculate Great-Circle distance between two coordinates in kilometers (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Generate a realistic hiking pathway curve between trailhead start and summit end
 */
export function generateRealisticPathway(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  numSegments = 8
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [{ lat: startLat, lng: startLng }];

  // Midpoints with realistic terrain trail wandering
  const dLat = endLat - startLat;
  const dLng = endLng - startLng;

  for (let i = 1; i < numSegments; i++) {
    const fraction = i / numSegments;
    const baseLat = startLat + dLat * fraction;
    const baseLng = startLng + dLng * fraction;

    const wanderAmp = 0.0035;
    const offsetLat = Math.sin(fraction * Math.PI * 3) * wanderAmp * (i % 2 === 0 ? 1 : -0.7);
    const offsetLng = Math.cos(fraction * Math.PI * 2.5) * wanderAmp * (i % 2 === 1 ? 0.8 : -1);

    points.push({
      lat: Math.round((baseLat + offsetLat) * 100000) / 100000,
      lng: Math.round((baseLng + offsetLng) * 100000) / 100000
    });
  }

  points.push({ lat: endLat, lng: endLng });
  return points;
}

/**
 * Predefined realistic pathways for curated mountain treks
 */
export const DETAILED_TREK_TRAILS: Record<
  string,
  {
    start: { name: string; lat: number; lng: number; elev: number };
    end: { name: string; lat: number; lng: number; elev: number };
    trailLengthKm: number;
    pathway: Array<{ lat: number; lng: number }>;
  }
> = {
  nandi_hills: {
    start: { name: 'Sultanpet Village Trailhead', lat: 13.3570, lng: 77.6740, elev: 980 },
    end: { name: 'Nandi Hills Viewpoint & Tipu Drop', lat: 13.3702, lng: 77.6835, elev: 1478 },
    trailLengthKm: 4.8,
    pathway: [
      { lat: 13.3570, lng: 77.6740 },
      { lat: 13.3610, lng: 77.6770 },
      { lat: 13.3650, lng: 77.6800 },
      { lat: 13.3680, lng: 77.6820 },
      { lat: 13.3702, lng: 77.6835 }
    ]
  },
  skandagiri: {
    start: { name: 'Kalavara Village Base (Papagni Mutt)', lat: 13.4020, lng: 77.6950, elev: 950 },
    end: { name: 'Skandagiri Summit Temple Ruins', lat: 13.4180, lng: 77.6833, elev: 1450 },
    trailLengthKm: 8.0,
    pathway: [
      { lat: 13.4020, lng: 77.6950 },
      { lat: 13.4060, lng: 77.6910 },
      { lat: 13.4110, lng: 77.6870 },
      { lat: 13.4150, lng: 77.6850 },
      { lat: 13.4180, lng: 77.6833 }
    ]
  },
  savandurga: {
    start: { name: 'Narasimhaswamy Temple Base', lat: 12.9120, lng: 77.2910, elev: 850 },
    end: { name: 'Savandurga Monolith Fort Crest', lat: 12.9189, lng: 77.2933, elev: 1226 },
    trailLengthKm: 5.5,
    pathway: [
      { lat: 12.9120, lng: 77.2910 },
      { lat: 12.9140, lng: 77.2918 },
      { lat: 12.9160, lng: 77.2925 },
      { lat: 12.9189, lng: 77.2933 }
    ]
  },
  antargange: {
    start: { name: 'Antargange Footbridge Entrance', lat: 13.1360, lng: 78.1060, elev: 980 },
    end: { name: 'Seven Cave Summit Ridge', lat: 13.1425, lng: 78.1025, elev: 1260 },
    trailLengthKm: 3.5,
    pathway: [
      { lat: 13.1360, lng: 78.1060 },
      { lat: 13.1380, lng: 78.1050 },
      { lat: 13.1405, lng: 78.1035 },
      { lat: 13.1425, lng: 78.1025 }
    ]
  },
  makalidurga: {
    start: { name: 'Makalidurga Railway Station Base', lat: 13.4240, lng: 77.5080, elev: 890 },
    end: { name: 'Makalidurga Hilltop Fort', lat: 13.4312, lng: 77.5002, elev: 1117 },
    trailLengthKm: 4.2,
    pathway: [
      { lat: 13.4240, lng: 77.5080 },
      { lat: 13.4270, lng: 77.5045 },
      { lat: 13.4295, lng: 77.5020 },
      { lat: 13.4312, lng: 77.5002 }
    ]
  },
  kudremukh: {
    start: { name: 'Mullodi Village Trailhead', lat: 13.1678, lng: 75.2982, elev: 820 },
    end: { name: 'Kudremukh Peak (1894m)', lat: 13.1360, lng: 75.2730, elev: 1894 },
    trailLengthKm: 9.5,
    pathway: [
      { lat: 13.1678, lng: 75.2982 },
      { lat: 13.1610, lng: 75.2930 },
      { lat: 13.1550, lng: 75.2890 },
      { lat: 13.1490, lng: 75.2830 },
      { lat: 13.1420, lng: 75.2780 },
      { lat: 13.1360, lng: 75.2730 }
    ]
  },
  triund: {
    start: { name: 'McLeod Ganj Trailhead', lat: 32.2426, lng: 76.3262, elev: 1750 },
    end: { name: 'Triund Ridge Crest', lat: 32.2592, lng: 76.3533, elev: 2842 },
    trailLengthKm: 7.2,
    pathway: [
      { lat: 32.2426, lng: 76.3262 },
      { lat: 32.2470, lng: 76.3320 },
      { lat: 32.2510, lng: 76.3395 },
      { lat: 32.2555, lng: 76.3470 },
      { lat: 32.2592, lng: 76.3533 }
    ]
  },
  kedarkantha: {
    start: { name: 'Sankri Base Village', lat: 31.0772, lng: 78.1812, elev: 1950 },
    end: { name: 'Kedarkantha Summit', lat: 31.0242, lng: 78.1725, elev: 3810 },
    trailLengthKm: 10.0,
    pathway: [
      { lat: 31.0772, lng: 78.1812 },
      { lat: 31.0620, lng: 78.1790 },
      { lat: 31.0490, lng: 78.1765 },
      { lat: 31.0360, lng: 78.1740 },
      { lat: 31.0242, lng: 78.1725 }
    ]
  }
};

/**
 * Enrich any TrekLocation with starting point, ending point, and pathway line
 */
export function enrichTrekWithTrailway(trek: TrekLocation): TrekLocation {
  const detailKey = Object.keys(DETAILED_TREK_TRAILS).find(
    (k) =>
      trek.id.toLowerCase().includes(k) ||
      trek.name.toLowerCase().includes(k) ||
      (Math.abs(trek.latitude - DETAILED_TREK_TRAILS[k].end.lat) < 0.05 &&
        Math.abs(trek.longitude - DETAILED_TREK_TRAILS[k].end.lng) < 0.05)
  );

  if (detailKey && DETAILED_TREK_TRAILS[detailKey]) {
    const d = DETAILED_TREK_TRAILS[detailKey];
    return {
      ...trek,
      trailLengthKm: d.trailLengthKm,
      startPoint: {
        name: d.start.name,
        latitude: d.start.lat,
        longitude: d.start.lng,
        elevation: d.start.elev,
        type: 'start'
      },
      endPoint: {
        name: d.end.name,
        latitude: d.end.lat,
        longitude: d.end.lng,
        elevation: d.end.elev,
        type: 'summit'
      },
      pathway: d.pathway
    };
  }

  // Fallback: Generate a realistic 4-8km trail pathway from base to summit
  const baseOffsetLat = (Math.random() > 0.5 ? 1 : -1) * (0.015 + Math.random() * 0.015);
  const baseOffsetLng = (Math.random() > 0.5 ? 1 : -1) * (0.015 + Math.random() * 0.015);
  const startLat = trek.latitude + baseOffsetLat;
  const startLng = trek.longitude + baseOffsetLng;
  const startElev = Math.max(200, (trek.elevation || 1500) - 500);
  const endElev = trek.elevation || 1500;

  const generatedPath = generateRealisticPathway(startLat, startLng, trek.latitude, trek.longitude, 6);
  const approxDistance = calculateDistanceKm(startLat, startLng, trek.latitude, trek.longitude) * 1.35;

  return {
    ...trek,
    trailLengthKm: Math.round(approxDistance * 10) / 10,
    startPoint: {
      name: `${trek.name} Trailhead Base`,
      latitude: startLat,
      longitude: startLng,
      elevation: startElev,
      type: 'start'
    },
    endPoint: {
      name: `${trek.name} Summit`,
      latitude: trek.latitude,
      longitude: trek.longitude,
      elevation: endElev,
      type: 'summit'
    },
    pathway: generatedPath
  };
}

/**
 * Find mountain treks located near a city or given user coordinates
 */
export async function findTreksNearLocation(
  userLat: number,
  userLng: number,
  cityName?: string
): Promise<Array<TrekLocation & { distanceKm: number }>> {
  // 1. Calculate distance from user location to all curated benchmark trails
  const allCurated = COMPREHENSIVE_TREKS.map((preset) => {
    const dist = calculateDistanceKm(userLat, userLng, preset.latitude, preset.longitude);
    const enriched = enrichTrekWithTrailway(preset);
    return {
      ...enriched,
      distanceKm: dist
    };
  });

  // Sort by proximity
  allCurated.sort((a, b) => a.distanceKm - b.distanceKm);

  // If user searched for a specific city, prioritize treks within ~250km
  const nearbyCurated = allCurated.filter((t) => t.distanceKm <= 350);

  // 2. Query OpenStreetMap / Overpass for regional peaks within 80km
  try {
    const radiusMeters = 80000; // 80km
    const overpassQuery = `
      [out:json][timeout:4];
      (
        node["natural"="peak"](around:${radiusMeters},${userLat},${userLng});
        node["tourism"="viewpoint"](around:${radiusMeters},${userLat},${userLng});
      );
      out 8;
    `;
    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.elements) && data.elements.length > 0) {
        const osmTreks = data.elements
          .filter((el: any) => el.tags && (el.tags.name || el.tags['name:en']))
          .map((el: any) => {
            const name = el.tags.name || el.tags['name:en'];
            const elev = el.tags.ele ? parseInt(el.tags.ele, 10) : 1100;
            const dist = calculateDistanceKm(userLat, userLng, el.lat, el.lon);
            const rawTrek: TrekLocation = {
              id: `osm_${el.id}`,
              name: `${name} Peak`,
              region: cityName ? `Near ${cityName}` : 'Regional Trail',
              latitude: el.lat,
              longitude: el.lon,
              elevation: elev,
              trailDifficulty: elev > 2000 ? 'Challenging' : 'Moderate',
              description: `Natural mountain peak located ${dist} km from ${cityName || 'your location'}.`
            };
            return {
              ...enrichTrekWithTrailway(rawTrek),
              distanceKm: dist
            };
          });

        if (osmTreks.length > 0) {
          const merged = [...osmTreks, ...allCurated].filter(
            (item, index, self) => index === self.findIndex((t) => t.name === item.name)
          );
          merged.sort((a, b) => a.distanceKm - b.distanceKm);
          return merged;
        }
      }
    }
  } catch (err) {
    console.log('Overpass nearby query fallback to curated:', err);
  }

  // Return sorted curated list (nearby prioritized)
  return nearbyCurated.length >= 3 ? nearbyCurated : allCurated;
}
