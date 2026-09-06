/** @screen ETC-4-PAGE-XX-0 약관 상세 (서비스 이용 약관 / 개인정보 처리방침 / 자동 기록 서비스 이용 약관 공용) */
/**
 * 가입 플로우의 `TermsOfServiceScreen`/`PrivacyPolicyScreen`은 로컬 상수
 * 전문(`constants/terms.ts`)을 그대로 보여주지만, 이 화면(설정 > 약관)은
 * 명세상 서버에서 전문을 받아온다(`GET /api/v1/terms/{termType}`, 서버
 * 미구현) — 그래서 `LegalDocumentView`를 그대로 재사용하되 로딩/에러를 감싸는
 * 얇은 래퍼로 새로 만들었다.
 */
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import LegalDocumentView from '../../components/Data Display/Legal Document/LegalDocumentView';
import Button from '../../components/Input/Button/Button';
import * as supportService from '../../services/supportService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  TERM_DETAIL_LOADING,
  TERM_DETAIL_RETRY_LABEL,
} from '../../constants/settingsScreenText';
import { FOREGROUND_DISABLED } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type TermDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TermDetail'>;
type TermDetailRouteProp = RouteProp<RootStackParamList, 'TermDetail'>;
type LoadState = 'loading' | 'error' | 'ready';

/** 약관 전문 상세: 서버에서 받아온 본문을 `LegalDocumentView`로 보여준다. */
function TermDetailScreen() {
  const navigation = useNavigation<TermDetailNavigationProp>();
  const route = useRoute<TermDetailRouteProp>();
  const [bodyText, setBodyText] = useState('');
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const result = await supportService.getTermsText(route.params.termType);
      setBodyText(result);
      setLoadState('ready');
    } catch (error) {
      setErrorMessage(
        isNetworkError(error)
          ? API_NETWORK_ERROR_MESSAGE
          : error instanceof ApiError
          ? getApiErrorMessage(error.code)
          : API_ERROR_DEFAULT_MESSAGE,
      );
      setLoadState('error');
    }
  }, [route.params.termType]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loadState === 'ready') {
    return (
      <LegalDocumentView
        title={route.params.title}
        bodyText={bodyText}
        onPressBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar type="sub" title={route.params.title} onBackPress={() => navigation.goBack()} />
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>
          {loadState === 'loading' ? TERM_DETAIL_LOADING : errorMessage}
        </Text>
        {loadState === 'error' && (
          <Button
            label={TERM_DETAIL_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
});

export default TermDetailScreen;
