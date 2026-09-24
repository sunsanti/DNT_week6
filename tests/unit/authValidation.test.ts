import { validateAuth } from '@/utils/authValidation';
import { authErrorMessage } from '@/utils/authErrors';

const ok = { name: 'An', email: 'an@school.edu', password: 'secret1', confirm: 'secret1' };

describe('validateAuth', () => {
  it('accepts a valid login and a valid registration', () => {
    expect(validateAuth('login', ok)).toBeNull();
    expect(validateAuth('register', ok)).toBeNull();
  });

  it('login does not require a name or confirmation', () => {
    expect(validateAuth('login', { ...ok, name: '', confirm: '' })).toBeNull();
  });

  it('rejects a bad email', () => {
    expect(validateAuth('login', { ...ok, email: 'not-an-email' })).toMatch(/email/i);
    expect(validateAuth('login', { ...ok, email: '' })).toMatch(/email/i);
  });

  it('rejects a short password', () => {
    expect(validateAuth('login', { ...ok, password: '12345' })).toMatch(/6 characters/);
  });

  it('registration needs a name and matching passwords', () => {
    expect(validateAuth('register', { ...ok, name: '  ' })).toMatch(/name/i);
    expect(validateAuth('register', { ...ok, confirm: 'other11' })).toMatch(/do not match/);
  });
});

describe('authErrorMessage', () => {
  it('maps known Firebase codes to friendly text', () => {
    expect(authErrorMessage({ code: 'auth/email-already-in-use' })).toMatch(/already exists/);
    expect(authErrorMessage({ code: 'auth/invalid-credential' })).toMatch(
      /Wrong email or password/,
    );
    expect(authErrorMessage({ code: 'app/firebase-not-configured' })).toMatch(
      /SPEC-firebase-setup/,
    );
  });

  it('never leaks raw errors for unknown codes', () => {
    expect(authErrorMessage(new Error('boom'))).toBe('Something went wrong. Please try again.');
    expect(authErrorMessage(null)).toBe('Something went wrong. Please try again.');
  });
});
