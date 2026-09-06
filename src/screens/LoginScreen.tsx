/** @screen COM-1-PAGE-01-0 로그인 */
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import TextField from '../components/Input/Text Field/TextField';
import Button from '../components/Input/Button/Button';
import TextButton from '../components/Input/Button/TextButton';
import Snackbar from '../components/Feedback/Snackbar/Snackbar';
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
import * as socialAuthService from '../services/socialAuthService';
import * as groupService from '../services/groupService';
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
type LoginRouteProp = RouteProp<RootStackParamList, 'Login'>;

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

/** 로그인 화면 전용 소셜 로그인 원형 배지 버튼. */
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

/** 로그인 화면: 이메일/비밀번호 로그인과 소셜 로그인 진입점을 보여준다. */
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
    // [치명1] 홈/납부관리 등 여러 화면이 getActiveGroup()이 이미 채워져 있다고
    // 가정하고 포커스 시 바로 그걸 읽는다 — 로그인 직후 첫 진입이면 아직 아무도
    // 모임 목록을 안 불러온 상태라 그 화면들이 조용히 로딩에 멈춰 있었다. 여기서
    // 미리 채워 넣는다. 실패해도(네트워크 등) 로그인 자체를 막을 이유는 없고,
    // 각 화면 자체에도 "모임 없음" 상태를 보여주는 방어 로직을 따로 둔다.
    try {
      await groupService.getMyGroups();
    } catch {
      // 무시 — 각 화면의 방어 로직(활성 모임 없음 상태)이 대신 처리한다.
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
          secureTextEntry
          error={loginError}
        />
      </View>
      <View id="hv" style={{ height: 16}} />
      <Button
        label={LOGIN_SUBMIT_LABEL}
        onPress={handleLogin}
        disabled={isSubmitting}
        fullWidth
      />
      <View id="hv" style={{ height: 16}} />
      <View style={styles.linkRow}>
        <TextButton
          label={LOGIN_FIND_PASSWORD_LABEL}
          onPress={handleFindPassword}
          hierarchy="tertiary"
        />
        <TextButton
          label={LOGIN_GO_TO_SIGNUP_LABEL}
          onPress={handleGoToSignup}
          hierarchy="tertiary"
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

      {snackbarMessage && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={snackbarMessage} />
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
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default LoginScreen;
