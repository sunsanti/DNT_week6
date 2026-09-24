export interface AuthFields {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

// Returns the first problem as a message, or null when the form is OK.
// Password minimum matches Firebase's own (6).
export function validateAuth(mode: 'login' | 'register', f: AuthFields): string | null {
  if (mode === 'register' && !f.name.trim()) return 'Enter your name.';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return 'Enter a valid email address.';
  if (f.password.length < 6) return 'Password must be at least 6 characters.';
  if (mode === 'register' && f.password !== f.confirm) return 'Passwords do not match.';
  return null;
}
