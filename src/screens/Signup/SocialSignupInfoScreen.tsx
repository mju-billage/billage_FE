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
import { isValidEmail } from '../../utils/validators';
import { ApiError } from '../../services/apiClient';
import * as authService from '../../services/authService';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  SIGNUP_INFO_TITLE,
  SIGNUP_NAME_LABEL,
  SIGNUP_NAME_PLACEHOLDER,
  SIGNUP_NAME_HELPER,
  SIGNUP_EMAIL_LABEL,
  SIGNUP_EMAIL_PLACEHOLDER,
  SIGNUP_EMAIL_FORMAT_ERROR,
  SIGNUP_EMAIL_ALREADY_EXISTS_ERROR,
  SOCIAL_SIGNUP_GENERIC_ERROR,
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

const NAME_MAX_LENGTH = 8;

/**
 * 간편(소셜) 회원가입 정보 입력 화면: 소셜 프로필을 프리필해 이름과 이메일만 받는다.
 *
 * **2026-09-11 Swagger 대조**: `POST /auth/social/signup` 요청 스키마에 `email`
 * 필드가 없다 — 이 화면이 입력받은 이메일은 지금 서버로 안 보낸다(표시/수정
 * UI는 그대로 뒀다, 지울지는 기획 확인 필요). 대신 스키마엔 `termsAgreed`
 * (필수)가 있는데 이 화면엔 약관 동의 UI가 없다 — `authService.socialSignup`
 * 주석 참고, 실제 서버에 호출하면 `400`이 날 수 있다.
 */
function SocialSignupInfoScreen() {
  const navigation = useNavigation<SocialSignupInfoNavigationProp>();
  const { profile } = useRoute<SocialSignupInfoRouteProp>().params;
  const [name, setName] = useState(profile.name.slice(0, NAME_MAX_LENGTH));
  const [email, setEmail] = useState(profile.email);
  const [signupError, setSignupError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailError =
    email.length > 0 && !isValidEmail(email)
      ? SIGNUP_EMAIL_FORMAT_ERROR
      : signupError;
  const canProceed = name.length > 0 && isValidEmail(email);

  const handleNext = async () => {
    setSignupError(undefined);
    setIsSubmitting(true);
    try {
      await authService.socialSignup({
        provider: profile.provider,
        providerToken: profile.providerToken,
        name,
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
      {/* 키보드에 가린 필드도 스크롤로 볼 수 있게 한다. 하단 CTA(footer)는 스크롤 밖에 고정. */}
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backRow}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <Text style={styles.title}>{SIGNUP_INFO_TITLE}</Text>
        <View style={styles.header}>
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
