import * as Keychain from 'react-native-keychain';

const REFRESH_TOKEN_SERVICE = 'billage.refreshToken';

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export async function setRefreshToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('refreshToken', token, {
    service: REFRESH_TOKEN_SERVICE,
  });
}

export async function getRefreshToken(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({
    service: REFRESH_TOKEN_SERVICE,
  });
  return credentials ? credentials.password : null;
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE });
}
