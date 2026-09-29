import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from './firebase';
import { TrekkerProfile } from '../types';

export const DEFAULT_TREKKER_PROFILE: Omit<TrekkerProfile, 'uid' | 'email' | 'displayName'> = {
  phone: '',
  photoURL: '',
  city: 'Bengaluru',
  experienceLevel: 'Intermediate',
  preferredDifficulty: 'Moderate',
  preferredTrekTypes: ['Day Hikes', 'Monolith & Rock', 'Forest Trails'],
  fitnessLevel: 'Moderate',
  typicalDistanceKm: 10,
  maxElevationMeters: 1800,
  emergencyContact: {
    name: '',
    relationship: 'Family',
    phone: ''
  },
  preferences: {
    weatherAlerts: true,
    riskAlerts: true,
    trekReminders: true
  }
};

/**
 * Fetch a trekker's personal profile by their Firebase UID
 */
export async function getTrekkerProfile(uid: string): Promise<TrekkerProfile | null> {
  if (!uid) return null;
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      uid,
      displayName: data.displayName || auth.currentUser?.displayName || 'Trekker',
      email: data.email || auth.currentUser?.email || '',
      phone: data.phone || '',
      photoURL: data.photoURL || auth.currentUser?.photoURL || '',
      city: data.city || 'Bengaluru',
      experienceLevel: data.experienceLevel || 'Intermediate',
      preferredDifficulty: data.preferredDifficulty || 'Moderate',
      preferredTrekTypes: data.preferredTrekTypes || ['Day Hikes', 'Monolith & Rock'],
      fitnessLevel: data.fitnessLevel || 'Moderate',
      typicalDistanceKm: typeof data.typicalDistanceKm === 'number' ? data.typicalDistanceKm : 10,
      maxElevationMeters: typeof data.maxElevationMeters === 'number' ? data.maxElevationMeters : 1800,
      emergencyContact: {
        name: data.emergencyContact?.name || '',
        relationship: data.emergencyContact?.relationship || 'Family',
        phone: data.emergencyContact?.phone || ''
      },
      preferences: {
        weatherAlerts: data.preferences?.weatherAlerts ?? true,
        riskAlerts: data.preferences?.riskAlerts ?? true,
        trekReminders: data.preferences?.trekReminders ?? true
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (err) {
    console.error('Failed to fetch trekker profile:', err);
    throw err;
  }
}

/**
 * Save or update trekker profile securely in Firestore
 */
export async function saveTrekkerProfile(profile: TrekkerProfile): Promise<void> {
  if (!profile.uid) throw new Error('Missing User ID');

  const docRef = doc(db, 'users', profile.uid);
  const now = new Date().toISOString();

  const dataToSave = {
    uid: profile.uid,
    displayName: profile.displayName.trim() || 'Trekker',
    email: profile.email.trim(),
    phone: (profile.phone || '').trim(),
    photoURL: profile.photoURL || '',
    city: (profile.city || '').trim(),
    experienceLevel: profile.experienceLevel,
    preferredDifficulty: profile.preferredDifficulty,
    preferredTrekTypes: profile.preferredTrekTypes || [],
    fitnessLevel: profile.fitnessLevel,
    typicalDistanceKm: Number(profile.typicalDistanceKm) || 10,
    maxElevationMeters: Number(profile.maxElevationMeters) || 1500,
    emergencyContact: {
      name: (profile.emergencyContact?.name || '').trim(),
      relationship: (profile.emergencyContact?.relationship || '').trim(),
      phone: (profile.emergencyContact?.phone || '').trim()
    },
    preferences: {
      weatherAlerts: Boolean(profile.preferences?.weatherAlerts),
      riskAlerts: Boolean(profile.preferences?.riskAlerts),
      trekReminders: Boolean(profile.preferences?.trekReminders)
    },
    updatedAt: now
  };

  await setDoc(docRef, dataToSave, { merge: true });

  // Keep Firebase Auth profile in sync if display name or photo updated
  if (auth.currentUser && auth.currentUser.uid === profile.uid) {
    try {
      await updateProfile(auth.currentUser, {
        displayName: profile.displayName.trim() || 'Trekker',
        photoURL: profile.photoURL || undefined
      });
    } catch (e) {
      console.warn('Auth display name update warning:', e);
    }
  }
}

/**
 * Compute the profile completion percentage
 */
export function calculateProfileCompletion(profile: Partial<TrekkerProfile>): number {
  let score = 0;
  const weights = [
    { field: 'displayName', weight: 10, check: (p: any) => Boolean(p.displayName && p.displayName !== 'Trekker') },
    { field: 'photoURL', weight: 10, check: (p: any) => Boolean(p.photoURL) },
    { field: 'email', weight: 10, check: (p: any) => Boolean(p.email) },
    { field: 'phone', weight: 10, check: (p: any) => Boolean(p.phone && p.phone.length >= 7) },
    { field: 'city', weight: 10, check: (p: any) => Boolean(p.city) },
    { field: 'experienceLevel', weight: 10, check: (p: any) => Boolean(p.experienceLevel) },
    { field: 'preferredDifficulty', weight: 10, check: (p: any) => Boolean(p.preferredDifficulty) },
    { field: 'preferredTrekTypes', weight: 10, check: (p: any) => Boolean(p.preferredTrekTypes && p.preferredTrekTypes.length > 0) },
    { field: 'fitnessLevel', weight: 10, check: (p: any) => Boolean(p.fitnessLevel) },
    {
      field: 'emergencyContact',
      weight: 10,
      check: (p: any) => Boolean(p.emergencyContact?.name && p.emergencyContact?.phone)
    }
  ];

  weights.forEach((item) => {
    if (item.check(profile)) {
      score += item.weight;
    }
  });

  return Math.min(100, score);
}
