import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firebase, isFirebaseConfigured } from './firebase';
import { useBookingDraftStore } from '@/store/useBookingDraftStore';
import { useSessionStore, type User } from '@/store/useSessionStore';

const toUser = (u: FirebaseUser, name = u.displayName): User => ({
  id: u.uid,
  email: u.email ?? '',
  name: name || (u.email ?? '').split('@')[0],
});

export async function register(name: string, email: string, password: string): Promise<void> {
  const { auth, db } = firebase();
  const cleanName = name.trim();
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(cred.user, { displayName: cleanName });
  // onAuthStateChanged already fired before the name was saved, so publish the final user.
  useSessionStore.getState().setUser(toUser(cred.user, cleanName));
  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: cleanName,
      email: cred.user.email,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // The account exists and works; the profile document can be written on a later run.
    console.warn('Could not save the user profile to Firestore:', error);
  }
}

export async function login(email: string, password: string): Promise<void> {
  // The onAuthStateChanged listener in watchSession publishes the user.
  await signInWithEmailAndPassword(firebase().auth, email.trim(), password);
}

export async function logout(): Promise<void> {
  useBookingDraftStore.getState().clear();
  await signOut(firebase().auth);
}

// How long the loading screen may wait for Firebase to report the saved login. With a saved
// session Firebase first asks the server whether it is still valid; on a slow or flaky network
// that can take very long, so after this we show the login screen and let the real answer
// (if it is a valid session) take over once it arrives.
export const SESSION_CHECK_TIMEOUT_MS = 4000;

// Call once at startup. Restores a saved login and keeps the session store in sync.
export function watchSession(): () => void {
  const { setUser } = useSessionStore.getState();
  if (!isFirebaseConfigured) {
    setUser(null);
    return () => {};
  }
  const timer = setTimeout(() => {
    if (useSessionStore.getState().initializing) setUser(null);
  }, SESSION_CHECK_TIMEOUT_MS);
  const unsubscribe = onAuthStateChanged(firebase().auth, (u) => {
    clearTimeout(timer);
    setUser(u ? toUser(u) : null);
  });
  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}
