import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import BackButton from '../components/BackButton';
import PrimaryButton from '../components/PrimaryButton';
import {
  SIGNUP_COMPLETE_TITLE,
  SIGNUP_COMPLETE_SUBTITLE,
  SIGNUP_COMPLETE_CREATE_GROUP_LABEL,
  SIGNUP_COMPLETE_JOIN_WITH_CODE_LABEL,
} from '../constants/signupCompleteScreenText';

type SignupCompleteNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignupComplete'
>;

/** 가입 완료 환영 화면: 모임 생성/참여로 이어지는 다음 액션을 보여준다. */
function SignupCompleteScreen() {
  const navigation = useNavigation<SignupCompleteNavigationProp>();

  const handleCreateGroup = () => {
    // TODO: 모임 생성 화면 연동 필요
  };

  const handleJoinWithCode = () => {
    // TODO: 코드로 참여하기 화면 연동 필요
  };

  return (
    <View style={styles.container}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.title}>{SIGNUP_COMPLETE_TITLE}</Text>
      <Text style={styles.subtitle}>{SIGNUP_COMPLETE_SUBTITLE}</Text>

      <View style={styles.footer}>
        <PrimaryButton
          label={SIGNUP_COMPLETE_CREATE_GROUP_LABEL}
          onPress={handleCreateGroup}
        />
        <View style={styles.buttonGap} />
        <PrimaryButton
          label={SIGNUP_COMPLETE_JOIN_WITH_CODE_LABEL}
          onPress={handleJoinWithCode}
          variant="secondary"
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
  subtitle: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  buttonGap: {
    height: 12,
  },
});

export default SignupCompleteScreen;
