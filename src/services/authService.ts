import { request } from './apiClient';

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
