/** @screen COM-2-PAGE-02-0 비밀번호 재설정 */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import TextField from '../../components/Input/Text Field/TextField';
import Button from '../../components/Input/Button/Button';
import { isValidEmail } from '../../utils/validators';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  PASSWORD_RESET_TITLE,
  PASSWORD_RESET_SUBTITLE,
  PASSWORD_RESET_EMAIL_PLACEHOLDER,
  PASSWORD_RESET_SUBMIT_LABEL,
} from '../../constants/passwordResetText';

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
      <Text style={styles.title}>{PASSWORD_RESET_TITLE}</Text>
      <Text style={styles.subtitle}>{PASSWORD_RESET_SUBTITLE}</Text>

      <TextField
        value={email}
        onChangeText={setEmail}
        placeholder={PASSWORD_RESET_EMAIL_PLACEHOLDER}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button
        label={PASSWORD_RESET_SUBMIT_LABEL}
        onPress={handleSend}
        fullWidth
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
    ...TYPOGRAPHY.h3,
    marginBottom: 24,
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 24,
  },
});

export default PasswordResetScreen;
