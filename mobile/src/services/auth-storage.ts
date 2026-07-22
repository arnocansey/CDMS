export const AUTH_TOKEN_KEYS = {
  access: 'accessToken',
  refresh: 'refreshToken',
} as const;

export function buildAuthHeader(token: string | null | undefined): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function shouldClearAuthOnRefreshFailure(status?: number): boolean {
  return status === 401;
}
