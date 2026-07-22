import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import BackButton from '../components/BackButton';
import LabeledTextInput from '../components/LabeledTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { isValidEmail } from '../utils/validators';

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
      ? '올바른 이메일 형식을 입력해주세요.'
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
      <Text style={styles.title}>가입 정보 입력</Text>
      <View style={styles.header}>
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
          onChangeText={setEmail}
          placeholder="이메일을 입력해주세요."
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          label="다음"
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
