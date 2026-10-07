import { getAccessToken } from '../services/tokenStorage';

export function buildAuthenticatedImageSource(
  url: string,
): { uri: string; headers?: Record<string, string> } {
  const token = getAccessToken();
  return token ? { uri: url, headers: { Authorization: `Bearer ${token}` } } : { uri: url };
}
