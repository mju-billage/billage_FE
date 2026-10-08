import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import TextField from '../../components/Input/Text Field/TextField';
import Button from '../../components/Input/Button/Button';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import * as authService from '../../services/authService';
import { ApiError } from '../../services/apiClient';
import { toUserErrorMessage } from '../../constants/apiErrorMessages';
import { EMAIL_VERIFICATION_SEND_FAILED_ERROR } from '../../constants/emailVerificationScreenText';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  SIGNUP_INFO_TITLE,
  SIGNUP_NAME_LABEL,
  SIGNUP_NAME_PLACEHOLDER,
  SIGNUP_NAME_HELPER,
  SIGNUP_NAME_MAX_LENGTH,
  SIGNUP_NAME_TOO_LONG_ERROR,
  SIGNUP_EMAIL_LABEL,
  SIGNUP_EMAIL_PLACEHOLDER,
  SIGNUP_EMAIL_FORMAT_ERROR,
  SIGNUP_EMAIL_ALREADY_EXISTS_ERROR,
  SIGNUP_PASSWORD_LABEL,
  SIGNUP_PASSWORD_PLACEHOLDER,
  SIGNUP_PASSWORD_HELPER,
  SIGNUP_PASSWORD_CONFIRM_LABEL,
  SIGNUP_PASSWORD_MISMATCH_ERROR,
} from '../../constants/signupInfoText';
import { NEXT_BUTTON_LABEL } from '../../constants/commonText';

type SignupInfoNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignupInfo'
>;
type SignupInfoRouteProp = RouteProp<RootStackParamList, 'SignupInfo'>;

const SNACKBAR_AUTO_HIDE_MS = 1600;

function SignupInfoScreen() {
  const navigation = useNavigation<SignupInfoNavigationProp>();
  const route = useRoute<SignupInfoRouteProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });
  const touch = (field: keyof typeof touched) => setTouched(prev => ({ ...prev, [field]: true }));
  const [emailServerError, setEmailServerError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const sendingRef = useRef(false);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const emailError =
    touched.email && email.length > 0 && !isValidEmail(email)
      ? SIGNUP_EMAIL_FORMAT_ERROR
      : emailServerError;
  const passwordError =
    touched.password && password.length > 0 && !isValidPassword(password)
      ? SIGNUP_PASSWORD_HELPER
      : undefined;
  const confirmError =
    touched.confirm && password.length > 0 && passwordConfirm.length > 0 && passwordConfirm !== password
      ? SIGNUP_PASSWORD_MISMATCH_ERROR
      : undefined;

  const isNameTooLong = name.length > SIGNUP_NAME_MAX_LENGTH;

  const canProceed =
    name.length > 0 &&
    !isNameTooLong &&
    isValidEmail(email) &&
    isValidPassword(password) &&
    passwordConfirm === password &&
    !emailServerError;

  const handleNext = async () => {
    if (sendingRef.current) {
      return;
    }
    sendingRef.current = true;
    setIsSending(true);
    try {
      await authService.sendEmailVerification(email);
      navigation.navigate('EmailVerification', {
        email,
        name,
        password,
        agreements: route.params.agreements,
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_ALREADY_EXISTS') {
        setEmailServerError(SIGNUP_EMAIL_ALREADY_EXISTS_ERROR);
      } else if (error instanceof ApiError && error.fieldErrors.some(fe => fe.field === 'email')) {
        setEmailServerError(error.fieldErrors.find(fe => fe.field === 'email')?.reason);
      } else {
        showSnackbar(toUserErrorMessage(error, EMAIL_VERIFICATION_SEND_FAILED_ERROR));
      }
    } finally {
      sendingRef.current = false;
      setIsSending(false);
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
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{SIGNUP_INFO_TITLE}</Text>

        <View style={styles.form}>
          <TextField
            label={SIGNUP_NAME_LABEL}
            value={name}
            onChangeText={setName}
            placeholder={SIGNUP_NAME_PLACEHOLDER}
            helperText={SIGNUP_NAME_HELPER}
            error={isNameTooLong ? SIGNUP_NAME_TOO_LONG_ERROR : undefined}
          />
          <TextField
            label={SIGNUP_EMAIL_LABEL}
            value={email}
            onChangeText={text => {
              setEmail(text);
              setEmailServerError(undefined);
            }}
            placeholder={SIGNUP_EMAIL_PLACEHOLDER}
            error={emailError}
            onBlur={() => touch('email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            label={SIGNUP_PASSWORD_LABEL}
            value={password}
            onChangeText={setPassword}
            placeholder={SIGNUP_PASSWORD_PLACEHOLDER}
            helperText={SIGNUP_PASSWORD_HELPER}
            error={passwordError}
            onBlur={() => touch('password')}
            secureToggle
          />
          <TextField
            label={SIGNUP_PASSWORD_CONFIRM_LABEL}
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            placeholder={SIGNUP_PASSWORD_PLACEHOLDER}
            error={confirmError}
            onBlur={() => touch('confirm')}
            secureToggle
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={NEXT_BUTTON_LABEL}
          onPress={handleNext}
          fullWidth
          disabled={!canProceed || isSending}
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
  scroll: {
    flex: 1,
  },
  backRow: {
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: 24,
  },
  form: {
    flex: 1,
  },
  footer: {
    paddingBottom: 24,
  },
});

export default SignupInfoScreen;
