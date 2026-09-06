/**
 * @screen ETC-3-PAGE-11-0 약관 및 개인정보 처리방침
 * 시안 표의 Screen ID 칸이 비어 있었다("스크린아이디" 플레이스홀더 그대로) —
 * 배치 지시서가 준 매핑(ETC-3-PAGE-11-0)을 그대로 썼다. design-verification.md
 * §5-4에 확인 필요 항목으로 남겼다.
 */
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import CardBase from '../../components/Data Display/Card/CardBase';
import {
  TERMS_LIST_AUTO_RECORD_LABEL,
  TERMS_LIST_PRIVACY_LABEL,
  TERMS_LIST_SERVICE_LABEL,
  TERMS_LIST_TITLE,
} from '../../constants/settingsScreenText';
import { TYPOGRAPHY } from '../../constants/typography';

type TermsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Terms'>;

/**
 * 약관 목록: 서비스 이용 약관/개인정보 처리방침/자동 기록 서비스 이용 약관 3종
 * (명세 "화면명세 내부 불일치" 해결 — 가입 시 3종 동의와 다르게 마케팅 대신
 * 자동 기록 약관이 들어간다).
 */
function TermsScreen() {
  const navigation = useNavigation<TermsNavigationProp>();

  const navigateToTerm = (termType: 'SERVICE' | 'PRIVACY' | 'AUTO_RECORD', title: string) => {
    navigation.navigate('TermDetail', { termType, title });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar type="sub" title={TERMS_LIST_TITLE} onBackPress={() => navigation.goBack()} />
      <CardBase
        style={styles.card}
        onPress={() => navigateToTerm('SERVICE', TERMS_LIST_SERVICE_LABEL)}
      >
        <Text style={styles.cardLabel}>{TERMS_LIST_SERVICE_LABEL}</Text>
      </CardBase>
      <CardBase
        style={styles.card}
        onPress={() => navigateToTerm('PRIVACY', TERMS_LIST_PRIVACY_LABEL)}
      >
        <Text style={styles.cardLabel}>{TERMS_LIST_PRIVACY_LABEL}</Text>
      </CardBase>
      <CardBase
        style={styles.card}
        onPress={() => navigateToTerm('AUTO_RECORD', TERMS_LIST_AUTO_RECORD_LABEL)}
      >
        <Text style={styles.cardLabel}>{TERMS_LIST_AUTO_RECORD_LABEL}</Text>
      </CardBase>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    paddingVertical: 20,
  },
  cardLabel: {
    ...TYPOGRAPHY.subtitle2,
  },
});

export default TermsScreen;
