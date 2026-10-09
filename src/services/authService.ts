import { ApiError, clearSession, request, storeTokens, TokenPair } from './apiClient';

export class SocialAuthParseError extends Error {}
import * as tokenStorage from './tokenStorage';
import { SocialType } from '../types/social';
import { clearCurrentUser, setCurrentUser } from '../types/session';
import { isSessionExpiredError } from '../constants/apiErrorMessages';
import type { LoginProvider } from '../types/session';

export type SignupAgreements = {
  termsOfService: boolean;
  privacyPolicy: boolean;
  ageOver14: boolean;
  marketing: boolean;
};

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
  agreements?: SignupAgreements;
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
  profileImageUrl?: string | null;
  loginProvider?: LoginProvider;
  createdAt?: string;
};

type LoginResponse = {
  user: AuthUserResponse;
  tokens: TokenPair;
};

export function signup(payload: SignupRequest): Promise<SignupResponse> {
  return request<SignupResponse>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

type SendEmailVerificationResponse = {
  email: string;
  expiresAt: string;
  expiresIn: number;
};

type ConfirmEmailVerificationResponse = {
  email: string;
  verified: boolean;
  verifiedAt: string;
};

export function sendEmailVerification(
  email: string,
): Promise<SendEmailVerificationResponse> {
  return request<SendEmailVerificationResponse>('/api/v1/auth/email-verifications', {
    method: 'POST',
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export async function confirmEmailVerification(
  email: string,
  code: string,
): Promise<ConfirmEmailVerificationResponse> {
  return request<ConfirmEmailVerificationResponse>(
    '/api/v1/auth/email-verifications/confirm',
    { method: 'POST', body: JSON.stringify({ email, code }), skipAuth: true },
  );
}

export function requestPasswordReset(email: string): Promise<void> {
  return request<void>('/api/v1/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
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
  loginProvider: LoginProvider;
  createdAt: string;
};

export async function updateMyProfile(
  payload: UpdateProfileInput,
): Promise<AuthUserResponse> {
  const response = await request<UpdateProfileResponse>('/api/v1/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  cacheCurrentUser(response);
  return response;
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(
  payload: ChangePasswordInput,
): Promise<void> {
  const refreshToken = await tokenStorage.getRefreshToken();
  await request<void>('/api/v1/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ ...payload, refreshToken }),
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

export async function withdraw(payload: WithdrawRequest): Promise<void> {
  await request<void>('/api/v1/auth/me', {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
  await clearSession();
  clearCurrentUser();
}

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

export type RestoredSession = 'signedIn' | 'signedOut' | 'unknown';

export async function restoreSession(): Promise<RestoredSession> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return 'signedOut';
  }
  try {
    await getCurrentUser();
    return 'signedIn';
  } catch (error) {
    if (isSessionExpiredError(error)) {
      await clearSession();
      clearCurrentUser();
      return 'signedOut';
    }
    return 'unknown';
  }
}

const SOCIAL_PROVIDER_API_VALUE: Record<SocialType, string> = {
  Kakao: 'KAKAO',
  Naver: 'NAVER',
  Google: 'GOOGLE',
};

export type SocialLoginRequest = {
  provider: SocialType;
  providerToken: string;
};

export type SocialSignupRequest = SocialLoginRequest & {
  name: string;
  agreements: SignupAgreements;
};

type SocialLoginResponse = {
  status: string;
  login: LoginResponse | null;
  email: string;
};

export async function socialLogin(
  payload: SocialLoginRequest,
): Promise<AuthUserResponse> {
  const response = await request<SocialLoginResponse>('/api/v1/auth/social/login', {
    method: 'POST',
    body: JSON.stringify({
      provider: SOCIAL_PROVIDER_API_VALUE[payload.provider],
      token: payload.providerToken,
    }),
    skipAuth: true,
  });
  if (!response.login) {
    throw new ApiError('SOCIAL_MEMBER_NOT_FOUND', '가입되지 않은 소셜 계정이에요.');
  }
  try {
    await storeTokens(response.login.tokens);
    cacheCurrentUser(response.login.user);
  } catch {
    throw new SocialAuthParseError('소셜 로그인 응답 처리에 실패했습니다.');
  }
  return response.login.user;
}

export async function socialSignup(
  payload: SocialSignupRequest,
): Promise<AuthUserResponse> {
  const response = await request<LoginResponse>('/api/v1/auth/social/signup', {
    method: 'POST',
    body: JSON.stringify({
      provider: SOCIAL_PROVIDER_API_VALUE[payload.provider],
      token: payload.providerToken,
      name: payload.name,
      agreements: payload.agreements,
    }),
    skipAuth: true,
  });
  try {
    await storeTokens(response.tokens);
    cacheCurrentUser(response.user);
  } catch {
    throw new SocialAuthParseError('소셜 가입 응답 처리에 실패했습니다.');
  }
  return response.user;
}
