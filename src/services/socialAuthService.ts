import {
  login as kakaoLogin,
  getProfile as getKakaoProfile,
} from '@react-native-seoul/kakao-login';
import NaverLogin from '@react-native-seoul/naver-login';
import {
  GoogleSignin,
  isSuccessResponse,
  isCancelledResponse,
} from '@react-native-google-signin/google-signin';
import { SocialProfile } from '../types/social';

/** 카카오 로그인을 진행하고 정규화된 프로필을 반환한다. 사용자가 취소하면 null을 반환한다. */
export async function loginWithKakao(): Promise<SocialProfile | null> {
  try {
    const token = await kakaoLogin();
    const profile = await getKakaoProfile();
    return {
      provider: 'Kakao',
      providerToken: token.accessToken,
      name: profile.nickname,
      email: profile.email,
    };
  } catch (error) {
    if (isKakaoCancelError(error)) {
      return null;
    }
    throw error;
  }
}

/** 네이버 로그인을 진행하고 정규화된 프로필을 반환한다. 사용자가 취소하면 null을 반환한다. */
export async function loginWithNaver(): Promise<SocialProfile | null> {
  const result = await NaverLogin.login();

  if (!result.isSuccess || !result.successResponse) {
    if (result.failureResponse?.isCancel) {
      return null;
    }
    throw new Error(
      result.failureResponse?.message ?? '네이버 로그인에 실패했습니다.',
    );
  }

  const { accessToken } = result.successResponse;
  const profileResponse = await NaverLogin.getProfile(accessToken);
  return {
    provider: 'Naver',
    providerToken: accessToken,
    name: profileResponse.response.name,
    email: profileResponse.response.email,
  };
}

/** 구글 로그인을 진행하고 정규화된 프로필을 반환한다. 사용자가 취소하면 null을 반환한다. */
export async function loginWithGoogle(): Promise<SocialProfile | null> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (isCancelledResponse(response)) {
    return null;
  }
  if (!isSuccessResponse(response) || !response.data.idToken) {
    throw new Error('구글 로그인 응답에서 idToken을 받지 못했습니다.');
  }

  return {
    provider: 'Google',
    providerToken: response.data.idToken,
    name: response.data.user.name ?? '',
    email: response.data.user.email,
  };
}

/** 카카오 SDK는 취소 시 문서화된 에러 코드가 없어 메시지 패턴으로 판별한다. */
function isKakaoCancelError(error: unknown): boolean {
  return error instanceof Error && /cancel/i.test(error.message);
}
