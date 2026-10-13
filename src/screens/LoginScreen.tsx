import { useCallback, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import TextField from '../components/Input/Text Field/TextField';
import Button from '../components/Input/Button/Button';
import TextButton from '../components/Input/Button/TextButton';
import Snackbar from '../components/Feedback/Snackbar/Snackbar';
import ScreenContainer from '../components/Layout/ScreenContainer';
import { SocialProfile, SocialType } from '../types/social';
import { ApiError } from '../services/apiClient';
import * as authService from '../services/authService';
import { SocialAuthParseError } from '../services/authService';
import * as socialAuthService from '../services/socialAuthService';
import {
  getApiErrorMessage,
  isNetworkError,
  toUserErrorMessage,
} from '../constants/apiErrorMessages';
import {
  LOGIN_EMAIL_PLACEHOLDER,
  LOGIN_PASSWORD_PLACEHOLDER,
  LOGIN_SUBMIT_LABEL,
  LOGIN_FIND_PASSWORD_LABEL,
  LOGIN_GO_TO_SIGNUP_LABEL,
  LOGIN_INVALID_CREDENTIALS_ERROR,
  LOGIN_GENERIC_ERROR,
  LOGIN_SOCIAL_SDK_ERROR,
  LOGIN_SOCIAL_NETWORK_ERROR,
  LOGIN_SOCIAL_PARSE_ERROR,
  LOGIN_MOCK_BUTTON_LABEL,
} from '../constants/loginScreenText';

type LoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;
type LoginRouteProp = RouteProp<RootStackParamList, 'Login'>;

const LOGO_SYMBOL = require('../assets/images/Billage_simbol_big.png');
const LOGO_WORDMARK = require('../assets/images/Billage_logo.png');

const SOCIAL_CIRCLE_SIZE = 40;

const SOCIAL_ICON_BY_TYPE: Record<SocialType, ImageSourcePropType> = {
  Kakao: require('../assets/images/KaKao.png'),
  Naver: require('../assets/images/Naver.png'),
  Google: require('../assets/images/Google.png'),
};

const SOCIAL_ACCESSIBILITY_LABEL_BY_TYPE: Record<SocialType, string> = {
  Kakao: '카카오로 로그인',
  Naver: '네이버로 로그인',
  Google: '구글로 로그인',
};

function SocialLoginBadge({
  type,
  onPress,
}: {
  type: SocialType;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        socialBadgeStyles.circle,
        pressed && socialBadgeStyles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={SOCIAL_ACCESSIBILITY_LABEL_BY_TYPE[type]}
    >
      <Image
        source={SOCIAL_ICON_BY_TYPE[type]}
        style={socialBadgeStyles.icon}
        resizeMode="contain"
      />
    </Pressable>
  );
}

const socialBadgeStyles = StyleSheet.create({
  circle: {
    width: SOCIAL_CIRCLE_SIZE,
    height: SOCIAL_CIRCLE_SIZE,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.5,
  },
});

function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const route = useRoute<LoginRouteProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.snackbarMessage) {
        const message = route.params.snackbarMessage;
        setSnackbarMessage(message);
        navigation.setParams({ snackbarMessage: undefined });
        setTimeout(() => setSnackbarMessage(null), 1600);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params?.snackbarMessage]),
  );

  const goToMain = () => {
    navigation.reset({ index: 0, routes: [{ name: 'PostLogin' }] });
  };

  const performLogin = async (credentials: authService.LoginRequest) => {
    if (isSubmitting) {
      return;
    }
    setLoginError(undefined);
    setIsSubmitting(true);
    try {
      await authService.login(credentials);
      goToMain();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'INVALID_CREDENTIALS') {
        setLoginError(LOGIN_INVALID_CREDENTIALS_ERROR);
      } else {
        setLoginError(toUserErrorMessage(error, LOGIN_GENERIC_ERROR));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => performLogin({ email, password });

  const handleMockLogin = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const handleSocialLogin = async (provider: SocialType) => {
    setLoginError(undefined);
    let profile: SocialProfile | null;
    try {
      profile = await getSocialProfile(provider);
    } catch (error) {
      console.warn('[SocialLogin][SDK] getSocialProfile 실패', provider, error);
      setLoginError(LOGIN_SOCIAL_SDK_ERROR);
      return;
    }
    if (!profile) {
      return;
    }

    try {
      await authService.socialLogin({
        provider: profile.provider,
        providerToken: profile.providerToken,
      });
      goToMain();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SOCIAL_MEMBER_NOT_FOUND') {
        navigation.navigate('TermsAgreement', { socialProfile: profile });
      } else if (error instanceof SocialAuthParseError) {
        setLoginError(LOGIN_SOCIAL_PARSE_ERROR);
      } else if (error instanceof ApiError) {
        setLoginError(getApiErrorMessage(error.code, error.message));
      } else if (isNetworkError(error)) {
        setLoginError(LOGIN_SOCIAL_NETWORK_ERROR);
      } else {
        setLoginError(LOGIN_GENERIC_ERROR);
      }
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
    <ScreenContainer
      background="secondary"
      edges={['bottom']}
      style={styles.container}
      snackbar={
        snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoRow}>
          <Image source={LOGO_SYMBOL} style={styles.logoSymbol} resizeMode="contain" />
          <Image source={LOGO_WORDMARK} style={styles.logoWordmark} resizeMode="contain" />
        </View>

        <View style={styles.form}>
          <TextField
            value={email}
            onChangeText={text => {
              setEmail(text);
              setLoginError(undefined);
            }}
            placeholder={LOGIN_EMAIL_PLACEHOLDER}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View id="hv" style={{ height: 8}} />
          <TextField
            value={password}
            onChangeText={text => {
              setPassword(text);
              setLoginError(undefined);
            }}
            placeholder={LOGIN_PASSWORD_PLACEHOLDER}
            secureToggle
            error={loginError}
          />
        </View>
        <View id="hv" style={{ height: 16}} />
        <Button
          label={LOGIN_SUBMIT_LABEL}
          onPress={handleLogin}
          disabled={isSubmitting || !email.trim() || !password.trim()}
          fullWidth
        />
        <View id="hv" style={{ height: 16}} />
        <View style={styles.linkRow}>
          <TextButton
            label={LOGIN_FIND_PASSWORD_LABEL}
            onPress={handleFindPassword}
            hierarchy="tertiary"
            underline
          />
          <TextButton
            label={LOGIN_GO_TO_SIGNUP_LABEL}
            onPress={handleGoToSignup}
            hierarchy="tertiary"
            underline
          />
        </View>

        <View style={styles.socialRow}>
          <SocialLoginBadge
            type="Kakao"
            onPress={() => handleSocialLogin('Kakao')}
          />
          <SocialLoginBadge
            type="Naver"
            onPress={() => handleSocialLogin('Naver')}
          />
          <SocialLoginBadge
            type="Google"
            onPress={() => handleSocialLogin('Google')}
          />
        </View>

        {__DEV__ && (
          <View style={styles.mockLoginRow}>
            <Button
              label={LOGIN_MOCK_BUTTON_LABEL}
              onPress={handleMockLogin}
              disabled={isSubmitting}
              hierarchy="secondary"
              fullWidth
            />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 48,
  },
  logoSymbol: {
    width: 29,
    height: 28,
  },
  logoWordmark: {
    width: 92,
    height: 27,
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
