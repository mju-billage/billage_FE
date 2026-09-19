import { ApiError, clearSession, request, storeTokens, TokenPair } from './apiClient';

/** 소셜 로그인/가입 응답을 받은 뒤(=네트워크·서버 단계는 이미 통과) 토큰 저장/캐싱
 * 과정에서 터진 에러 전용 마커. `TypeError`(네트워크 실패와 같은 타입)와 구분하기
 * 위해 별도 클래스로 던진다 — `LoginScreen.tsx`가 이 타입으로 "파싱 실패"만 골라낸다. */
export class SocialAuthParseError extends Error {}
import * as tokenStorage from './tokenStorage';
import { SocialType } from '../types/social';
import { clearCurrentUser, setCurrentUser } from '../types/session';
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

/** Swagger 기준, 실호출 미검증(2026-09-17) — 발송 API가 `MAIL_SEND_FAILED(500)`로
 * 막혀 있어 이 응답 모양을 실제로 받아본 적은 없다. 서버 복구 후 재검증 전까지
 * 화면 로직을 `expiresAt`/`expiresIn`에 의존시키지 마라 — 이 프로젝트에서
 * Swagger가 실제 응답과 다른 전례가 있었다(예: `confirmEmailVerification` 응답의
 * `verificationToken` 필드가 명세엔 있었지만 실제론 없었음). */
type SendEmailVerificationResponse = {
  email: string;
  expiresAt: string;
  expiresIn: number;
};

/** Swagger 기준, 실호출 미검증(2026-09-17) — 위와 같은 이유로 타입만 맞춰둔다. */
type ConfirmEmailVerificationResponse = {
  email: string;
  verified: boolean;
  verifiedAt: string;
};

/**
 * 이메일 인증 코드를 발송한다(최초 발송/재전송 공용 — 재전송도 같은 엔드포인트,
 * 서버가 이전 코드를 폐기하고 타이머를 리셋한다).
 *
 * **2026-09-11 Swagger 대조로 경로 정정**: 명세 `Auth.txt` 6번은 `/auth/email/verification`
 * 이라 적혀 있었지만 실제 서버 경로는 `/auth/email-verifications`다(복수형,
 * 하이픈) — 예전 경로로는 인증 필터에 걸려 `401`이 났다(서버 미구현으로
 * 오판되기 쉬운 형태). 실호출로 새 경로가 실제 컨트롤러에 도달함을 확인했다
 * (`MAIL_SEND_FAILED` 500 — 개발 서버 메일 발송 설정 문제로 보이며, 라우팅
 * 자체는 정상).
 *
 * **2026-09-17 Swagger 재확보**: 요청 필드(`{email}`)·경로 둘 다 이미 일치했다
 * (이번에 새로 맞출 게 없었음). 응답 타입만 `{email, expiresAt, expiresIn}`으로
 * 추가했다 — 발송 자체가 막혀 있어 실호출 검증은 서버 복구 후.
 */
