declare module 'react-native-config' {
  export interface NativeConfig {
    KAKAO_NATIVE_APP_KEY: string;
    NAVER_CLIENT_ID: string;
    NAVER_CLIENT_SECRET: string;
    GOOGLE_WEB_CLIENT_ID: string;
    API_BASE_URL: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
