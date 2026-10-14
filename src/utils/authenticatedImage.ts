import { getAccessToken } from '../services/tokenStorage';
import { API_BASE_URL } from '../constants/api';

function resolveImageUrl(url: string): string {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${API_BASE_URL.replace(/\/$/, '')}${url}`;
  }
  return url;
}

export function buildAuthenticatedImageSource(
  url: string,
): { uri: string; headers?: Record<string, string> } {
  const resolvedUrl = resolveImageUrl(url);
  const token = getAccessToken();
  return token
    ? { uri: resolvedUrl, headers: { Authorization: `Bearer ${token}` } }
    : { uri: resolvedUrl };
}
