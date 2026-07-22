import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import { useState } from 'react';
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/** 앱 진입점 내비게이터: 로딩 중엔 스플래시를, 이후엔 로그인/회원가입 스택을 보여준다. */
function RootNavigator() {
  // TODO: 스플래시 로딩 상태 연동 필요
  const [isLoading, _setIsLoading] = useState(false);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
