import { clearSession, request, storeTokens, TokenPair } from './apiClient';
import * as tokenStorage from './tokenStorage';
import { SocialType } from '../types/social';

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
};

export type SignupResponse = {
  userId: number;
  email: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUserResponse = {
  userId: number;
  email: string;
  name: string;
};

type LoginResponse = {
  user: AuthUserResponse;
  tokens: TokenPair;
};

/** 이메일 회원가입을 요청한다. 성공해도 토큰은 발급되지 않으며 별도로 로그인해야 한다. */
export function signup(payload: SignupRequest): Promise<SignupResponse> {
  return request<SignupResponse>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

/** 이메일/비밀번호로 로그인하고, 발급된 토큰을 저장한다. */
export async function login(
  payload: LoginRequest,
): Promise<AuthUserResponse> {
  const { user, tokens } = await request<LoginResponse>(
    '/api/v1/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    },
  );
  await storeTokens(tokens);
  return user;
}

/** 현재 세션(Access Token)에 로그인된 사용자 정보를 조회한다. */
export function getCurrentUser(): Promise<AuthUserResponse> {
  return request<AuthUserResponse>('/api/v1/auth/me', {
    method: 'GET',
  });
}

/** 저장된 Refresh Token을 서버에서 폐기하고, 로컬 토큰도 모두 삭제한다. */
export async function logout(): Promise<void> {
  try {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      await request<void>('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        skipAuth: true,
      });
    }
  } finally {
    await clearSession();
  }
}

/**
 * 앱 시작 시 저장된 Refresh Token으로 세션 복원을 시도한다.
 * 저장된 토큰이 없거나 재발급/조회에 실패하면 null을 반환한다.
 */
export async function restoreSession(): Promise<AuthUserResponse | null> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export type SocialLoginRequest = {
  provider: SocialType;
  providerToken: string;
};

export type SocialSignupRequest = SocialLoginRequest & {
  name: string;
  email: string;
};

/**
 * 소셜 로그인 토큰으로 로그인을 요청한다. 기존 회원이면 로그인에 성공하고,
 * 신규 회원이면 서버가 `SOCIAL_MEMBER_NOT_FOUND` 코드의 에러를 반환한다.
 * ⚠️ 백엔드 Auth API 명세에 소셜 로그인 엔드포인트가 아직 없어 경로/응답 형태는 가정치다.
 */
export function socialLogin(
  payload: SocialLoginRequest,
): Promise<AuthUserResponse> {
  return request<AuthUserResponse>('/api/v1/auth/social/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

/**
 * 소셜 프로필 기반 간편 회원가입을 요청한다.
 * ⚠️ 백엔드 Auth API 명세에 소셜 회원가입 엔드포인트가 아직 없어 경로/응답 형태는 가정치다.
 */
export function socialSignup(
  payload: SocialSignupRequest,
): Promise<AuthUserResponse> {
  return request<AuthUserResponse>('/api/v1/auth/social/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}
