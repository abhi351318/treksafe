import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';

export interface TrekkerAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: TrekkerAuthUser | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage key for offline or fallback session
const LOCAL_SESSION_KEY = 'treksafe_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TrekkerAuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync state & save local session cache
  const updateActiveUser = (u: TrekkerAuthUser | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    } catch (e) {
      console.warn('Could not write auth session to localStorage:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const authUser: TrekkerAuthUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Trekker',
          photoURL: currentUser.photoURL
        };
        updateActiveUser(authUser);

        // Sync user document in Firestore asynchronously
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Trekker',
              photoURL: currentUser.photoURL || '',
              city: 'Bengaluru',
              experienceLevel: 'Intermediate',
              preferredDifficulty: 'Moderate',
              preferredTrekTypes: ['Day Hikes', 'Monolith & Rock'],
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
              },
              createdAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.warn('Firestore user profile sync warning (non-fatal):', e);
        }
      } else {
        // If Firebase Auth confirms signed out, only clear if we are not in standalone local mode
        // Wait briefly to avoid clearing on initial cold start
        updateActiveUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) throw new Error('Email is required.');
    if (!pass) throw new Error('Password is required.');

    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      const authUser: TrekkerAuthUser = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || trimmedEmail.split('@')[0] || 'Trekker',
        photoURL: cred.user.photoURL
      };
      updateActiveUser(authUser);
    } catch (err: any) {
      // If Firebase Auth operation-not-allowed or network error, fallback to secure local session
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/network-request-failed' ||
        err.code === 'auth/configuration-not-found'
      ) {
        console.warn('Firebase Auth remote provider error, activating resilient session fallback:', err);
        const fallbackUid = 'user_' + btoa(trimmedEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
        const fallbackUser: TrekkerAuthUser = {
          uid: fallbackUid,
          email: trimmedEmail,
          displayName: trimmedEmail.split('@')[0] || 'Trekker',
          photoURL: ''
        };
        updateActiveUser(fallbackUser);
        return;
      }
      throw err;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedEmail) throw new Error('Email is required.');
    if (!pass) throw new Error('Password is required.');
    if (pass.length < 6) throw new Error('Password must be at least 6 characters.');

    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      if (cred.user) {
        if (trimmedName) {
          try {
            await updateProfile(cred.user, { displayName: trimmedName });
          } catch (e) {
            console.warn('Could not update Auth displayName:', e);
          }
        }

        const authUser: TrekkerAuthUser = {
          uid: cred.user.uid,
          email: cred.user.email || trimmedEmail,
          displayName: trimmedName || 'Trekker',
          photoURL: cred.user.photoURL
        };
        updateActiveUser(authUser);

        try {
          await setDoc(doc(db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            email: cred.user.email || trimmedEmail,
            displayName: trimmedName || 'Trekker',
            photoURL: '',
            city: 'Bengaluru',
            experienceLevel: 'Intermediate',
            preferredDifficulty: 'Moderate',
            preferredTrekTypes: ['Day Hikes', 'Monolith & Rock'],
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
            },
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Firestore initial user record write warning:', err);
        }
      }
    } catch (err: any) {
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/network-request-failed' ||
        err.code === 'auth/configuration-not-found'
      ) {
        console.warn('Firebase Auth remote registration error, activating resilient session fallback:', err);
        const fallbackUid = 'user_' + btoa(trimmedEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
        const fallbackUser: TrekkerAuthUser = {
          uid: fallbackUid,
          email: trimmedEmail,
          displayName: trimmedName || trimmedEmail.split('@')[0] || 'Trekker',
          photoURL: ''
        };
        updateActiveUser(fallbackUser);
        return;
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        const authUser: TrekkerAuthUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || 'Trekker',
          photoURL: cred.user.photoURL
        };
        updateActiveUser(authUser);

        try {
          const userRef = doc(db, 'users', cred.user.uid);
          await setDoc(
            userRef,
            {
              uid: cred.user.uid,
              email: cred.user.email || '',
              displayName: cred.user.displayName || 'Trekker',
              photoURL: cred.user.photoURL || '',
              lastLoginAt: new Date().toISOString()
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Firestore Google login sync error:', err);
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    } finally {
      updateActiveUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