export function sendEmailVerification(
  email: string,
): Promise<SendEmailVerificationResponse> {
  return request<SendEmailVerificationResponse>('/api/v1/auth/email-verifications', {
    method: 'POST',
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

/**
 * 이메일 인증 코드를 검증한다.
 *
 * **2026-09-11 Swagger 대조로 경로·응답 정정**: 경로는 `/auth/email-verifications/confirm`
 * (위 발송 함수와 동일한 정정). 응답도 예전 가정(`{verificationToken}`)과 달리
 * `{email, verified, verifiedAt}`이다 — 검증 성공 후 회원가입에 실어 보낼 토큰
 * 자체가 없다(`POST /auth/signup` 요청 스키마에도 `verificationToken` 필드가
 * 없음, 실제로는 서버가 이메일 기준으로 인증 여부를 자체 추적하는 것으로 보임).
 *
 * **2026-09-17 Swagger 재확보**: 경로·요청 필드(`{email, code}`) 둘 다 이미 일치.
 * 응답 타입을 `{email, verified, verifiedAt}`으로 반영했지만, 발송이 막혀 있어
 * 인증 코드 자체를 받을 수 없으니 이 응답도 실호출 미검증이다 — 그래서 호출부는
 * 여전히 성공/실패(reject 여부)만 보고, `verified` 값으로 분기하지 않는다.
 */
export async function confirmEmailVerification(
  email: string,
  code: string,
): Promise<ConfirmEmailVerificationResponse> {
  return request<ConfirmEmailVerificationResponse>(
    '/api/v1/auth/email-verifications/confirm',
    { method: 'POST', body: JSON.stringify({ email, code }), skipAuth: true },
  );
}

/** 서버 미확인 — **2026-09-13 재확인, 여전히 401.** 명세 Auth.txt 9번 기준. 임시
 * 비밀번호를 이메일로 발송한다(재설정 링크 방식이 아니다) — 가입 여부·소셜 계정
 * 여부와 무관하게 항상 204가 온다(정책 메모, 계정 존재 노출 방지)는 게 명세 상 기대
 * 동작이다. 호출부는 `PasswordResetScreen.tsx`(비밀번호 찾기 화면) — 죽은 코드
 * 아니다.
 *
 * ⚠️ **백엔드 노티(2026-09-06)가 "마이페이지 3종 구현 완료"라고 해서 이 엔드포인트도
 * 됐는지 실호출로 확인했는데 여전히 안 됐다** — `POST /auth/password/reset`을
 * `skipAuth`로(토큰 자체를 아예 안 붙이고) 호출해도 `401 UNAUTHORIZED`("인증이
 * 필요합니다")가 온다 — 클라이언트 인터셉터가 토큰을 몰래 붙이는 문제가 아니라
 * (그랬다면 애초에 토큰 없이 호출한 이 테스트에서도 401이 안 나왔어야 함),
 * 라우트 자체가 없어 전역 인증 필터로 떨어지는 것으로 보인다 — `API_swagger.txt`에도
 * 이 경로가 없다(`PATCH /auth/password`만 있음, 그건 로그인 후 "비밀번호 변경"이지
 * 이 "비밀번호 재설정"과 다른 API다). `email-verifications` 예전 경로 오류와 같은
 * 패턴. `docs/backend-requests.md`에 재확인 요청으로 다시 올렸다. */
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
  loginProvider: LoginProvider;
  createdAt: string;
};

/**
 * 명세 `User (사용자).txt` 2번(`PATCH /api/v1/users/me` — 문서 상단 경로 정정에
 * 따라 실제로는 `/api/v1/auth/me`) 기준 작성. 2026-09-06 시점엔 "서버 미구현"
 * 이었으나 이후 확인대로 구현돼 있다.
 *
 * `Group.txt`의 `groupImageFileId`와 같은 3-state 규칙: `profileImageFileId`를
 * 안 보내면 유지, `null`이면 기본 아바타로 초기화, 값이면 교체.
 *
 * **2026-09-12 실호출로 정정**: 예전엔 "응답에 `loginProvider`/`createdAt`이
 * 없어 캐시값을 이어붙인다"고 가정했는데 틀렸다 — 이름만 바꿨다 되돌리는
 * 실호출로 확인해보니 응답에 **둘 다 실제로 온다**(`{userId,email,name,
 * profileImageUrl,loginProvider,createdAt}`). 캐시 이어붙이기를 없애고
 * 응답값을 그대로 쓰도록 고쳤다 — 예전 방식은 크래시는 안 났지만(캐시에
 * 이미 같은 값이 있어서) 캐시가 비어있는 예외적인 순간엔 `undefined`가 됐을
 * 잠재 버그였다.
 */
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

/**
 * 명세 `Auth (인증).txt` 10번 기준. 성공(204)하면 이 기기의 Refresh Token을
 * 제외한 나머지가 서버에서 폐기된다(정책 메모) — 그래서 이 기기 자체는
 * 재로그인이 필요 없다.
 *
 * **2026-09-11 Swagger 대조로 필드 추가**: 요청 바디에 `refreshToken`이
 * 정식으로 포함된다("현재 기기를 제외"하려면 서버가 어느 기기인지 알아야
 * 하므로 앞뒤가 맞는다) — 예전엔 이 필드를 안 보내고 있었다.
 */
export async function changePassword(
  payload: ChangePasswordInput,
): Promise<void> {
  const refreshToken = await tokenStorage.getRefreshToken();
  await request<void>('/api/v1/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ ...payload, refreshToken }),
  });
}

/**
 * Swagger 예시엔 `USAGE_UNCLEAR` 하나만 나온다 — 나머지 4개는 화면 시안의 체크박스
 * 문구를 보고 추정한 값이다(2026-09-11, 실제 enum 목록을 400 에러로 유도해봤지만
 * 서버가 상세를 안 실어줘 확인 못 함, `docs/backend-requests.md` 4순위 참고).
 * 서버가 실제 값을 다르게 쓰면 이 5개 다 갈아 끼워야 할 수 있다.
 */
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
 * 명세 `Auth (인증).txt` 11번 기준 작성. **2026-09-13 백엔드 노티로 구현 완료 확인**
 * — `API_swagger.txt`에도 `DELETE /api/v1/auth/me`가 이 바디 스키마
 * (`ownershipTransfers`/`reasons`/`reasonDetail`) 그대로 등록돼 있다. **실호출로는
 * 검증하지 않았다** — 계정이 실제로 삭제될 위험이 있는 destructive 엔드포인트라
 * 실제로 호출해 확인하지 말라는 지침에 따랐다(Swagger 스키마 일치만으로 판단).
 * "서버 미구현(2026-09-06 기준)" 표기는 낡은 정보였다.
 *
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

/** 서버가 받는 `provider` 값. 앱 내부 표기(`SocialType`, `Kakao`)와 달리 **대문자만** 통과한다 —
 * 2026-09-20 실호출: `KAKAO`/`GOOGLE`은 토큰 검증(401 `SOCIAL_TOKEN_INVALID`)까지 가고 `Kakao` 같은
 * 표기는 400 `INVALID_REQUEST`. `NAVER`는 어떤 표기로도 400(서버 지원 여부 확인 요청 중,
 * `docs/backend-requests.md`). 소셜 요청 바디를 만들 때는 반드시 이 매핑을 거친다. */
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
  /** 필수 약관(서비스 이용약관·개인정보 처리방침·만 14세 이상)에 모두 동의했는가. 서버는 `true`가 아니면
   * 400 `INVALID_REQUEST`(`fieldErrors: termsAgreed`)를 준다. */
  termsAgreed: boolean;
};

