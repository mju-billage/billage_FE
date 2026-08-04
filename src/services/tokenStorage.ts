import * as Keychain from 'react-native-keychain';

const REFRESH_TOKEN_SERVICE = 'billage.refreshToken';

let accessToken: string | null = null;

/** 메모리에 보관된 Access Token을 반환한다. 앱을 재시작하면 사라진다. */
export function getAccessToken(): string | null {
  return accessToken;
}

/** Access Token을 메모리에 저장한다. */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Refresh Token을 Android Keystore 기반 보안 저장소에 저장한다. */
export async function setRefreshToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('refreshToken', token, {
    service: REFRESH_TOKEN_SERVICE,
  });
}

/** 보안 저장소에서 Refresh Token을 읽는다. 저장된 값이 없으면 null을 반환한다. */
export async function getRefreshToken(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({
    service: REFRESH_TOKEN_SERVICE,
  });
  return credentials ? credentials.password : null;
}

/** Access Token(메모리)과 Refresh Token(보안 저장소)을 모두 삭제한다. */
export async function clearTokens(): Promise<void> {
  accessToken = null;
  await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE });
}
