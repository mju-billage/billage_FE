import { API_BASE_URL } from '../constants/api';
import * as tokenStorage from './tokenStorage';

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
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

const REAUTHENTICATABLE_CODES = ['ACCESS_TOKEN_EXPIRED', 'UNAUTHORIZED'];

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

function refreshSession(): Promise<void> {
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
    } catch {
      await clearSession();
      throw error;
    }

    return rawRequest<T>(path, options);
  }
}
