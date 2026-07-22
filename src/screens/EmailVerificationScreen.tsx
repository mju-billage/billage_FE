import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import BackButton from '../components/BackButton';
import OtpCodeInput from '../components/OtpCodeInput';
import PrimaryButton from '../components/PrimaryButton';
import { LINK_BLUE } from '../constants/colors';

type EmailVerificationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EmailVerification'
>;

const CODE_LENGTH = 6;
const COUNTDOWN_SECONDS = 180;

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remaining
    .toString()
    .padStart(2, '0')}`;
}

/** 이메일 인증 코드 입력 화면: 6자리 코드와 남은 시간을 보여준다. */
function EmailVerificationScreen() {
  const navigation = useNavigation<EmailVerificationNavigationProp>();
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleResend = () => {
    // TODO: route.params.email로 인증 코드 재전송 API 연동 필요
    setSecondsLeft(COUNTDOWN_SECONDS);
    setCode('');
  };

  const handleNext = () => {
    // TODO: 인증 코드 검증 API 연동 필요
    navigation.navigate('SignupComplete');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.title}>인증 코드 입력</Text>
      <Text style={styles.subtitle}>
        이메일로 전송된 코드를 하단에 입력해주세요.
      </Text>

      <View style={styles.codeSection}>
        <OtpCodeInput
          value={code}
          onChangeText={setCode}
          length={CODE_LENGTH}
        />
        <Text style={styles.timerText}>
          입력 남은 시간{' '}
          <Text style={styles.timerValue}>{formatCountdown(secondsLeft)}</Text>
        </Text>
      </View>

      <View style={styles.resendRow}>
        <Text style={styles.resendLabel}>메일이 오지 않았나요? </Text>
        <Pressable onPress={handleResend}>
          <Text style={styles.resendLink}>재전송하기</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="다음으로"
          onPress={handleNext}
          disabled={code.length !== CODE_LENGTH}
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
    marginBottom: 24,
  },
  codeSection: {
    marginBottom: 16,
  },
  timerText: {
    marginTop: 8,
    fontSize: 13,
    color: '#868E96',
  },
  timerValue: {
    color: LINK_BLUE,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  resendLabel: {
    fontSize: 13,
    color: '#495057',
  },
  resendLink: {
    fontSize: 13,
    color: '#212529',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
});

export default EmailVerificationScreen;
