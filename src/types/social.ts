export type SocialType = 'Naver' | 'Kakao' | 'Google';

export type SocialProfile = {
  provider: SocialType;
  providerToken: string;
  name: string;
  email: string;
};
