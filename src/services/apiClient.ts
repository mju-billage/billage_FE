import { API_BASE_URL } from '../constants/api';
import * as tokenStorage from './tokenStorage';
import { isSessionExpiredError } from '../constants/apiErrorMessages';
import { resolveImageUrl } from '../utils/authenticatedImage';

type ApiResponse<T> = {
  data: T;
  message: string;
};

export type ApiFieldError = {
  field: string;
  reason: string;
};

type ApiErrorBody = {
  code: string;
  message: string;
  fieldErrors?: ApiFieldError[];
};

export class ApiError extends Error {
  code: string;
  fieldErrors: ApiFieldError[];

  constructor(code: string, message: string, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresIn: number;
};

export async function storeTokens(tokens: TokenPair): Promise<void> {
  tokenStorage.setAccessToken(tokens.accessToken);
  await tokenStorage.setRefreshToken(tokens.refreshToken);
}

export async function clearSession(): Promise<void> {
  await tokenStorage.clearTokens();
  dataUriCache.clear();
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

const REAUTHENTICATABLE_CODES = ['TOKEN_EXPIRED', 'UNAUTHORIZED'];

async function rawRequest<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const accessToken = tokenStorage.getAccessToken();
  const isFormData =
    typeof FormData !== 'undefined' && options?.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(!options?.skipAuth && accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
      ...options?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();

  if (!response.ok) {
    const errorBody = body as ApiErrorBody;
    throw new ApiError(
      errorBody.code,
      errorBody.message,
      errorBody.fieldErrors ?? [],
    );
  }

  return (body as ApiResponse<T>).data;
}

let refreshPromise: Promise<void> | null = null;

export function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new ApiError(
          'NO_REFRESH_TOKEN',
          '저장된 Refresh Token이 없습니다.',
        );
      }
      const tokens = await rawRequest<TokenPair>('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        skipAuth: true,
      });
      await storeTokens(tokens);
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function request<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (error) {
    const shouldRetry =
      !options?.skipAuth &&
      error instanceof ApiError &&
      REAUTHENTICATABLE_CODES.includes(error.code);

    if (!shouldRetry) {
      throw error;
    }

    try {
      await refreshSession();
    } catch (refreshError) {
      if (isSessionExpiredError(refreshError)) {
        await clearSession();
        throw error;
      }
      throw refreshError;
    }

    return rawRequest<T>(path, options);
  }
}

const MAX_DATA_URI_CACHE_ENTRIES = 30;
const dataUriCache = new Map<string, Promise<string>>();

function evictOldestDataUriEntries(): void {
  while (dataUriCache.size > MAX_DATA_URI_CACHE_ENTRIES) {
    const oldestKey = dataUriCache.keys().next().value;
    if (oldestKey === undefined) {
      break;
    }
    dataUriCache.delete(oldestKey);
  }
}

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

function authFetchHeaders(): Record<string, string> | undefined {
  const accessToken = tokenStorage.getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

async function fetchImageOnce(resolvedUrl: string): Promise<Response> {
  return fetch(resolvedUrl, { headers: authFetchHeaders() });
}

async function loadAuthenticatedDataUri(resolvedUrl: string): Promise<string> {
  let response = await fetchImageOnce(resolvedUrl);
  if (response.status === 401) {
    await refreshSession();
    response = await fetchImageOnce(resolvedUrl);
  }
  if (!response.ok) {
    throw new ApiError(
      'IMAGE_FETCH_FAILED',
      `이미지를 불러오지 못했습니다. (${response.status})`,
    );
  }
  const blob = await response.blob();
  return blobToDataUri(blob);
}

/**
 * 인증이 필요한 이미지를 JS fetch 로 받아 data URI 로 돌려준다(QA-042).
 * `<Image source={{ uri, headers }}>` 로 직접 그리면 안드로이드에서 401 로 실패해
 * (원인 미확정 — 헤더 누락 또는 Fresco 캐시) 우회한 것. 같은 url 로의 동시 호출은
 * 진행 중인 Promise 를 공유하고, 캐시는 최대 `MAX_DATA_URI_CACHE_ENTRIES`개까지만
 * 들고 오래된 것부터 지운다. 실패한 호출은 캐시에 남기지 않는다.
 */
export function fetchAuthenticatedDataUri(url: string): Promise<string> {
  const resolvedUrl = resolveImageUrl(url);
  const cached = dataUriCache.get(resolvedUrl);
  if (cached) {
    return cached;
  }
  const promise = loadAuthenticatedDataUri(resolvedUrl).catch(error => {
    dataUriCache.delete(resolvedUrl);
    throw error;
  });
  dataUriCache.set(resolvedUrl, promise);
  evictOldestDataUriEntries();
  return promise;
}
