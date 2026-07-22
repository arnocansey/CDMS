import {
  AUTH_TOKEN_KEYS,
  buildAuthHeader,
  shouldClearAuthOnRefreshFailure,
} from '../auth-storage';

describe('AUTH_TOKEN_KEYS', () => {
  it('uses stable SecureStore key names', () => {
    expect(AUTH_TOKEN_KEYS.access).toBe('accessToken');
    expect(AUTH_TOKEN_KEYS.refresh).toBe('refreshToken');
  });
});

describe('buildAuthHeader', () => {
  it('returns Authorization bearer header when token exists', () => {
    expect(buildAuthHeader('abc123')).toEqual({
      Authorization: 'Bearer abc123',
    });
  });

  it('returns empty object when token is missing', () => {
    expect(buildAuthHeader(null)).toEqual({});
    expect(buildAuthHeader(undefined)).toEqual({});
    expect(buildAuthHeader('')).toEqual({});
  });
});

describe('shouldClearAuthOnRefreshFailure', () => {
  it('clears auth only on 401', () => {
    expect(shouldClearAuthOnRefreshFailure(401)).toBe(true);
    expect(shouldClearAuthOnRefreshFailure(403)).toBe(false);
    expect(shouldClearAuthOnRefreshFailure(undefined)).toBe(false);
  });
});
