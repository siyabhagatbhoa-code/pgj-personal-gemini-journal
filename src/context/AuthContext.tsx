import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserSanctuaryProfile } from '../types';

export const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBvSDoIbjmrTqPfVCActtUpvCBRmxs2voVF8HVM4A0mMB6RIHTNLt0dSo7FKf7mLzQxNx9pcbsmczK7-7MQzH1WBgTP84OoKyl-ZhzD9MYsK36V83GOIFxgky2Pv3gC7f2C0iJVFzvOJYCQ8GAz2cW9yTEBLnMrzNdjNbDeHkEVka3A2XF8r5u0kPVKWygIcQCLClTkg1VW2aBOf_hYiSApJI8yMiHLVK1ckah3xMwoC3fOAdLa9gk';

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: UserSanctuaryProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, name: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateSanctuaryProfile: (data: Partial<UserSanctuaryProfile>) => Promise<void>;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (persona: UserSanctuaryProfile['persona'], audioChime?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserSanctuaryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

  // Sync profile from Firestore
  const fetchOrCreateProfile = async (fbUser: FirebaseUser, preferredName?: string) => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data() as UserSanctuaryProfile & { hasCompletedOnboarding?: boolean };
        setProfile(data);
        setHasCompletedOnboarding(data.hasCompletedOnboarding ?? true);
      } else {
        const resolvedName = preferredName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Friend';
        const parts = resolvedName.split(' ');
        const initialProfile: UserSanctuaryProfile & { hasCompletedOnboarding: boolean } = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: resolvedName,
          firstName: parts[0] || resolvedName,
          lastName: parts.slice(1).join(' ') || '',
          moniker: parts[0] || resolvedName,
          avatarUrl: fbUser.photoURL || DEFAULT_AVATAR,
          persona: 'sage',
          auraTone: 'Dawn Lavender',
          philosophy:
            'Exploring the intersections of stillness and mindful reflection in daily journaling.',
          pronouns: 'They / Them',
          cadence: 'Daily',
          depth: 'Balanced',
          audioChime: true,
          proactivePrompts: true,
          voiceSynthesis: true,
          pillars: ['Creative Clarity', 'Mindful Presence'],
          reflectionsCount: 0,
          dayStreak: 1,
          stillnessHours: 1,
          hasCompletedOnboarding: false,
          updatedAt: new Date().toISOString()
        };

        await setDoc(userRef, initialProfile);
        setProfile(initialProfile);
        setHasCompletedOnboarding(false);
      }
    } catch (err) {
      console.error('Error in fetchOrCreateProfile:', err);
      // Fallback in-memory profile bounded strictly to the real Firebase UID
      const resolvedName = preferredName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Friend';
      const parts = resolvedName.split(' ');
      const fallback: UserSanctuaryProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: resolvedName,
        firstName: parts[0] || resolvedName,
        lastName: parts.slice(1).join(' ') || '',
        moniker: parts[0] || resolvedName,
        avatarUrl: fbUser.photoURL || DEFAULT_AVATAR,
        persona: 'sage',
        auraTone: 'Dawn Lavender',
        philosophy: 'Personal thoughts and reflections.',
        pronouns: 'They / Them',
        cadence: 'Daily',
        depth: 'Balanced',
        audioChime: true,
        proactivePrompts: true,
        voiceSynthesis: true,
        pillars: ['Creative Clarity', 'Mindful Presence'],
        reflectionsCount: 0,
        dayStreak: 1,
        stillnessHours: 1
      };
      setProfile(fallback);
      setHasCompletedOnboarding(true);
    }
  };

  useEffect(() => {
    // Purge any legacy synthetic auth data
    localStorage.removeItem('pgj_local_auth');

    // Real Firebase Auth state listener - ONLY source of authentication truth
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        await fetchOrCreateProfile(fbUser);
      } else {
        setUser(null);
        setProfile(null);
        setHasCompletedOnboarding(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    localStorage.removeItem('pgj_local_auth');
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      await fetchOrCreateProfile(res.user);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    localStorage.removeItem('pgj_local_auth');
    const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
    if (res.user) {
      await fetchOrCreateProfile(res.user);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    localStorage.removeItem('pgj_local_auth');
    const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (res.user) {
      if (name.trim()) {
        try {
          await updateFirebaseProfile(res.user, { displayName: name.trim() });
        } catch {
          // ignore display name sync non-fatal error
        }
      }
      await fetchOrCreateProfile(res.user, name.trim());
    }
  };

  const signOutUser = async () => {
    localStorage.removeItem('pgj_local_auth');
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut warning:', err);
    } finally {
      setProfile(null);
      setUser(null);
      setHasCompletedOnboarding(false);
    }
  };

  const updateSanctuaryProfile = async (data: Partial<UserSanctuaryProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          ...data,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err) {
      console.warn('Update profile error in firestore, applying locally:', err);
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const completeOnboarding = async (persona: UserSanctuaryProfile['persona'], audioChime = true) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          persona,
          audioChime,
          hasCompletedOnboarding: true,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      setProfile((prev) => (prev ? { ...prev, persona, audioChime } : null));
      setHasCompletedOnboarding(true);
    } catch (err) {
      console.warn('Onboarding update error in firestore, applying locally:', err);
      setProfile((prev) => (prev ? { ...prev, persona, audioChime } : null));
      setHasCompletedOnboarding(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        updateSanctuaryProfile,
        hasCompletedOnboarding,
        completeOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
