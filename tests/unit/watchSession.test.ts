import { useSessionStore } from '@/store/useSessionStore';

let mockAuthCallback: ((user: unknown) => void) | undefined;
const mockUnsubscribe = jest.fn();

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, cb: (user: unknown) => void) => {
    mockAuthCallback = cb;
    return mockUnsubscribe;
  },
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  serverTimestamp: jest.fn(),
  setDoc: jest.fn(),
}));
jest.mock('@/services/firebase', () => ({
  firebase: () => ({ auth: {}, db: {} }),
  isFirebaseConfigured: true,
}));

import { SESSION_CHECK_TIMEOUT_MS, watchSession } from '@/services/auth';

beforeEach(() => {
  jest.useFakeTimers();
  mockAuthCallback = undefined;
  useSessionStore.setState({ user: null, initializing: true });
});
afterEach(() => jest.useRealTimers());

describe('watchSession startup wait', () => {
  it('stops showing the loading screen if Firebase never answers', () => {
    watchSession();
    expect(useSessionStore.getState().initializing).toBe(true);
    jest.advanceTimersByTime(SESSION_CHECK_TIMEOUT_MS);
    expect(useSessionStore.getState()).toMatchObject({ initializing: false, user: null });
  });

  it('a late answer with a valid saved session still signs the user in', () => {
    watchSession();
    jest.advanceTimersByTime(SESSION_CHECK_TIMEOUT_MS);
    mockAuthCallback?.({ uid: 'u1', email: 'an@school.edu', displayName: 'An' });
    expect(useSessionStore.getState().user).toEqual({
      id: 'u1',
      email: 'an@school.edu',
      name: 'An',
    });
  });

  it('an on-time answer wins and the timeout does not overwrite it', () => {
    watchSession();
    mockAuthCallback?.({ uid: 'u1', email: 'an@school.edu', displayName: 'An' });
    jest.advanceTimersByTime(SESSION_CHECK_TIMEOUT_MS * 2);
    expect(useSessionStore.getState().user?.id).toBe('u1');
  });

  it('cleanup unsubscribes the listener', () => {
    watchSession()();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
