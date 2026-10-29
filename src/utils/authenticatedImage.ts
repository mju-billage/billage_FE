import { API_BASE_URL } from '../constants/api';

export function resolveImageUrl(url: string): string {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${API_BASE_URL.replace(/\/$/, '')}${url}`;
  }
  return url;
}
