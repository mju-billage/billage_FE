import { getAccessToken } from '../services/tokenStorage';

/**
 * 인증이 필요한 이미지 URL(File 도메인 `fileUrl` 등, File.txt "인증이 필요한
 * 경로")을 `<Image source={...}>`에 바로 쓸 수 있는 형태로 만든다. RN의 `Image`는
 * `source.headers`를 지원해 별도 라이브러리 없이 Authorization 헤더를 붙일 수 있다.
 */
export function buildAuthenticatedImageSource(
  url: string,
): { uri: string; headers?: Record<string, string> } {
  const token = getAccessToken();
  return token ? { uri: url, headers: { Authorization: `Bearer ${token}` } } : { uri: url };
}
