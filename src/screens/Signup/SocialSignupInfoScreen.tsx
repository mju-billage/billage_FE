/** @screen COM-3-PAGE-02-0 간편 가입 정보 입력 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import TextField from '../../components/Input/Text Field/TextField';
import Button from '../../components/Input/Button/Button';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { ApiError } from '../../services/apiClient';
import * as authService from '../../services/authService';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  SIGNUP_INFO_TITLE,
  SIGNUP_NAME_LABEL,
  SIGNUP_NAME_PLACEHOLDER,
  SIGNUP_EMAIL_LABEL,
  SIGNUP_EMAIL_PLACEHOLDER,
  SIGNUP_EMAIL_ALREADY_EXISTS_ERROR,
  SOCIAL_SIGNUP_GENERIC_ERROR,
  SOCIAL_SIGNUP_NAME_MAX_LENGTH,
  SOCIAL_SIGNUP_NAME_TOO_LONG_ERROR,
  SOCIAL_SIGNUP_SUBMIT_LABEL,
} from '../../constants/signupInfoText';

type SocialSignupInfoNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SocialSignupInfo'
>;

type SocialSignupInfoRouteProp = RouteProp<
  RootStackParamList,
  'SocialSignupInfo'
>;

/**
 * 간편(소셜) 회원가입 정보 입력 화면: 소셜 프로필을 프리필해 이름과 이메일만 받는다.
 *
 * `POST /auth/social/signup` 요청 스키마에 `email`
 * 필드가 없다 — 이 화면이 입력받은 이메일은 서버로 보내지 않는다.
 *
 * 스키마의 `termsAgreed`(필수)는 이 화면 앞 단계인 약관동의
 * (`TermsAgreementScreen`, `COM-2-PAGE-01-0`)에서 받아 `agreements`로 넘겨 받는다 — 신규 소셜 가입은
 * 소셜 인증 → 약관동의 → 이 화면. 뒤로가기(`goBack`)는 스택상 바로 앞인 약관동의로 돌아간다(시안 No.1).
 */
function SocialSignupInfoScreen() {
  const navigation = useNavigation<SocialSignupInfoNavigationProp>();
  const { profile, agreements } = useRoute<SocialSignupInfoRouteProp>().params;
  const [name, setName] = useState(profile.name.slice(0, SOCIAL_SIGNUP_NAME_MAX_LENGTH));
  // 이메일은 선택한 SNS 계정에서 바인딩된 값을 보여주기만 한다(Read-only, 시안 No.4) — 수정·검증하지 않는다.
  const email = profile.email;
  const [signupError, setSignupError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 시안 No.3: 8자 초과 입력 시 입력 라인이 레드로 바뀌고 하단에 에러 문구가 나온다(입력을 막지 않는다).
  // No.5: CTA는 이름이 1~8자일 때만 활성이다(이메일은 조건이 아니다).
  const isNameTooLong = name.length > SOCIAL_SIGNUP_NAME_MAX_LENGTH;
  const canProceed = name.trim().length > 0 && !isNameTooLong;

  const handleNext = async () => {
    setSignupError(undefined);
    setIsSubmitting(true);
    try {
      await authService.socialSignup({
        provider: profile.provider,
        providerToken: profile.providerToken,
        name,
        // 약관동의 화면이 필수 3종을 모두 체크해야 여기까지 오므로 셋의 논리곱이 곧 서버의 `termsAgreed`다.
        termsAgreed:
          agreements.termsOfService && agreements.privacyPolicy && agreements.ageOver14,
      });
      navigation.navigate('SignupComplete');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_ALREADY_EXISTS') {
        setSignupError(SIGNUP_EMAIL_ALREADY_EXISTS_ERROR);
      } else {
        setSignupError(SOCIAL_SIGNUP_GENERIC_ERROR);
      }
    } finally {
      setIsSubmitting(false);
    }
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
        <View style={styles.header}>
          <TextField
            label={SIGNUP_NAME_LABEL}
            required
            value={name}
            onChangeText={setName}
            placeholder={SIGNUP_NAME_PLACEHOLDER}
            error={isNameTooLong ? SOCIAL_SIGNUP_NAME_TOO_LONG_ERROR : undefined}
          />
          <TextField
            label={SIGNUP_EMAIL_LABEL}
            required
            value={email}
            onChangeText={() => {}}
            placeholder={SIGNUP_EMAIL_PLACEHOLDER}
            error={signupError}
            disabled
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label={SOCIAL_SIGNUP_SUBMIT_LABEL}
          onPress={handleNext}
          fullWidth
          disabled={!canProceed || isSubmitting}
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
    marginBottom: 8,
  },
  header: {
    marginTop: 24,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
});

export default SocialSignupInfoScreen;
