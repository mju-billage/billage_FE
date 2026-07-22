import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import BackButton from '../components/BackButton';
import LabeledTextInput from '../components/LabeledTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { isValidEmail } from '../utils/validators';

type PasswordResetNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PasswordReset'
>;

/** 비밀번호 재설정 화면: 임시 비밀번호를 받을 이메일을 입력받는다. */
function PasswordResetScreen() {
  const navigation = useNavigation<PasswordResetNavigationProp>();
  const [email, setEmail] = useState('');

  const handleSend = () => {
    // TODO: 임시 비밀번호 발급/발송 API 연동 필요
    navigation.navigate('PasswordResetSent', { email });
  };

  return (
    <View style={styles.container}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.title}>비밀번호 재설정</Text>
      <Text style={styles.subtitle}>
        임시 비밀번호를 받을{'\n'}이메일 주소를 입력해주세요
      </Text>

      <LabeledTextInput
        value={email}
        onChangeText={setEmail}
        placeholder="이메일"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <PrimaryButton
        label="전송하기"
        onPress={handleSend}
        disabled={!isValidEmail(email)}
      />
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 24,
    marginBottom: 24,
  },
});

export default PasswordResetScreen;
