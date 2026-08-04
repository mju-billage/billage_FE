import { request } from './apiClient';
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

/** 이메일 회원가입을 요청한다. */
export function signup(payload: SignupRequest): Promise<SignupResponse> {
  return request<SignupResponse>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** 이메일/비밀번호로 로그인을 요청한다. */
export function login(payload: LoginRequest): Promise<AuthUserResponse> {
  return request<AuthUserResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** 현재 세션에 로그인된 사용자 정보를 조회한다. */
export function getCurrentUser(): Promise<AuthUserResponse> {
  return request<AuthUserResponse>('/api/v1/auth/me', {
    method: 'GET',
  });
}

/** 로그아웃하고 세션을 종료한다. */
export function logout(): Promise<void> {
  return request<void>('/api/v1/auth/logout', {
    method: 'POST',
  });
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
 * (백엔드 엔드포인트/에러 코드는 아직 확정 전인 가정치이므로 연동 시 재확인이 필요하다.)
 */
export function socialLogin(
  payload: SocialLoginRequest,
): Promise<AuthUserResponse> {
  return request<AuthUserResponse>('/api/v1/auth/social/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** 소셜 프로필 기반 간편 회원가입을 요청한다. (엔드포인트는 백엔드 확정 전인 가정치) */
export function socialSignup(
  payload: SocialSignupRequest,
): Promise<AuthUserResponse> {
  return request<AuthUserResponse>('/api/v1/auth/social/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
