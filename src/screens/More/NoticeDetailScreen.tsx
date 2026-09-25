/** @screen ETC-4-PAGE-18-0 공지사항 상세 */
/**
 * 시안 UI 요소 3번은 본문 내 URL/이메일을 터치 가능한 링크로 활성화하라고
 * 하지만, RN 기본 `Text`는 플랫폼 공통으로 텍스트 일부만 자동 링크화하는
 * 수단이 없다(iOS `dataDetectorType`은 있으나 Android엔 대응 prop이 없음).
 * 이번 배치 범위에서 새 라이브러리를 들이지 않기로 해 평범한 텍스트로 두고
 * design-verification.md §5-4에 gap으로 남겼다.
 */
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Divider from '../../components/Data Display/Divider/Divider';
import Button from '../../components/Input/Button/Button';
import * as supportService from '../../services/supportService';
import type { NoticeDetail } from '../../services/supportService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  NOTICE_DETAIL_LOADING,
  NOTICE_DETAIL_RETRY_LABEL,
  NOTICE_LIST_TITLE,
} from '../../constants/settingsScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_NORMAL, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type NoticeDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NoticeDetail'>;
type NoticeDetailRouteProp = RouteProp<RootStackParamList, 'NoticeDetail'>;
type LoadState = 'loading' | 'error' | 'ready';

/** 공지사항 상세: 제목 + 등록일 + 본문. AppBar 타이틀은 시안대로 "공지사항" 고정. */
function NoticeDetailScreen() {
  const navigation = useNavigation<NoticeDetailNavigationProp>();
  const route = useRoute<NoticeDetailRouteProp>();
  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const result = await supportService.getNoticeDetail(route.params.noticeId);
      setNotice(result);
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
  }, [route.params.noticeId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ScreenContainer background="secondary">
      <AppBar type="sub" title={NOTICE_LIST_TITLE} onBackPress={() => navigation.goBack()} />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{NOTICE_DETAIL_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button
            label={NOTICE_DETAIL_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}

      {loadState === 'ready' && notice && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{notice.title}</Text>
          <Text style={styles.date}>{notice.createdAt}</Text>
          <View style={styles.dividerWrapper}>
            <Divider />
          </View>
          <Text style={styles.body}>{notice.body}</Text>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    ...TYPOGRAPHY.h3,
  },
  date: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 8,
  },
  dividerWrapper: {
    marginVertical: 16,
  },
  body: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_NORMAL,
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

export default NoticeDetailScreen;
