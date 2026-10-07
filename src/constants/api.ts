import Config from 'react-native-config';

const FALLBACK_API_BASE_URL = 'https://220-66-233-75.nip.io';

export const API_BASE_URL = Config.API_BASE_URL || FALLBACK_API_BASE_URL;
