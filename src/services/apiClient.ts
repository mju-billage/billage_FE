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

/**
 * 서버가 내려주는 에러 코드(예: GROUP_NOT_FOUND)를 담은 API 에러.
 * 화면은 `message`가 아니라 `code`로 분기한다(공통규칙 §6) — `code`를
 * `constants/apiErrorMessages.ts`의 매핑에 넣어 화면 문구로 바꾼다.
 * `fieldErrors`는 검증 오류가 없어도 항상 빈 배열로 내려오지만, 폼 필드 단위
 * 에러가 필요 없는 화면은 그냥 무시하면 된다.
 */
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

/** 로그인/토큰 재발급으로 받은 토큰 쌍을 저장한다(Access는 메모리, Refresh는 보안 저장소). */
export async function storeTokens(tokens: TokenPair): Promise<void> {
  tokenStorage.setAccessToken(tokens.accessToken);
  await tokenStorage.setRefreshToken(tokens.refreshToken);
}

/** 로그아웃 등으로 세션을 종료할 때 저장된 토큰을 모두 삭제한다. */
export async function clearSession(): Promise<void> {
  await tokenStorage.clearTokens();
}

type RequestOptions = RequestInit & {
  /** true면 Authorization 헤더를 붙이지 않고, 401을 받아도 재발급을 시도하지 않는다. */
  skipAuth?: boolean;
};

const REAUTHENTICATABLE_CODES = ['ACCESS_TOKEN_EXPIRED', 'UNAUTHORIZED'];

async function rawRequest<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const accessToken = tokenStorage.getAccessToken();
  // multipart(FormData) 요청은 Content-Type을 직접 정하면 안 된다 — 경계 문자열
  // (boundary)이 빠져 서버가 파싱을 못 한다. fetch가 FormData를 보고 알아서
  // 붙이게 이 헤더만 생략한다(File 도메인, services/fileService.ts).
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

/**
 * Refresh Token으로 Access/Refresh Token을 재발급받아 저장한다(Rotation).
 * 동시에 여러 요청이 401을 만나도 재발급은 한 번만 수행되도록 진행 중인 요청을 공유한다.
 */
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

/**
 * 공통 API 요청 함수. ApiResponse<T> 래퍼를 벗겨 data만 반환한다.
 * Access Token 만료로 401(ACCESS_TOKEN_EXPIRED/UNAUTHORIZED)을 받으면 Refresh Token으로
 * 한 번 재발급을 시도한 뒤 요청을 재시도하고, 재발급마저 실패하면 세션을 지우고 원래 에러를 던진다.
 */
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
