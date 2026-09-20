/** @screen ETC-2-PAGE-04-0 보고서 생성 메인화면 */
/**
 * 더보기 메인의 "보고서 생성" 메뉴에서 들어오는 화면(Report.txt, MEMBER 권한 —
 * 총무가 만든 보고서를 일반 관리자도 조회 가능). "+" 버튼이 여는
 * `ReportCreateSheet`(ETC-3-SHEET-05-0)에서 장부별/기간별 생성 폼으로
 * 갈라진다.
 *
 * 목록은 무한 스크롤이다(`TransactionsScreen`과 같은 `onEndReached` 패턴) —
 * Dues 목록(6-A, `size=50` 단일 조회)과 다른 선택인 이유는 성격 차이 때문:
 * 회비는 마감되며 정리되지만 보고서는 **삭제 API 자체가 없어 계속
 * 누적된다**(`reportService.ts` 주석). `size=50`에 안주하면 51번째 보고서부터
 * 조용히 안 보이는, 데이터 유실처럼 보이는 버그가 된다.
 *
 * 카드 탭(2026-09-05, 7-G): `reportType`에 따라 `ReportByLedgerDetail`
 * (ETC-3-PAGE-02-0)/`ReportByPeriodDetail`(ETC-3-PAGE-03-0)로 분기한다.
 *
 * **2026-09-13 정정**: 예전엔 생성 성공 시 이 화면으로 `navigate(...,
 * {snackbarMessage})` 돌아오게 했었다 — 시안 캡처(더보기_보고서생성하기_장부별.png
 * Case C)가 상세가 아니라 이 목록에 스낵바가 뜨는 걸로 보였고, 그때는
 * `ReportByLedgerDetail`/`ReportByPeriodDetail` 화면 자체가 아직 없어 명세 표의
 * "상세 조회로 이동"(ETC-4-PAGE-03-0 No.5)을 따를 수 없었기 때문이다. 이제 그
 * 두 화면이 존재하므로 명세대로 상세로 직접 이동하도록 바꿨다(스낵바도 상세
 * 화면에서 뜬다) — 뒤로가기가 폼이 아니라 이 목록으로 오게 하는 스택 정리도
 * 함께 적용했다(design-verification.md §5-11 참고, `ReportCreateByLedgerScreen`/
 * `ReportCreateByPeriodScreen`).
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import Tabs from '../../components/Navigation/Tabs/Tabs';
import CardBase from '../../components/Data Display/Card/CardBase';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import ReportCreateSheet from './ReportCreateSheet';
import { getActiveGroup } from '../../types/group';
import type { ReportSummaryItem } from '../../types/report';
import type { ReportType } from '../../types/report';
import * as reportService from '../../services/reportService';
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
import { formatDateDot } from '../../utils/dueDate';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  REPORT_MAIN_COUNT_SUFFIX,
  REPORT_MAIN_EMPTY_BY_LEDGER,
  REPORT_MAIN_EMPTY_BY_PERIOD,
  REPORT_MAIN_LOADING,
  REPORT_MAIN_LOADING_MORE,
  REPORT_MAIN_RETRY_LABEL,
  REPORT_MAIN_TITLE,
  REPORT_TAB_BY_LEDGER,
  REPORT_TAB_BY_PERIOD,
} from '../../constants/reportScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const PLUS_ICON = require('../../assets/icons/action/Plus.png');
const SNACKBAR_AUTO_HIDE_MS = 3000;

type LoadState = 'loading' | 'error' | 'ready';
type ReportMainNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReportMainRouteProp = RouteProp<RootStackParamList, 'ReportMain'>;

const TABS = [
  { label: REPORT_TAB_BY_LEDGER, value: 'BY_LEDGER' as ReportType },
  { label: REPORT_TAB_BY_PERIOD, value: 'BY_PERIOD' as ReportType },
];

function ReportMainScreen() {
  const navigation = useNavigation<ReportMainNavigationProp>();
  const route = useRoute<ReportMainRouteProp>();
  const [tab, setTab] = useState<ReportType>('BY_LEDGER');
  const [reports, setReports] = useState<ReportSummaryItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [createSheetVisible, setCreateSheetVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async (activeTab: ReportType) => {
    setLoadState('loading');
    try {
      let group = getActiveGroup();
      if (!group) {
        // [치명1] 로그인 직후 첫 포커스처럼 모임 캐시가 아직 없는 순간 대비.
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const firstPage = await reportService.getReports(group.id, {
        reportType: activeTab,
        page: 0,
      });
      setReports(firstPage.items);
      setPage(firstPage.page);
      setHasMore(!firstPage.last);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = await reportService.getReports(group.id, {
        reportType: tab,
        page: page + 1,
      });
      setReports(current => [...current, ...nextPage.items]);
      setPage(nextPage.page);
      setHasMore(!nextPage.last);
    } catch {
      // 다음 페이지 실패는 조용히 무시한다 — 다시 스크롤하면 재시도된다.
    } finally {
      setIsLoadingMore(false);
    }
  }, [tab, page, isLoadingMore, hasMore]);

  useFocusEffect(
    useCallback(() => {
      load(tab);
    }, [load, tab]),
  );

  useEffect(() => {
    if (route.params?.snackbarMessage) {
      setSnackbarMessage(route.params.snackbarMessage);
      setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
      navigation.setParams({ snackbarMessage: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.snackbarMessage]);

  return (
    <ScreenContainer
      background="primary"
      snackbar={
        snackbarMessage ? (
          <Snackbar
            visible
            title={snackbarMessage}
            onClose={() => setSnackbarMessage(null)}
          />
        ) : undefined
      }
    >
      <AppBar
        type="sub"
        title={REPORT_MAIN_TITLE}
        onBackPress={() => navigation.goBack()}
        rightIcons={[{ icon: PLUS_ICON, onPress: () => setCreateSheetVisible(true) }]}
      />

      <View style={styles.body}>
        <Tabs items={TABS} value={tab} onChange={setTab} showIcon={false} />

        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{REPORT_MAIN_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button
              label={REPORT_MAIN_RETRY_LABEL}
              onPress={() => load(tab)}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          </View>
        )}

        {loadState === 'ready' && (
          <>
            <Text style={styles.countText}>
              {reports.length}
              {REPORT_MAIN_COUNT_SUFFIX}
            </Text>

            {reports.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {tab === 'BY_LEDGER' ? REPORT_MAIN_EMPTY_BY_LEDGER : REPORT_MAIN_EMPTY_BY_PERIOD}
                </Text>
              </View>
            ) : (
              <FlatList
                data={reports}
                keyExtractor={item => item.reportId}
                contentContainerStyle={styles.listContent}
                onEndReachedThreshold={0.4}
                onEndReached={loadMore}
                ListFooterComponent={
                  isLoadingMore ? (
                    <View style={styles.loadingMoreRow}>
                      <ActivityIndicator size="small" />
                      <Text style={styles.loadingMoreText}>{REPORT_MAIN_LOADING_MORE}</Text>
                    </View>
                  ) : null
                }
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() =>
                      navigation.navigate(
                        item.reportType === 'BY_LEDGER'
                          ? 'ReportByLedgerDetail'
                          : 'ReportByPeriodDetail',
                        { reportId: item.reportId },
                      )
                    }
                  >
                    <CardBase style={styles.card}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.cardSubtitle}>{formatDateDot(item.createdAt)}</Text>
                    </CardBase>
                  </Pressable>
                )}
              />
            )}
          </>
        )}
      </View>

      <ReportCreateSheet
        visible={createSheetVisible}
        onClose={() => setCreateSheetVisible(false)}
        onPressByLedger={() => {
          setCreateSheetVisible(false);
          navigation.navigate('ReportCreateByLedger');
        }}
        onPressByPeriod={() => {
          setCreateSheetVisible(false);
          navigation.navigate('ReportCreateByPeriod');
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  countText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 8,
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
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    gap: 4,
  },
  cardTitle: {
    ...TYPOGRAPHY.subtitle2,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  loadingMoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingMoreText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default ReportMainScreen;
