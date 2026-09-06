import { clearSession, request, storeTokens, TokenPair } from './apiClient';
import * as tokenStorage from './tokenStorage';
import { SocialType } from '../types/social';
import { clearCurrentUser, getCurrentUser as getCachedUser, setCurrentUser } from '../types/session';
import type { LoginProvider } from '../types/session';

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
  /** `GET /auth/me`(User.txt 1번, 서버 "진행 중")에만 오는 필드 — 로그인/회원가입
   * 응답엔 아직 없어 선택값으로 둔다. */
  profileImageUrl?: string | null;
  loginProvider?: LoginProvider;
  createdAt?: string;
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

function cacheCurrentUser(user: AuthUserResponse): void {
  setCurrentUser({
    userId: String(user.userId),
    name: user.name,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    loginProvider: user.loginProvider,
    createdAt: user.createdAt,
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
  cacheCurrentUser(user);
  return user;
}

/** 현재 세션(Access Token)에 로그인된 사용자 정보를 조회하고, 조회 결과를 캐시에 반영한다. */
export async function getCurrentUser(): Promise<AuthUserResponse> {
  const user = await request<AuthUserResponse>('/api/v1/auth/me', {
    method: 'GET',
  });
  cacheCurrentUser(user);
  return user;
}

export type UpdateProfileInput = {
  name?: string;
  profileImageFileId?: number | null;
};

type UpdateProfileResponse = {
  userId: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
};

/**
 * 서버 미구현(2026-09-06 기준, "진행 중"). 명세 `User (사용자).txt` 2번
 * (`PATCH /api/v1/users/me` — 문서 상단 경로 정정에 따라 실제로는
 * `/api/v1/auth/me`) 기준 작성.
 *
 * `Group.txt`의 `groupImageFileId`와 같은 3-state 규칙: `profileImageFileId`를
 * 안 보내면 유지, `null`이면 기본 아바타로 초기화, 값이면 교체. 응답에
 * `loginProvider`/`createdAt`이 없어 캐시의 기존 값을 이어붙인다.
 */
export async function updateMyProfile(
  payload: UpdateProfileInput,
): Promise<AuthUserResponse> {
  const response = await request<UpdateProfileResponse>('/api/v1/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  const existing = getCachedUser();
  const user: AuthUserResponse = {
    userId: response.userId,
    email: response.email,
    name: response.name,
    profileImageUrl: response.profileImageUrl,
    loginProvider: existing?.loginProvider,
    createdAt: existing?.createdAt,
  };
  cacheCurrentUser(user);
  return user;
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

/**
 * 서버 미구현(2026-09-06 기준). 명세 `Auth (인증).txt` 10번 기준 작성.
 * 성공(204)하면 현재 기기를 제외한 Refresh Token이 서버에서 폐기된다(정책
 * 메모) — 이 기기 자체는 재로그인이 필요 없다.
 */
export async function changePassword(
  payload: ChangePasswordInput,
): Promise<void> {
  await request<void>('/api/v1/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export type WithdrawReasonCode =
  | 'USAGE_UNCLEAR'
  | 'REJOIN'
  | 'MISSING_FEATURE'
  | 'NO_LONGER_NEEDED'
  | 'ETC';

export type WithdrawRequest = {
  ownershipTransfers: { groupId: number; newOwnerUserId: number }[];
  reasons: WithdrawReasonCode[];
  reasonDetail?: string;
};

/**
 * 서버 미구현(2026-09-06 기준). 명세 `Auth (인증).txt` 11번 기준 작성.
 * 권한 이전과 계정 삭제가 한 트랜잭션으로 처리된다 — 유일한 총무인 모임이
 * 있으면 `ownershipTransfers`를 빠짐없이 채워야 `OWNER_TRANSFER_REQUIRED (409)`를
 * 피한다. 성공(204) 후에는 이 기기의 로컬 세션도 정리해야 하므로 호출부에서
 * `logout()`과 같은 뒷정리(토큰/캐시 삭제)를 이어서 해야 한다.
 */
export async function withdraw(payload: WithdrawRequest): Promise<void> {
  await request<void>('/api/v1/auth/me', {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
  await clearSession();
  clearCurrentUser();
}

/** 저장된 Refresh Token을 서버에서 폐기하고, 로컬 토큰과 사용자 캐시도 모두 삭제한다. */
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
    clearCurrentUser();
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
