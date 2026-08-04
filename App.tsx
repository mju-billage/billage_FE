/**
 * @format
 */

import Config from 'react-native-config';
import NaverLogin from '@react-native-seoul/naver-login';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import RootNavigator from './src/navigation/RootNavigator';

// 카카오는 android/app/build.gradle이 생성하는 strings.xml(kakao_app_key)로
// 네이티브 SDK가 자동 초기화되므로 별도의 JS 초기화 호출이 없다.
NaverLogin.initialize({
  appName: 'Billage',
  consumerKey: Config.NAVER_CLIENT_ID,
  consumerSecret: Config.NAVER_CLIENT_SECRET,
});

GoogleSignin.configure({ webClientId: Config.GOOGLE_WEB_CLIENT_ID });

function App() {
  return <RootNavigator />;
}

export default App;
