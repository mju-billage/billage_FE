import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import BackButton from '../components/BackButton';
import LabeledTextInput from '../components/LabeledTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { isValidEmail, isValidPassword } from '../utils/validators';
import { ApiError } from '../services/apiClient';
import * as authService from '../services/authService';

type SignupInfoNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignupInfo'
>;

const NAME_MAX_LENGTH = 8;
const PASSWORD_HELPER = '* 영문 대소문자, 숫자, 특수문자 포함 8자 이상';

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
      ? '올바른 이메일 형식을 입력해주세요.'
      : signupError;
  const confirmError =
    passwordConfirm.length > 0 && passwordConfirm !== password
      ? '비밀번호가 동일하지 않습니다.'
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
        setSignupError('이미 가입된 이메일입니다.');
      } else {
        setSignupError('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
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
      <Text style={styles.title}>가입 정보 입력</Text>

      <View style={styles.form}>
        <LabeledTextInput
          label="이름"
          value={name}
          onChangeText={text => setName(text.slice(0, NAME_MAX_LENGTH))}
          placeholder="이름을 입력해주세요."
          helperText="* 최대 8자 이내로 입력할 수 있어요."
          maxLength={NAME_MAX_LENGTH}
        />
        <LabeledTextInput
          label="이메일"
          value={email}
          onChangeText={text => {
            setEmail(text);
            setSignupError(undefined);
          }}
          placeholder="이메일을 입력해주세요."
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <LabeledTextInput
          label="비밀번호"
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호를 입력해주세요."
          helperText={PASSWORD_HELPER}
          secureToggle
        />
        <LabeledTextInput
          label="비밀번호 확인"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          placeholder="비밀번호를 입력해주세요."
          helperText={PASSWORD_HELPER}
          error={confirmError}
          secureToggle
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="다음으로"
          onPress={handleNext}
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
