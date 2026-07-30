export type SocialType = 'Naver' | 'Kakao' | 'Google';

/** 소셜 로그인 SDK로부터 얻은 정보를 화면 간에 전달하기 위해 정규화한 형태. */
export type SocialProfile = {
  provider: SocialType;
  providerToken: string;
  name: string;
  email: string;
};
