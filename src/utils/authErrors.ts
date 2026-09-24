const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/user-not-found': 'Wrong email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
  'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/operation-not-allowed': 'Email/password sign-in is not enabled in the Firebase console.',
  'auth/invalid-api-key': 'Firebase API key is invalid. Check .env.local.',
  'app/firebase-not-configured':
    'Firebase is not configured yet. Follow _specs/SPEC-firebase-setup.md and restart the app.',
};

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  return (code && MESSAGES[code]) || 'Something went wrong. Please try again.';
}
