import { useEffect, useRef, useState } from 'react';
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
import { toUserErrorMessage } from '../../constants/apiErrorMessages';
import {
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  EMAIL_VERIFICATION_TITLE,
  EMAIL_VERIFICATION_SUBTITLE,
  EMAIL_VERIFICATION_TIMER_LABEL,
  EMAIL_VERIFICATION_RESEND_PROMPT,
  EMAIL_VERIFICATION_RESEND_LINK_LABEL,
  SNACKBAR_EMAIL_VERIFICATION_RESENT,
  SNACKBAR_SIGNUP_DONE_LOGIN_REQUIRED,
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

function EmailVerificationScreen() {
  const navigation = useNavigation<EmailVerificationNavigationProp>();
  const route = useRoute<EmailVerificationRouteProp>();
  const { email, name, password, agreements } = route.params;

  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [codeError, setCodeError] = useState<string | undefined>();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const sendingRef = useRef(false);
  const confirmingRef = useRef(false);
  const verifiedRef = useRef(false);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (sendingRef.current) {
      return;
    }
    sendingRef.current = true;
    setIsSending(true);
    try {
      await authService.sendEmailVerification(email);
      setSecondsLeft(COUNTDOWN_SECONDS);
      setCode('');
      setCodeError(undefined);
      verifiedRef.current = false;
      showSnackbar(SNACKBAR_EMAIL_VERIFICATION_RESENT);
    } catch (error) {
      showSnackbar(toUserErrorMessage(error, EMAIL_VERIFICATION_SEND_FAILED_ERROR));
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  const toConfirmErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError && error.fieldErrors.length > 0) {
      return error.fieldErrors[0].reason;
    }
    return toUserErrorMessage(error, SIGNUP_GENERIC_ERROR);
  };

  const handleNext = async () => {
    if (code.length !== CODE_LENGTH || confirmingRef.current) {
      return;
    }
    confirmingRef.current = true;
    setCodeError(undefined);
    setIsConfirming(true);
    try {
      if (!verifiedRef.current) {
        await authService.confirmEmailVerification(email, code);
        verifiedRef.current = true;
      }
      await authService.signup({
        email,
        password,
        name,
        agreements,
      });
      try {
        await authService.login({ email, password });
      } catch {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Login',
              params: { snackbarMessage: SNACKBAR_SIGNUP_DONE_LOGIN_REQUIRED },
            },
          ],
        });
        return;
      }
      navigation.navigate('SignupComplete');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_ALREADY_EXISTS') {
        navigation.reset({
          index: 0,
          routes: [
            { name: 'Login', params: { snackbarMessage: SIGNUP_EMAIL_ALREADY_EXISTS_ERROR } },
          ],
        });
        return;
      }
      if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
        verifiedRef.current = false;
      }
      setCodeError(toConfirmErrorMessage(error));
    } finally {
      confirmingRef.current = false;
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

      <View style={styles.codeSection}>
        <VerificationField
          value={code}
          onChangeText={text => {
            setCode(text);
            setCodeError(undefined);
          }}
          length={CODE_LENGTH}
          error={codeError}
        />
        <Text style={styles.timerText}>
          {EMAIL_VERIFICATION_TIMER_LABEL}{' '}
          <Text style={styles.timerValue}>
            {formatCountdown(secondsLeft)}
          </Text>
        </Text>
      </View>

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
