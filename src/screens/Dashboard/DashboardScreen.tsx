/** @screen DSH-1-PAGE-01-0 대시보드 */
/**
 * 5단계(Dashboard API 연동): 목(`MOCK_DASHBOARD_SUMMARY`)이 가정한 화면 구성과
 * 서버 응답 모양이 크게 다르다.
 *  - 미니 캘린더(하루 단위 입출금)는 서버에 대응 데이터가 없다 — "모임 전체
 *    내역 목록"과 같은 뿌리의 공백(docs/api-gaps.md (A)): 날짜별로 집계하려면
 *    그 목록 API가 있어야 하는데 없다. 그래서 항상 빈 상태로 그린다(이번 달,
 *    금액 없음) — 실제로 CLAUDE.md에도 "대시보드 메인/캘린더는 와이어프레임
 *    자체가 예정"이라고 돼 있어 애초에 확정된 기능 스펙이 없다.
 *  - 회비(dues)는 건별 카드(D-day 등)가 아니라 **모임 전체 합계 하나**만 온다
 *    (activeDuesCount/totalTargetCount/paidCount/unpaidCount) — 지금 회비 도메인
 *    자체가 미구현이라 항상 0이고(Dashboard.txt 정책 메모), 나중에 생겨도
 *    이 API로는 건별 카드를 못 만든다(합계 한 줄이 한계). 그래서 카드 캐러셀을
 *    합계 텍스트 한 줄로 바꿨다 — 0이면 그 줄 자체를 안 보여준다("데이터 없음"과
 *    "실제 0"을 굳이 구분하지 않는다, 지금은 항상 후자라 구분할 실익이 없다).
 *  - 잔액/최근 내역/승인 대기는 기존 화면에 아예 슬롯이 없던 새 데이터라
 *    최소 형태로 섹션을 새로 얹었다(AmountCard/TransactionListItem 재사용,
 *    4-A에서 이미 검증된 컴포넌트라 새 디자인을 만들지 않았다).
 *  - 승인 대기 건수는 총무/일반 구분 없이 그대로 보여준다 — 명세가 "현재 구현은
 *    총무와 일반에게 동일한 데이터"라고 명시해 서버 자체가 역할 구분을 안 하고,
 *    디자인 시안도 없어(위 CLAUDE.md 메모) 막을 근거가 없다. 역할별로 감춰야
 *    하면 시안 확인 후 결정 — docs/api-gaps.md에 확인 필요 항목으로 올렸다.
 *
 * `quickServices`는 서버에 대응 도메인이 없는 순수 클라이언트 데이터라 그대로
 * `MOCK_DASHBOARD_SUMMARY.quickServices`를 쓴다(docs/api-integration-plan.md
 * 5단계 계획에 이미 명시돼 있던 예외).
 */
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import FAB from '../../components/Input/Button/FAB';
import IconButton from '../../components/Input/Button/IconButton';
import Button from '../../components/Input/Button/Button';
import MiniCalendarCard from '../../components/Data Display/Card/MiniCalendarCard';
import AmountCard from '../../components/Data Display/Card/AmountCard';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import QuickServiceCard from './QuickServiceCard';
import { MOCK_DASHBOARD_SUMMARY } from '../../types/dashboard';
import { getActiveGroup } from '../../types/group';
import { getCurrentUser } from '../../types/session';
import * as dashboardService from '../../services/dashboardService';
import type { DashboardOverview } from '../../services/dashboardService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  DASHBOARD_DUES_EMPTY,
  DASHBOARD_DUES_SUMMARY_MIDDLE,
  DASHBOARD_DUES_SUMMARY_PREFIX,
  DASHBOARD_DUES_SUMMARY_SUFFIX,
  DASHBOARD_LEDGER_COUNT_SUFFIX,
  DASHBOARD_LOADING,
  DASHBOARD_NOTIFICATION_ACCESSIBILITY_LABEL,
  DASHBOARD_PENDING_APPROVAL_PREFIX,
  DASHBOARD_PENDING_APPROVAL_SUFFIX,
  DASHBOARD_QUICK_SERVICE_SUBTITLE_SUFFIX,
  DASHBOARD_QUICK_SERVICE_TITLE,
  DASHBOARD_RECENT_ENTRIES_EMPTY,
  DASHBOARD_RECENT_ENTRIES_TITLE,
  DASHBOARD_RETRY_LABEL,
  DASHBOARD_SUMMARY_SECTION_TITLE,
} from '../../constants/dashboardScreenText';
import {
  BACKGROUND_PRIMARY,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const BELL_ICON = require('../../assets/icons/communication/Bell.png');

type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type LoadState = 'loading' | 'error' | 'ready';

/** 서버에 하루 단위 입출금 데이터가 없어(위 헤더 코멘트) 항상 이번 달 빈 캘린더만 보여준다. */
function emptyMiniCalendarData() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    monthLabel: `${now.getMonth() + 1}월`,
    days: [],
  };
}

