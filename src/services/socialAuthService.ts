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

export async function loginWithKakao(): Promise<SocialProfile | null> {
  try {
    const token = await kakaoLogin();
    console.warn('[SocialLogin][SDK][Kakao] token 수신', {
      hasAccessToken: !!token.accessToken,
    });
    const profile = await getKakaoProfile();
    console.warn('[SocialLogin][SDK][Kakao] profile 수신', {
      hasEmail: !!profile.email,
      hasNickname: !!profile.nickname,
    });
    return {
      provider: 'Kakao',
      providerToken: token.accessToken,
      name: profile.nickname,
      email: profile.email,
    };
  } catch (error) {
    if (isKakaoCancelError(error)) {
      console.warn('[SocialLogin][SDK][Kakao] 사용자 취소');
      return null;
    }
    console.warn('[SocialLogin][SDK][Kakao] 실패', error);
    throw error;
  }
}

export async function loginWithNaver(): Promise<SocialProfile | null> {
  const result = await NaverLogin.login();
  console.warn('[SocialLogin][SDK][Naver] login 결과', {
    isSuccess: result.isSuccess,
    isCancel: result.failureResponse?.isCancel,
    failureMessage: result.failureResponse?.message,
  });

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
  console.warn('[SocialLogin][SDK][Naver] profile 수신', {
    hasEmail: !!profileResponse.response.email,
    hasName: !!profileResponse.response.name,
  });
  return {
    provider: 'Naver',
    providerToken: accessToken,
    name: profileResponse.response.name,
    email: profileResponse.response.email,
  };
}

export async function loginWithGoogle(): Promise<SocialProfile | null> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  console.warn('[SocialLogin][SDK][Google] signIn 결과', {
    cancelled: isCancelledResponse(response),
    success: isSuccessResponse(response),
    hasIdToken: isSuccessResponse(response) ? !!response.data.idToken : false,
  });

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

function isKakaoCancelError(error: unknown): boolean {
  return error instanceof Error && /cancel/i.test(error.message);
}
