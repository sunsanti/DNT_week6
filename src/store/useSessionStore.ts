import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface SessionStore {
  user: User | null;
  /** True until Firebase reports the stored login (or its absence) once. */
  initializing: boolean;
  setUser: (user: User | null) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  initializing: true,
  setUser: (user) => set({ user, initializing: false }),
}));

// Only used below the login gate, where a user always exists.
export const useUserId = () => useSessionStore((s) => s.user?.id ?? '');
