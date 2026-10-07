import Config from 'react-native-config';
import NaverLogin from '@react-native-seoul/naver-login';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import RootNavigator from './src/navigation/RootNavigator';

NaverLogin.initialize({
  appName: 'Billage',
  consumerKey: Config.NAVER_CLIENT_ID,
  consumerSecret: Config.NAVER_CLIENT_SECRET,
});

GoogleSignin.configure({ webClientId: Config.GOOGLE_WEB_CLIENT_ID });

function App() {
  return (
    <KeyboardProvider>
      <RootNavigator />
    </KeyboardProvider>
  );
}

export default App;
