import { useCallback, useEffect, useRef, useState } from 'react';
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
  toUserErrorMessage,
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
import {
  SNACKBAR_LOAD_MORE_FAILED,
} from '../../constants/commonText';

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

  const loadMoreFailedRef = useRef(false);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async (activeTab: ReportType) => {
    setLoadState('loading');
    try {
      let group = getActiveGroup();
      if (!group) {
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
      loadMoreFailedRef.current = false;
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadMoreFailedRef.current || isLoadingMore || !hasMore) {
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
    } catch (error) {
      loadMoreFailedRef.current = true;
      showSnackbar(toUserErrorMessage(error, SNACKBAR_LOAD_MORE_FAILED));
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
    paddingHorizontal: 20,
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
