import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import TextField from '../../components/Input/Text Field/TextField';
import Button from '../../components/Input/Button/Button';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import { ApiError } from '../../services/apiClient';
import * as authService from '../../services/authService';
import {
  SIGNUP_INFO_TITLE,
  SIGNUP_NAME_LABEL,
  SIGNUP_NAME_PLACEHOLDER,
  SIGNUP_NAME_HELPER,
  SIGNUP_EMAIL_LABEL,
  SIGNUP_EMAIL_PLACEHOLDER,
  SIGNUP_EMAIL_FORMAT_ERROR,
  SIGNUP_EMAIL_ALREADY_EXISTS_ERROR,
  SIGNUP_PASSWORD_LABEL,
  SIGNUP_PASSWORD_PLACEHOLDER,
  SIGNUP_PASSWORD_HELPER,
  SIGNUP_PASSWORD_CONFIRM_LABEL,
  SIGNUP_PASSWORD_MISMATCH_ERROR,
  SIGNUP_GENERIC_ERROR,
} from '../../constants/signupInfoText';
import { NEXT_BUTTON_LABEL } from '../../constants/commonText';

type SignupInfoNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignupInfo'
>;

const NAME_MAX_LENGTH = 8;

/** 이메일 회원가입 정보 입력 화면: 이름, 이메일, 비밀번호를 받는다. */
function SignupInfoScreen() {
  const navigation = useNavigation<SignupInfoNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [signupError, setSignupError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailError =
    email.length > 0 && !isValidEmail(email)
      ? SIGNUP_EMAIL_FORMAT_ERROR
      : signupError;
  const confirmError =
    passwordConfirm.length > 0 && passwordConfirm !== password
      ? SIGNUP_PASSWORD_MISMATCH_ERROR
      : undefined;

  const canProceed =
    name.length > 0 &&
    isValidEmail(email) &&
    isValidPassword(password) &&
    passwordConfirm === password;

  const handleNext = async () => {
    setSignupError(undefined);
    setIsSubmitting(true);
    try {
      await authService.signup({ email, password, name });
      navigation.navigate('EmailVerification', { email });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_ALREADY_EXISTS') {
        setSignupError(SIGNUP_EMAIL_ALREADY_EXISTS_ERROR);
      } else {
        setSignupError(SIGNUP_GENERIC_ERROR);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.title}>{SIGNUP_INFO_TITLE}</Text>

      <View style={styles.form}>
        <TextField
          label={SIGNUP_NAME_LABEL}
          value={name}
          onChangeText={text => setName(text.slice(0, NAME_MAX_LENGTH))}
          placeholder={SIGNUP_NAME_PLACEHOLDER}
          helperText={SIGNUP_NAME_HELPER}
          maxLength={NAME_MAX_LENGTH}
        />
        <TextField
          label={SIGNUP_EMAIL_LABEL}
          value={email}
          onChangeText={text => {
            setEmail(text);
            setSignupError(undefined);
          }}
          placeholder={SIGNUP_EMAIL_PLACEHOLDER}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label={SIGNUP_PASSWORD_LABEL}
          value={password}
          onChangeText={setPassword}
          placeholder={SIGNUP_PASSWORD_PLACEHOLDER}
          helperText={SIGNUP_PASSWORD_HELPER}
          secureToggle
        />
        <TextField
          label={SIGNUP_PASSWORD_CONFIRM_LABEL}
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          placeholder={SIGNUP_PASSWORD_PLACEHOLDER}
          helperText={SIGNUP_PASSWORD_HELPER}
          error={confirmError}
          secureToggle
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={NEXT_BUTTON_LABEL}
          onPress={handleNext}
          fullWidth
          disabled={!canProceed || isSubmitting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  backRow: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
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
