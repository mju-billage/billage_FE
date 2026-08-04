import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/BackButton';
import TextField from '../../components/Field/TextField';
import PrimaryButton from '../../components/Button/PrimaryButton';
import { isValidEmail } from '../../utils/validators';
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

/** 간편(소셜) 회원가입 정보 입력 화면: 소셜 프로필을 프리필해 이름과 이메일만 받는다. */
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
        email,
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
    <View style={styles.container}>
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
      <View style={styles.footer}>
        <PrimaryButton
          label={SOCIAL_SIGNUP_SUBMIT_LABEL}
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
