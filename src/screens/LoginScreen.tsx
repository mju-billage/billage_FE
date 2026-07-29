import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import SocialIconButton from '../components/SocialIconButton';
import LabeledTextInput from '../components/LabeledTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { SocialType } from '../types/social';
import { ApiError } from '../services/apiClient';
import * as authService from '../services/authService';
import {
  LOGIN_EMAIL_PLACEHOLDER,
  LOGIN_PASSWORD_PLACEHOLDER,
  LOGIN_SUBMIT_LABEL,
  LOGIN_FIND_PASSWORD_LABEL,
  LOGIN_GO_TO_SIGNUP_LABEL,
  LOGIN_INVALID_CREDENTIALS_ERROR,
  LOGIN_GENERIC_ERROR,
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

  const handleLogin = async () => {
    setLoginError(undefined);
    setIsSubmitting(true);
    try {
      await authService.login({ email, password });
      // TODO: 로그인 성공 후 진입할 홈 화면이 아직 없어 이동 로직은 추후 연결
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

  const handleSocialLogin = (provider: SocialType) => {
    // TODO: 소셜 로그인 API 연동 필요 (기존 회원이면 바로 로그인, 신규 회원이면 간편 회원가입으로 진입)
    navigation.navigate('SocialSignupInfo', { provider });
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
});

export default LoginScreen;
