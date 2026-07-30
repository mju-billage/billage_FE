import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import SocialIconButton from '../components/SocialIconButton';
import LabeledTextInput from '../components/LabeledTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { SocialProfile, SocialType } from '../types/social';
import { ApiError } from '../services/apiClient';
import * as authService from '../services/authService';
import * as socialAuthService from '../services/socialAuthService';
import {
  LOGIN_EMAIL_PLACEHOLDER,
  LOGIN_PASSWORD_PLACEHOLDER,
  LOGIN_SUBMIT_LABEL,
  LOGIN_FIND_PASSWORD_LABEL,
  LOGIN_GO_TO_SIGNUP_LABEL,
  LOGIN_INVALID_CREDENTIALS_ERROR,
  LOGIN_GENERIC_ERROR,
  LOGIN_SOCIAL_ERROR,
  LOGIN_MOCK_BUTTON_LABEL,
} from '../constants/loginScreenText';

type LoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

/** 로그인 화면: 이메일/비밀번호 로그인과 소셜 로그인 진입점을 보여준다. */
function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToMain = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const performLogin = async (credentials: authService.LoginRequest) => {
    setLoginError(undefined);
    setIsSubmitting(true);
    try {
      await authService.login(credentials);
      goToMain();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'INVALID_CREDENTIALS') {
        setLoginError(LOGIN_INVALID_CREDENTIALS_ERROR);
      } else {
        setLoginError(LOGIN_GENERIC_ERROR);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => performLogin({ email, password });

  /** 백엔드 연동 없이 프론트 화면 흐름만 확인하기 위해 곧바로 메인 화면으로 이동한다. */
  const handleMockLogin = () => {
    goToMain();
  };

  const handleSocialLogin = async (provider: SocialType) => {
    setLoginError(undefined);
    try {
      const profile = await getSocialProfile(provider);
      if (!profile) {
        return; // 사용자가 로그인을 취소함
      }

      try {
        await authService.socialLogin({
          provider: profile.provider,
          providerToken: profile.providerToken,
        });
        goToMain();
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.code === 'SOCIAL_MEMBER_NOT_FOUND'
        ) {
          navigation.navigate('SocialSignupInfo', { profile });
        } else {
          setLoginError(LOGIN_GENERIC_ERROR);
        }
      }
    } catch {
      setLoginError(LOGIN_SOCIAL_ERROR);
    }
  };

  const getSocialProfile = (
    provider: SocialType,
  ): Promise<SocialProfile | null> => {
    if (provider === 'Kakao') {
      return socialAuthService.loginWithKakao();
    }
    if (provider === 'Naver') {
      return socialAuthService.loginWithNaver();
    }
    return socialAuthService.loginWithGoogle();
  };

  const handleFindPassword = () => {
    navigation.navigate('PasswordReset');
  };

  const handleGoToSignup = () => {
    navigation.navigate('TermsAgreement');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/Billage_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.form}>
        <LabeledTextInput
          value={email}
          onChangeText={text => {
            setEmail(text);
            setLoginError(undefined);
          }}
          placeholder={LOGIN_EMAIL_PLACEHOLDER}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <LabeledTextInput
          value={password}
          onChangeText={text => {
            setPassword(text);
            setLoginError(undefined);
          }}
          placeholder={LOGIN_PASSWORD_PLACEHOLDER}
          secureTextEntry
          error={loginError}
        />
      </View>

      <PrimaryButton
        label={LOGIN_SUBMIT_LABEL}
        onPress={handleLogin}
        disabled={isSubmitting}
      />

      <View style={styles.linkRow}>
        <Pressable onPress={handleFindPassword}>
          <Text style={styles.linkText}>{LOGIN_FIND_PASSWORD_LABEL}</Text>
        </Pressable>
        <Pressable onPress={handleGoToSignup}>
          <Text style={styles.linkText}>{LOGIN_GO_TO_SIGNUP_LABEL}</Text>
        </Pressable>
      </View>

      <View style={styles.socialRow}>
        <SocialIconButton
          type="Kakao"
          onPress={() => handleSocialLogin('Kakao')}
        />
        <SocialIconButton
          type="Naver"
          onPress={() => handleSocialLogin('Naver')}
        />
        <SocialIconButton
          type="Google"
          onPress={() => handleSocialLogin('Google')}
        />
      </View>

      {__DEV__ && (
        <View style={styles.mockLoginRow}>
          <PrimaryButton
            label={LOGIN_MOCK_BUTTON_LABEL}
            onPress={handleMockLogin}
            disabled={isSubmitting}
            variant="secondary"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  logo: {
    width: 140,
    marginBottom: 48,
  },
  form: {
    width: '100%',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
  },
  linkText: {
    fontSize: 13,
    color: '#4A4A4A',
    textDecorationLine: 'underline',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 40,
  },
  mockLoginRow: {
    width: '100%',
    marginTop: 24,
  },
});

export default LoginScreen;
