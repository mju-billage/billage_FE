import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/BackButton';
import PrimaryButton from '../../components/Button/PrimaryButton';
import {
  PASSWORD_RESET_TITLE,
  PASSWORD_RESET_SENT_MESSAGE_SUFFIX,
  PASSWORD_RESET_BACK_TO_LOGIN_LABEL,
} from '../../constants/passwordResetText';

type PasswordResetSentNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PasswordResetSent'
>;
type PasswordResetSentRouteProp = RouteProp<
  RootStackParamList,
  'PasswordResetSent'
>;

/** 비밀번호 재설정 완료 화면: 임시 비밀번호 발송 안내와 로그인 복귀 버튼을 보여준다. */
function PasswordResetSentScreen() {
  const navigation = useNavigation<PasswordResetSentNavigationProp>();
  const { params } = useRoute<PasswordResetSentRouteProp>();

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.title}>{PASSWORD_RESET_TITLE}</Text>
      <Text style={styles.message}>
        {params.email}
        {PASSWORD_RESET_SENT_MESSAGE_SUFFIX}
      </Text>

      <PrimaryButton
        label={PASSWORD_RESET_BACK_TO_LOGIN_LABEL}
        onPress={handleBackToLogin}
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
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
});

export default PasswordResetSentScreen;
