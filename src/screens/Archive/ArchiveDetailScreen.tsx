/** @screen ETC-3-PAGE-03-0 더보기 > 보관함 > 기록 보기 */
/**
 * ia.md는 이 ID를 보고서 상세(`ReportByPeriodDetailScreen`)와 동일하다고
 * 적어두었고 시안 헤더도 "기록 보고서 공통 로직 상속"이라 적었지만, 실제
 * API 응답 구조가 다르다 — 보고서 상세(`GET /reports/{id}`)는 장부별 `entries`
 * 스냅샷까지 통째로 내려주는데, 보관 상세(`GET /archives/{id}`, Folder.txt
 * 8번)는 장부 요약(수입/지출 합계)까지만 내려주고 내역 단위 데이터가 없다.
 * 그래서 `ReportPeriodEntries`/`ReportLedgerEntries`로 드릴다운할 데이터가
 * 없어 화면을 그대로 재사용하지 못했다 — 보고서 상세와 같은 카드 레이아웃만
 * 가져오고, 장부 카드는 눌러도 이동하지 않는 읽기 전용 요약으로 새로 만들었다.
 * (판단 지점 — 배치 보고 참고)
 */
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import CardBase from '../../components/Data Display/Card/CardBase';
import type { ArchiveDetail } from '../../types/archive';
import * as archiveService from '../../services/archiveService';
import { ApiError } from '../../services/apiClient';
import { formatWon } from '../../utils/currency';
import { formatDateDot } from '../../utils/dueDate';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  ARCHIVE_DETAIL_CREATED_AT_LABEL,
  ARCHIVE_DETAIL_EMPTY,
  ARCHIVE_DETAIL_LOADING,
  ARCHIVE_RETRY_LABEL,
} from '../../constants/archiveScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type LoadState = 'loading' | 'error' | 'ready';
type ArchiveDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ArchiveDetailRouteProp = RouteProp<RootStackParamList, 'ArchiveDetail'>;

function ArchiveDetailScreen() {
  const navigation = useNavigation<ArchiveDetailNavigationProp>();
  const route = useRoute<ArchiveDetailRouteProp>();
  const { archiveId } = route.params;

  const [archive, setArchive] = useState<ArchiveDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const detail = await archiveService.getArchiveDetail(archiveId);
      setArchive(detail);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [archiveId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loadState === 'loading' || loadState === 'error' || !archive) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <AppBar type="sub" title="" onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'error' ? loadErrorMessage : ARCHIVE_DETAIL_LOADING}
          </Text>
          {loadState === 'error' && (
            <Button
              label={ARCHIVE_RETRY_LABEL}
              onPress={load}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar type="sub" title={archive.title} onBackPress={() => navigation.goBack()} />

      <View style={styles.body}>
        <Text style={styles.metaText}>
          {ARCHIVE_DETAIL_CREATED_AT_LABEL} {formatDateDot(archive.archivedAt)}
        </Text>

        {archive.ledgers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{ARCHIVE_DETAIL_EMPTY}</Text>
          </View>
        ) : (
          <FlatList
            data={archive.ledgers}
            keyExtractor={item => item.archivedLedgerId}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <CardBase style={styles.ledgerCard}>
                <Text style={styles.ledgerName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.periodText}>
                  {formatDateDot(item.startDate)} - {formatDateDot(item.endDate)}
                </Text>
                <Text style={styles.ledgerIncome}>+{formatWon(item.totalIncome)}원</Text>
                <Text style={styles.ledgerExpense}>-{formatWon(item.totalExpense)}원</Text>
              </CardBase>
            )}
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
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 8,
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
  metaText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  ledgerCard: {
    gap: 4,
  },
  ledgerName: {
    ...TYPOGRAPHY.subtitle3,
  },
  periodText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  ledgerIncome: {
    ...TYPOGRAPHY.body2,
  },
  ledgerExpense: {
    ...TYPOGRAPHY.body2,
  },
});

export default ArchiveDetailScreen;
