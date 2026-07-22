import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import { useState } from 'react';
import LoginScreen from '../screens/LoginScreen';
import TermsAgreementScreen from '../screens/TermsAgreementScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import MarketingConsentScreen from '../screens/MarketingConsentScreen';
import SocialSignupInfoScreen from '../screens/SocialSignupInfoScreen';
import SignupInfoScreen from '../screens/SignupInfoScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import SignupCompleteScreen from '../screens/SignupCompleteScreen';
import PasswordResetScreen from '../screens/PasswordResetScreen';
import PasswordResetSentScreen from '../screens/PasswordResetSentScreen';
import { SocialType } from '../types/social';

export type RootStackParamList = {
  Login: undefined;
  TermsAgreement: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  MarketingConsent: undefined;
  SocialSignupInfo: { provider: SocialType };
  SignupInfo: undefined;
  EmailVerification: { email: string };
  SignupComplete: undefined;
  PasswordReset: undefined;
  PasswordResetSent: { email: string };
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
        <Stack.Screen name="TermsAgreement" component={TermsAgreementScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen
          name="MarketingConsent"
          component={MarketingConsentScreen}
        />
        <Stack.Screen
          name="SocialSignupInfo"
          component={SocialSignupInfoScreen}
        />
        <Stack.Screen name="SignupInfo" component={SignupInfoScreen} />
        <Stack.Screen
          name="EmailVerification"
          component={EmailVerificationScreen}
        />
        <Stack.Screen name="SignupComplete" component={SignupCompleteScreen} />
        <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
        <Stack.Screen
          name="PasswordResetSent"
          component={PasswordResetSentScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
