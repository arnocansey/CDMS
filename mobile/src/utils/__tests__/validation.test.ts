import {
  isNonEmpty,
  isValidEmail,
  isValidPassword,
  normalizeSlug,
} from '../validation';

describe('isNonEmpty', () => {
  it('returns true for non-empty trimmed strings', () => {
    expect(isNonEmpty('hello')).toBe(true);
    expect(isNonEmpty('  x  ')).toBe(true);
  });

  it('returns false for empty, whitespace, null, or undefined', () => {
    expect(isNonEmpty('')).toBe(false);
    expect(isNonEmpty('   ')).toBe(false);
    expect(isNonEmpty(null)).toBe(false);
    expect(isNonEmpty(undefined)).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts simple valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('  jane.doe@church.org  ')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
  });
});

describe('normalizeSlug', () => {
  it('lowercases and hyphenates church names', () => {
    expect(normalizeSlug('Grace Community Church')).toBe('grace-community-church');
  });

  it('strips invalid characters and collapses hyphens', () => {
    expect(normalizeSlug("St. Mary's!!! Church")).toBe('st-marys-church');
    expect(normalizeSlug('--Hello--World--')).toBe('hello-world');
  });
});

describe('isValidPassword', () => {
  it('enforces minimum length', () => {
    expect(isValidPassword('short')).toBe(false);
    expect(isValidPassword('longenough')).toBe(true);
    expect(isValidPassword('1234567', 8)).toBe(false);
    expect(isValidPassword('12345678', 8)).toBe(true);
  });
});
