/** @screen ETC-3-PAGE-09-0 공지사항 */
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import CardBase from '../../components/Data Display/Card/CardBase';
import Button from '../../components/Input/Button/Button';
import * as supportService from '../../services/supportService';
import type { NoticeSummary } from '../../services/supportService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  NOTICE_LIST_EMPTY,
  NOTICE_LIST_LOADING,
  NOTICE_LIST_RETRY_LABEL,
  NOTICE_LIST_TITLE,
} from '../../constants/settingsScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type NoticeListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NoticeList'>;
type LoadState = 'loading' | 'error' | 'ready';

/** 공지사항 목록(최신순). 항목 탭 시 상세로 이동한다. */
function NoticeListScreen() {
  const navigation = useNavigation<NoticeListNavigationProp>();
  const [notices, setNotices] = useState<NoticeSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const result = await supportService.getNotices();
      setNotices(result);
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ScreenContainer background="primary">
      <AppBar type="sub" title={NOTICE_LIST_TITLE} onBackPress={() => navigation.goBack()} />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{NOTICE_LIST_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button
            label={NOTICE_LIST_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}

      {loadState === 'ready' && notices.length === 0 && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{NOTICE_LIST_EMPTY}</Text>
        </View>
      )}

      {loadState === 'ready' && notices.length > 0 && (
        <FlatList
          data={notices}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <CardBase
              onPress={() => navigation.navigate('NoticeDetail', { noticeId: item.id })}
            >
              <Text style={styles.noticeTitle}>{item.title}</Text>
              <Text style={styles.noticeDate}>{item.createdAt}</Text>
            </CardBase>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  noticeTitle: {
    ...TYPOGRAPHY.subtitle3,
  },
  noticeDate: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 4,
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

export default NoticeListScreen;