/** 홈 탭 대시보드 화면: 모임 현황(잔액/승인 대기/회비)과 최근 내역, 빠른 서비스 진입점을 보여준다. */
function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');

  const nickname = getCurrentUser()?.name ?? '';

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
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    setLoadState('loading');
    try {
      const result = await dashboardService.getDashboard(group.id);
      setOverview(result);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handlePressNotification = () => {
    navigation.navigate('Notification');
  };

  const handlePressMiniCalendar = () => {
    navigation.navigate('Calendar');
  };

  const handlePressAddTransaction = () => {
    navigation.navigate('TransactionRegister', {});
  };

  const handlePressQuickService = () => {
    // TODO: 보고서 생성 / 통계·분석(DSH-2-PAGE-05-0) / 증빙자료 앨범 화면 구현 후 연결
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <Text style={styles.nickname}>{nickname}</Text>
          <IconButton
            icon={BELL_ICON}
            onPress={handlePressNotification}
            accessibilityLabel={DASHBOARD_NOTIFICATION_ACCESSIBILITY_LABEL}
          />
        </View>

        <MiniCalendarCard
          data={emptyMiniCalendarData()}
          onPress={handlePressMiniCalendar}
        />

        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{DASHBOARD_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button label={DASHBOARD_RETRY_LABEL} onPress={load} hierarchy="secondary" />
          </View>
        )}

        {loadState === 'ready' && overview && (
          <>
            <Text style={styles.sectionTitle}>{DASHBOARD_SUMMARY_SECTION_TITLE}</Text>
            <AmountCard
              type="incomeExpense"
              income={overview.totalIncome}
              expense={overview.totalExpense}
            />
            <View style={styles.summaryMetaRow}>
              <Text style={styles.summaryMetaText}>
                {overview.ledgerCount}{DASHBOARD_LEDGER_COUNT_SUFFIX}
              </Text>
              {overview.pendingEntryCount > 0 && (
                <Text style={styles.summaryMetaText}>
                  {DASHBOARD_PENDING_APPROVAL_PREFIX}
                  {overview.pendingEntryCount}
                  {DASHBOARD_PENDING_APPROVAL_SUFFIX}
                </Text>
              )}
            </View>

            {overview.dues.activeDuesCount > 0 ? (
              <Text style={styles.duesSummaryText}>
                {DASHBOARD_DUES_SUMMARY_PREFIX}
                {overview.dues.activeDuesCount}
                {DASHBOARD_DUES_SUMMARY_MIDDLE}
                {overview.dues.paidCount}/{overview.dues.totalTargetCount}
                {DASHBOARD_DUES_SUMMARY_SUFFIX}
              </Text>
            ) : (
              <Text style={styles.duesEmptyText}>{DASHBOARD_DUES_EMPTY}</Text>
            )}

            <Text style={styles.sectionTitle}>{DASHBOARD_RECENT_ENTRIES_TITLE}</Text>
            {overview.recentEntries.length === 0 ? (
              <Text style={styles.recentEmptyText}>{DASHBOARD_RECENT_ENTRIES_EMPTY}</Text>
            ) : (
              <View style={styles.recentEntriesList}>
                {overview.recentEntries.map(entry => (
                  <TransactionListItem
                    key={entry.id}
                    label={entry.ledgerName}
                    itemName={entry.title}
                    amount={entry.type === 'INCOME' ? entry.amount : -entry.amount}
                    isPendingApproval={entry.approvalStatus === 'PENDING'}
                    onPress={() =>
                      navigation.navigate('TransactionDetail', { transactionId: entry.id })
                    }
                  />
                ))}
              </View>
            )}
          </>
        )}

        <Text style={styles.quickServiceSubtitle}>
          {nickname} {DASHBOARD_QUICK_SERVICE_SUBTITLE_SUFFIX}
        </Text>
        <Text style={styles.sectionTitle}>{DASHBOARD_QUICK_SERVICE_TITLE}</Text>
        <View style={styles.quickServiceRow}>
          {MOCK_DASHBOARD_SUMMARY.quickServices.map(item => (
            <QuickServiceCard
              key={item.id}
              item={item}
              onPress={handlePressQuickService}
            />
          ))}
        </View>
      </ScrollView>
      <FAB onPress={handlePressAddTransaction} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  nickname: {
    ...TYPOGRAPHY.h3,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle1,
    marginTop: 24,
    marginBottom: 12,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 40,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  summaryMetaText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  duesSummaryText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_NORMAL,
    marginTop: 16,
  },
  duesEmptyText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 16,
  },
  recentEmptyText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  recentEntriesList: {
    gap: 4,
  },
  quickServiceSubtitle: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_NORMAL,
    marginTop: 32,
  },
  quickServiceRow: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default DashboardScreen;
