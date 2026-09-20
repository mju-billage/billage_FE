/** @screen COM-3-PAGE-03-0 가입 정보 입력 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import TextField from '../../components/Input/Text Field/TextField';
import Button from '../../components/Input/Button/Button';
import ScreenContainer from '../../components/Layout/ScreenContainer';
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

/**
 * 이메일 회원가입 정보 입력 화면: 이름, 이메일, 비밀번호를 받는다.
 *
 * ⚠️ 2026-09-06 흐름 변경(Auth.txt 6~8번): 예전엔 이 화면에서 바로
 * `POST /auth/signup`을 호출했는데, 명세가 "이메일 인증을 먼저 마쳐야 가입
 * 가능"으로 확정되면서 순서가 뒤집혔다 — 실제 가입 호출은
 * `EmailVerificationScreen`의 코드 검증 성공 직후로 옮겼다(2026-09-11 Swagger
 * 대조 결과 `verificationToken` 같은 건 실제로 없다 — `authService.ts` 주석
 * 참고). 이 화면은 이제 입력값만 모아 다음 화면으로 넘긴다(API 호출 없음).
 * `EMAIL_ALREADY_EXISTS` 에러도 그래서 이 화면이 아니라
 * `EmailVerificationScreen`에서 처리한다 — 사용자가 인증까지 다 마친
 * 뒤에야 알게 되는 건 UX상 아쉽지만 명세가 그렇게 정의했다.
 */
function SignupInfoScreen() {
  const navigation = useNavigation<SignupInfoNavigationProp>();
  const route = useRoute<SignupInfoRouteProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  // 검증 에러는 필드를 한 번 벗어난(blur) 뒤부터 보여준다 — 아직 입력 중인데 에러를 띄우지 않으려는 것.
  // 시안 미명시, blur 기준으로 구현 (2026-09-20). 한 번 뜬 뒤에는 입력 중에도 실시간으로 갱신돼
  // 조건을 채우면 바로 사라진다(`touched`가 계속 true). 이름·이메일·비밀번호·확인 네 필드 모두 같은 규칙.
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });
  const touch = (field: keyof typeof touched) => setTouched(prev => ({ ...prev, [field]: true }));

  const emailError =
    touched.email && email.length > 0 && !isValidEmail(email) ? SIGNUP_EMAIL_FORMAT_ERROR : undefined;
  // 시트 No.5: 조건 미충족 시 도움말 문구와 라인이 에러 컬러로 바뀐다. 별도 에러 문구는 시트에 없어
  // (목업 Case도 없음) **문구는 그대로 두고 색만 전환**한다(같은 문구를 error로 넘김).
  const passwordError =
    touched.password && password.length > 0 && !isValidPassword(password)
      ? SIGNUP_PASSWORD_HELPER
      : undefined;
  // 확인 필드는 비밀번호와 확인이 **둘 다 입력된 뒤**에만 비교한다(한 글자 칠 때마다 "다르다"고 뜨지 않게).
  const confirmError =
    touched.confirm && password.length > 0 && passwordConfirm.length > 0 && passwordConfirm !== password
      ? SIGNUP_PASSWORD_MISMATCH_ERROR
      : undefined;

  // 시트 No.3/Case A: 10자를 넘겨도 입력은 막지 않고(11자가 그대로 보인다) 라인·도움말 자리가 빨간 에러로 바뀐다.
  const isNameTooLong = name.length > SIGNUP_NAME_MAX_LENGTH;

  const canProceed =
    name.length > 0 &&
    !isNameTooLong &&
    isValidEmail(email) &&
    isValidPassword(password) &&
    passwordConfirm === password;

  const handleNext = () => {
    navigation.navigate('EmailVerification', {
      email,
      name,
      password,
      agreements: route.params.agreements,
    });
  };

  return (
    <ScreenContainer background="secondary" edges={['bottom']} style={styles.container}>
      {/* 시안 No.1: 뒤로가기는 화면 상단에 고정 — 스크롤 밖. */}
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      {/* 키보드에 가린 필드도 스크롤로 볼 수 있게 한다. 하단 CTA(footer)는 스크롤 밖에 고정. */}
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
            error={touched.name && isNameTooLong ? SIGNUP_NAME_TOO_LONG_ERROR : undefined}
            onBlur={() => touch('name')}
          />
          <TextField
            label={SIGNUP_EMAIL_LABEL}
            value={email}
            onChangeText={setEmail}
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
          {/* 시트 프레임에는 확인 필드 아래 도움말이 없다. */}
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
          disabled={!canProceed}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
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
