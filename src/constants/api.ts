import Config from 'react-native-config';

/** .env의 API_BASE_URL을 못 읽으면(설정 누락) 개발 서버로 폴백한다. */
const FALLBACK_API_BASE_URL = 'https://52-78-148-114.nip.io';

export const API_BASE_URL = Config.API_BASE_URL || FALLBACK_API_BASE_URL;
