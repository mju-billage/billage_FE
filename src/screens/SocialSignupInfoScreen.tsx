import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import BackButton from '../components/BackButton';
import LabeledTextInput from '../components/LabeledTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { isValidEmail } from '../utils/validators';
import {
  SIGNUP_INFO_TITLE,
  SIGNUP_NAME_LABEL,
  SIGNUP_NAME_PLACEHOLDER,
  SIGNUP_NAME_HELPER,
  SIGNUP_EMAIL_LABEL,
  SIGNUP_EMAIL_PLACEHOLDER,
  SIGNUP_EMAIL_FORMAT_ERROR,
  SOCIAL_SIGNUP_SUBMIT_LABEL,
} from '../constants/signupInfoText';

type SocialSignupInfoNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SocialSignupInfo'
>;

const NAME_MAX_LENGTH = 8;

/** 간편(소셜) 회원가입 정보 입력 화면: 이름과 이메일만 받는다. */
function SocialSignupInfoScreen() {
  const navigation = useNavigation<SocialSignupInfoNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const emailError =
    email.length > 0 && !isValidEmail(email)
      ? SIGNUP_EMAIL_FORMAT_ERROR
      : undefined;
  const canProceed = name.length > 0 && isValidEmail(email);

  const handleNext = () => {
    // TODO: 소셜 프로필 기반 간편 회원가입 API 연동 필요
    navigation.navigate('SignupComplete');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.title}>{SIGNUP_INFO_TITLE}</Text>
      <View style={styles.header}>
        <LabeledTextInput
          label={SIGNUP_NAME_LABEL}
          value={name}
          onChangeText={text => setName(text.slice(0, NAME_MAX_LENGTH))}
          placeholder={SIGNUP_NAME_PLACEHOLDER}
          helperText={SIGNUP_NAME_HELPER}
          maxLength={NAME_MAX_LENGTH}
        />
        <LabeledTextInput
          label={SIGNUP_EMAIL_LABEL}
          value={email}
          onChangeText={setEmail}
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
          disabled={!canProceed}
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
