/** @screen COM-4-PAGE-01-0 이메일 인증 */
/**
 * 이메일 인증 코드 발송/재전송/검증을 실제 API로 호출한다(`email-verification-controller`,
 * `authService.ts` 주석 참고).
 * 검증 성공 시 이 화면이 실제 회원가입(`POST /auth/signup`)까지 마무리한다 —
 * `SignupInfoScreen`은 가입을 호출하지 않는다(Auth.txt 8번, 순서가 "인증 먼저").
 */
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import VerificationField from '../../components/Input/Verification Field/VerificationField';
import Button from '../../components/Input/Button/Button';
import TextButton from '../../components/Input/Button/TextButton';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import * as authService from '../../services/authService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  EMAIL_VERIFICATION_TITLE,
  EMAIL_VERIFICATION_SUBTITLE,
  EMAIL_VERIFICATION_SEND_BUTTON_LABEL,
  EMAIL_VERIFICATION_TIMER_LABEL,
  EMAIL_VERIFICATION_RESEND_PROMPT,
  EMAIL_VERIFICATION_RESEND_LINK_LABEL,
  SNACKBAR_EMAIL_VERIFICATION_RESENT,
  EMAIL_VERIFICATION_INVALID_CODE_ERROR,
  EMAIL_VERIFICATION_CODE_EXPIRED_ERROR,
  EMAIL_VERIFICATION_NOT_FOUND_ERROR,
  EMAIL_VERIFICATION_SEND_FAILED_ERROR,
} from '../../constants/emailVerificationScreenText';
import {
  SIGNUP_EMAIL_ALREADY_EXISTS_ERROR,
  SIGNUP_GENERIC_ERROR,
} from '../../constants/signupInfoText';
import { NEXT_BUTTON_LABEL } from '../../constants/commonText';

type EmailVerificationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EmailVerification'
>;
type EmailVerificationRouteProp = RouteProp<
  RootStackParamList,
  'EmailVerification'
>;

const CODE_LENGTH = 6;
const COUNTDOWN_SECONDS = 180;
const SNACKBAR_AUTO_HIDE_MS = 1600;

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remaining
    .toString()
    .padStart(2, '0')}`;
}

/** 이메일 인증 코드 입력 화면: 6자리 코드와 남은 시간을 보여준다. */
function EmailVerificationScreen() {
  const navigation = useNavigation<EmailVerificationNavigationProp>();
  const route = useRoute<EmailVerificationRouteProp>();
  const { email, name, password, agreements } = route.params;

  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [codeError, setCodeError] = useState<string | undefined>();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const toErrorMessage = (error: unknown): string =>
    isNetworkError(error) ? API_NETWORK_ERROR_MESSAGE : API_ERROR_DEFAULT_MESSAGE;

  useEffect(() => {
    if (!isCodeSent || secondsLeft <= 0) {
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isCodeSent, secondsLeft]);

  const handleSendCode = useCallback(async () => {
    if (isSending) {
      return;
    }
    setIsSending(true);
    try {
      await authService.sendEmailVerification(email);
      setIsCodeSent(true);
      setSecondsLeft(COUNTDOWN_SECONDS);
      setCode('');
    } catch (error) {
      showSnackbar(
        isNetworkError(error) ? API_NETWORK_ERROR_MESSAGE : EMAIL_VERIFICATION_SEND_FAILED_ERROR,
      );
    } finally {
      setIsSending(false);
    }
  }, [email, isSending]);

  const handleResend = async () => {
    if (isSending) {
      return;
    }
    setIsSending(true);
    try {
      await authService.sendEmailVerification(email);
      setSecondsLeft(COUNTDOWN_SECONDS);
      setCode('');
      setCodeError(undefined);
      showSnackbar(SNACKBAR_EMAIL_VERIFICATION_RESENT);
    } catch (error) {
      showSnackbar(
        isNetworkError(error) ? API_NETWORK_ERROR_MESSAGE : EMAIL_VERIFICATION_SEND_FAILED_ERROR,
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleNext = async () => {
    if (code.length !== CODE_LENGTH || isConfirming) {
      return;
    }
    setCodeError(undefined);
    setIsConfirming(true);
    try {
      await authService.confirmEmailVerification(email, code);
      await authService.signup({
        email,
        password,
        name,
        agreements,
      });
      navigation.navigate('SignupComplete');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'INVALID_VERIFICATION_CODE') {
          setCodeError(EMAIL_VERIFICATION_INVALID_CODE_ERROR);
        } else if (error.code === 'VERIFICATION_CODE_EXPIRED') {
          setCodeError(EMAIL_VERIFICATION_CODE_EXPIRED_ERROR);
        } else if (error.code === 'EMAIL_ALREADY_EXISTS') {
          setCodeError(SIGNUP_EMAIL_ALREADY_EXISTS_ERROR);
        } else if (error.code === 'VERIFICATION_NOT_FOUND') {
          setCodeError(EMAIL_VERIFICATION_NOT_FOUND_ERROR);
        } else {
          setCodeError(SIGNUP_GENERIC_ERROR);
        }
      } else {
        setCodeError(toErrorMessage(error));
      }
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <ScreenContainer
      background="secondary"
      edges={['bottom']}
      style={styles.container}
      snackbar={snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined}
      snackbarOffset={76}
    >
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.title}>{EMAIL_VERIFICATION_TITLE}</Text>
      <Text style={styles.subtitle}>{EMAIL_VERIFICATION_SUBTITLE}</Text>

      {!isCodeSent && (
        <View style={styles.sendButtonRow}>
          <Button
            label={EMAIL_VERIFICATION_SEND_BUTTON_LABEL}
            onPress={handleSendCode}
            disabled={isSending}
            fullWidth
          />
        </View>
      )}

      <View style={styles.codeSection}>
        <VerificationField
          value={code}
          onChangeText={text => {
            setCode(text);
            setCodeError(undefined);
          }}
          length={CODE_LENGTH}
          disabled={!isCodeSent}
          error={codeError}
        />
        {isCodeSent && (
          <Text style={styles.timerText}>
            {EMAIL_VERIFICATION_TIMER_LABEL}{' '}
            <Text style={styles.timerValue}>
              {formatCountdown(secondsLeft)}
            </Text>
          </Text>
        )}
      </View>

      {isCodeSent && (
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>
            {EMAIL_VERIFICATION_RESEND_PROMPT}
          </Text>
          <TextButton
            label={EMAIL_VERIFICATION_RESEND_LINK_LABEL}
            onPress={handleResend}
            disabled={isSending}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Button
          label={NEXT_BUTTON_LABEL}
          onPress={handleNext}
          fullWidth
          disabled={code.length !== CODE_LENGTH || isConfirming}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backRow: {
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_NORMAL,
    marginBottom: 24,
  },
  sendButtonRow: {
    marginBottom: 24,
  },
  codeSection: {
    marginBottom: 16,
  },
  timerText: {
    marginTop: 8,
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  timerValue: {
    color: FOREGROUND_SECONDARY,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  resendLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
});

export default EmailVerificationScreen;
