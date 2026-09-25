import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import TextField from '../components/Input/Text Field/TextField';
import Button from '../components/Input/Button/Button';
import TextButton from '../components/Input/Button/TextButton';
import Snackbar from '../components/Feedback/Snackbar/Snackbar';
import ScreenContainer from '../components/Layout/ScreenContainer';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  SOCIAL_KAKAO_TEXT,
  SOCIAL_KAKAO_YELLOW,
  SOCIAL_NAVER_GREEN,
} from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { SocialProfile, SocialType } from '../types/social';
import { ApiError } from '../services/apiClient';
import * as authService from '../services/authService';
import { SocialAuthParseError } from '../services/authService';
import * as socialAuthService from '../services/socialAuthService';
import * as groupService from '../services/groupService';
import { getApiErrorMessage, isNetworkError } from '../constants/apiErrorMessages';
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

const SOCIAL_CIRCLE_SIZE = 48;

const SOCIAL_STYLE_BY_TYPE: Record<SocialType, object> = {
  Naver: { backgroundColor: SOCIAL_NAVER_GREEN },
  Kakao: { backgroundColor: SOCIAL_KAKAO_YELLOW },
  Google: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
};

const SOCIAL_LABEL_STYLE_BY_TYPE: Record<SocialType, object> = {
  Naver: { color: FOREGROUND_INVERSE },
  Kakao: { color: SOCIAL_KAKAO_TEXT },
  Google: { color: FOREGROUND_NEUTRAL_NORMAL },
};

const SOCIAL_INITIAL_BY_TYPE: Record<SocialType, string> = {
  Naver: 'N',
  Kakao: 'K',
  Google: 'G',
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
        SOCIAL_STYLE_BY_TYPE[type],
        pressed && { opacity: 0.5 },
      ]}
      onPress={onPress}
    >
      <Text style={[socialBadgeStyles.label, SOCIAL_LABEL_STYLE_BY_TYPE[type]]}>
        {SOCIAL_INITIAL_BY_TYPE[type]}
      </Text>
    </Pressable>
  );
}

const socialBadgeStyles = StyleSheet.create({
  circle: {
    width: SOCIAL_CIRCLE_SIZE,
    height: SOCIAL_CIRCLE_SIZE,
    borderRadius: SOCIAL_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...TYPOGRAPHY.h3,
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

  const goToMain = async () => {
    try {
      await groupService.getMyGroups();
    } catch {
    }
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

  const handleMockLogin = () => {
    goToMain();
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
        setLoginError(getApiErrorMessage(error.code));
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
