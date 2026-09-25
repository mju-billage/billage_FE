/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

if (__DEV__) {
  // 개발 모드 LogBox 알림 배너("Open debugger to view warnings.")가 화면 하단을 가려
  // 화면 확인을 방해한다. 콘솔 경고 자체는 Metro 터미널에 그대로 남는다.
  LogBox.ignoreAllLogs(true);
}

AppRegistry.registerComponent(appName, () => App);
