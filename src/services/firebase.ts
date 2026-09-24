import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { connectAuthEmulator, getAuth, initializeAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

// Values come from .env.local (see _specs/SPEC-firebase-setup.md). EXPO_PUBLIC_* is inlined at
// build time; Firebase web config is not secret, access is enforced by Firestore/Auth rules.
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Optional: point at the local Firebase emulators (e.g. "localhost", or "10.0.2.2" on an
// Android emulator) so the app can be tested without a real project.
const emulatorHost = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST;

// Metro resolves 'firebase/auth' to its React Native build, which has this export, but the
// bundled TypeScript types only describe the web build. Typed by hand instead of `any`.
const { getReactNativePersistence } = firebaseAuth as unknown as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => firebaseAuth.Persistence;
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

export class FirebaseNotConfiguredError extends Error {
  code = 'app/firebase-not-configured';
  constructor() {
    super('Firebase is not configured.');
  }
}

let instance: { auth: Auth; db: Firestore } | undefined;

// Created on first use, so a missing config fails the sign-in form instead of crashing startup.
export function firebase(): { auth: Auth; db: Firestore } {
  if (instance) return instance;
  if (!isFirebaseConfigured) throw new FirebaseNotConfiguredError();

  const fresh = getApps().length === 0;
  const app = fresh ? initializeApp(config) : getApp();
  // Native keeps the login in AsyncStorage; web uses the browser's own persistence.
  // initializeAuth throws if called twice (fast refresh), hence the `fresh` guard.
  const auth =
    Platform.OS === 'web' || !fresh
      ? getAuth(app)
      : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  const db = getFirestore(app);

  if (fresh && emulatorHost) {
    connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, emulatorHost, 8080);
  }
  instance = { auth, db };
  return instance;
}
