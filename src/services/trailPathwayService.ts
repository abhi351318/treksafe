import { TrekLocation } from '../types';
import { POPULAR_TREKS } from './googleMapsLoader';

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
    // Base linear interpolation
    const baseLat = startLat + dLat * fraction;
    const baseLng = startLng + dLng * fraction;

    // Mountain switchbacks/contour deviations
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
  kudremukh: {
    start: { name: 'Mullodi Village Trailhead', lat: 13.1678, lng: 75.2982, elev: 820 },
    end: { name: 'Kudremukh Peak (1894m)', lat: 13.1360, lng: 75.2730, elev: 1894 },
    trailLengthKm: 9.5,
    pathway: [
      { lat: 13.1678, lng: 75.2982 }, // Mullodi base
      { lat: 13.1610, lng: 75.2930 }, // Forest checkpost
      { lat: 13.1550, lng: 75.2890 }, // Ontimara Lone Tree
      { lat: 13.1490, lng: 75.2830 }, // Shola forest ridge
      { lat: 13.1420, lng: 75.2780 }, // Zig-zag climb
      { lat: 13.1360, lng: 75.2730 }  // Kudremukh summit
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
  },
  roopkund: {
    start: { name: 'Lohajung Basecamp', lat: 30.1340, lng: 79.5930, elev: 2300 },
    end: { name: 'Roopkund Skeletal Lake', lat: 30.2644, lng: 79.7314, elev: 5029 },
    trailLengthKm: 16.5,
    pathway: [
      { lat: 30.1340, lng: 79.5930 },
      { lat: 30.1680, lng: 79.6250 },
      { lat: 30.2050, lng: 79.6640 },
      { lat: 30.2390, lng: 79.7020 },
      { lat: 30.2644, lng: 79.7314 }
    ]
  },
  rainier: {
    start: { name: 'Paradise Trailhead Visitor Center', lat: 46.7865, lng: -121.7350, elev: 1645 },
    end: { name: 'Panorama Point Skyline Crest', lat: 46.8523, lng: -121.7603, elev: 2140 },
    trailLengthKm: 8.8,
    pathway: [
      { lat: 46.7865, lng: -121.7350 },
      { lat: 46.8040, lng: -121.7410 },
      { lat: 46.8220, lng: -121.7490 },
      { lat: 46.8390, lng: -121.7550 },
      { lat: 46.8523, lng: -121.7603 }
    ]
  },
  half_dome: {
    start: { name: 'Happy Isles Trailhead', lat: 37.7323, lng: -119.5583, elev: 1230 },
    end: { name: 'Half Dome Summit Cables', lat: 37.7460, lng: -119.5332, elev: 2694 },
    trailLengthKm: 13.5,
    pathway: [
      { lat: 37.7323, lng: -119.5583 },
      { lat: 37.7340, lng: -119.5490 },
      { lat: 37.7390, lng: -119.5420 },
      { lat: 37.7420, lng: -119.5370 },
      { lat: 37.7460, lng: -119.5332 }
    ]
  },
  fuji: {
    start: { name: 'Fuji Subaru Line 5th Station', lat: 35.3905, lng: 138.7320, elev: 2305 },
    end: { name: 'Mount Fuji Summit Shrine', lat: 35.3606, lng: 138.7274, elev: 3776 },
    trailLengthKm: 7.5,
    pathway: [
      { lat: 35.3905, lng: 138.7320 },
      { lat: 35.3810, lng: 138.7305 },
      { lat: 35.3720, lng: 138.7290 },
      { lat: 35.3650, lng: 138.7280 },
      { lat: 35.3606, lng: 138.7274 }
    ]
  },
  ben_nevis: {
    start: { name: 'Achintee Mountain Track Center', lat: 56.8115, lng: -5.0765, elev: 20 },
    end: { name: 'Ben Nevis Summit Cairn', lat: 56.7969, lng: -5.0036, elev: 1345 },
    trailLengthKm: 8.5,
    pathway: [
      { lat: 56.8115, lng: -5.0765 },
      { lat: 56.8080, lng: -5.0550 },
      { lat: 56.8040, lng: -5.0380 },
      { lat: 56.8000, lng: -5.0210 },
      { lat: 56.7969, lng: -5.0036 }
    ]
  },
  mont_blanc: {
    start: { name: 'Les Houches Trailhead', lat: 45.8900, lng: 6.7980, elev: 1000 },
    end: { name: 'Col de Voza Crest', lat: 45.8326, lng: 6.8652, elev: 2537 },
    trailLengthKm: 11.2,
    pathway: [
      { lat: 45.8900, lng: 6.7980 },
      { lat: 45.8750, lng: 6.8150 },
      { lat: 45.8600, lng: 6.8320 },
      { lat: 45.8450, lng: 6.8510 },
      { lat: 45.8326, lng: 6.8652 }
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

  // Fallback: Generate a realistic 5-7km trail pathway from lower elevation base to summit
  const baseOffsetLat = (Math.random() > 0.5 ? 1 : -1) * (0.025 + Math.random() * 0.015);
  const baseOffsetLng = (Math.random() > 0.5 ? 1 : -1) * (0.025 + Math.random() * 0.015);
  const startLat = trek.latitude + baseOffsetLat;
  const startLng = trek.longitude + baseOffsetLng;
  const startElev = Math.max(200, (trek.elevation || 1500) - 750);
  const endElev = trek.elevation || 1500;

  const generatedPath = generateRealisticPathway(startLat, startLng, trek.latitude, trek.longitude, 7);
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
  const allCurated = POPULAR_TREKS.map((preset) => {
    const dist = calculateDistanceKm(userLat, userLng, preset.latitude, preset.longitude);
    const enriched = enrichTrekWithTrailway(preset);
    return {
      ...enriched,
      distanceKm: dist
    };
  });

  // Sort by proximity
  allCurated.sort((a, b) => a.distanceKm - b.distanceKm);

  // 2. Also search OpenStreetMap / Overpass for nearby natural peaks or trails within ~150km if possible
  try {
    const radiusMeters = 150000; // 150km
    const overpassQuery = `
      [out:json][timeout:5];
      (
        node["natural"="peak"](around:${radiusMeters},${userLat},${userLng});
        node["tourism"="viewpoint"](around:${radiusMeters},${userLat},${userLng});
      );
      out 5;
    `;
    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.elements) && data.elements.length > 0) {
        const osmTreks = data.elements
          .filter((el: any) => el.tags && (el.tags.name || el.tags['name:en']))
          .map((el: any) => {
            const name = el.tags.name || el.tags['name:en'];
            const elev = el.tags.ele ? parseInt(el.tags.ele, 10) : 1200;
            const dist = calculateDistanceKm(userLat, userLng, el.lat, el.lon);
            const rawTrek: TrekLocation = {
              id: `osm_${el.id}`,
              name: `${name} Peak`,
              region: cityName ? `Near ${cityName}` : 'Regional Trail',
              latitude: el.lat,
              longitude: el.lon,
              elevation: elev,
              trailDifficulty: elev > 2500 ? 'Challenging' : 'Moderate',
              description: `Natural mountain peak located ${dist} km from your current location.`
            };
            return {
              ...enrichTrekWithTrailway(rawTrek),
              distanceKm: dist
            };
          });

        if (osmTreks.length > 0) {
          // Merge with curated and sort
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

  return allCurated;
}
