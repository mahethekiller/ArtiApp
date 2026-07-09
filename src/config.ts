import { Platform } from 'react-native';

export const CONFIG = {
  // 10.0.2.2 is Android's bridge to host localhost. iOS can use localhost/127.0.0.1.
  // Update this URL with your local development machine IP if testing on physical devices.
  API_URL: Platform.select({
    android: 'http://192.168.1.5:8000/api/arti',
    ios: 'http://192.168.1.5:8000/api/arti',
    default: 'http://192.168.1.5:8000/api/arti',
  }),
  // When enabled, the app will use mock data when the Laravel backend is unreachable
  FALLBACK_TO_MOCK: false,
};