type SocialLoginResponse = {
  status: string;
  login: LoginResponse | null;
  email: string;
};

/**
 * 소셜 로그인 토큰으로 로그인을 요청한다.
 *
 * **2026-09-11 Swagger 대조로 정정** — 이전엔 응답이 `login()`과 같은
 * `{user, tokens}`라고 가정해 토큰을 저장하지 않고 있었다(실제로 로그인이 안
 * 되고 있었다는 뜻). 실제 스키마는 `{status, login: {user, tokens} | null,
 * email}`이다 — `login`이 있으면 정상 로그인과 동일하게 토큰을 저장한다.
 * 바디 필드명도 `providerToken`이 아니라 `token`이다(고침).
 *
 * `login`이 없는 경우(신규 회원으로 추정)의 실제 동작은 실호출로 검증 못 했다
 * (실제 소셜 프로바이더 토큰이 있어야 호출 가능) — 기존 코드가 의존하던
 * `SOCIAL_MEMBER_NOT_FOUND` 에러 코드 분기(`LoginScreen.tsx`)를 그대로 살리기
 * 위해, `login`이 없으면 같은 코드의 `ApiError`를 여기서 던져 호출부 로직을
 * 안 건드리게 했다 — 실제로 서버가 에러 대신 이 필드로만 신호를 준다면
 * 호출부도 같이 고쳐야 한다.
 */
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
    // 서버가 내려준 에러 코드가 아니라 클라이언트가 만든 값이다 — `login`이 없는 응답을
    // 기존 `LoginScreen`의 분기(`SOCIAL_MEMBER_NOT_FOUND`)에 맞추려고 여기서 합성한다.
    // 서버의 실제 코드는 미확정(실제 소셜 토큰이 필요해 실호출로 검증 못 함).
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

/**
 * 소셜 프로필 기반 간편 회원가입을 요청한다.
 *
 * **2026-09-11 Swagger 대조로 정정**: 응답이 `login()`과 같은 `{user, tokens}`라
 * 가입과 동시에 로그인된다 — 이전엔 이걸 저장 안 해 가입 직후 세션이 없었다.
 * 바디 필드명도 `providerToken`→`token`으로, `email`은 스키마에 없어 뺐다.
 *
 * **2026-09-20**: `termsAgreed`(필수)를 실어 보낸다 — 신규 소셜 가입은 소셜 인증 → 약관동의
 * (`TermsAgreementScreen`) → 간편 가입 정보 입력 순이고, 약관동의 화면이 필수 3종을 모두 체크해야
 * 다음으로 넘어가므로 그 결과를 호출부(`SocialSignupInfoScreen`)가 넘긴다. 없거나 `false`면 서버가
 * 400을 준다(실호출 확인).
 */
export async function socialSignup(
  payload: SocialSignupRequest,
): Promise<AuthUserResponse> {
  const response = await request<LoginResponse>('/api/v1/auth/social/signup', {
    method: 'POST',
    body: JSON.stringify({
      provider: SOCIAL_PROVIDER_API_VALUE[payload.provider],
      token: payload.providerToken,
      name: payload.name,
      termsAgreed: payload.termsAgreed,
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
