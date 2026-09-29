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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user document in Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Trekker',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.warn('Firestore user profile sync error:', e);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) throw new Error('Email is required.');
    if (!pass) throw new Error('Password is required.');
    await signInWithEmailAndPassword(auth, trimmedEmail, pass);
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedEmail) throw new Error('Email is required.');
    if (!pass) throw new Error('Password is required.');
    if (pass.length < 6) throw new Error('Password must be at least 6 characters.');

    const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
    if (cred.user) {
      if (trimmedName) {
        try {
          await updateProfile(cred.user, { displayName: trimmedName });
        } catch (e) {
          console.warn('Could not update Auth displayName:', e);
        }
      }
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
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    if (cred.user) {
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
  };

  const logout = async () => {
    await signOut(auth);
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
