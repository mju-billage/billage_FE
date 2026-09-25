/** @screen DSH-1-PAGE-01-0 대시보드 */
/**
 * 5단계(Dashboard API 연동): 목(`MOCK_DASHBOARD_SUMMARY`)이 가정한 화면 구성과
 * 서버 응답 모양이 크게 다르다.
 *  - **2026-09-11 정정**: 미니 캘린더는 시안(DSH-1-PAGE-01-0, `대시보드_메인화면.png`)이
 *    실제로 존재하고 "이번 달 1일부터 2주" 월 그리드를 요구한다(요일 헤더 없이 1~14일).
 *    `dashboardService.getMonthlyCalendar()`(`CalendarScreen.tsx`와 같은 API,
 *    `GET /groups/{groupId}/calendar?yearMonth=...`)로 이번 달분을 따로 불러
 *    `income - expense` 합산해 채운다 — 대시보드 응답 자체의 `calendar` 필드(오늘
 *    기준 지난 14일 롤링 윈도우)는 이 월 그리드와 안 맞아 쓰지 않는다.
 *  - 회비(dues)는 `upcomingDues[]`(마감 임박 건별 D-day/납부 인원)를 그대로
 *    `DuesProgressCard` 캐러셀로 보여준다(시안 UI 요소 3번). 목록이 비면 안내 문구로 대체.
 *  - **2026-09-11 제거, 2026-09-12 사유 정정**: 잔액(AmountCard)/최근 내역
 *    (TransactionListItem)/승인 대기 섹션은 예전에 "새 데이터니 최소 형태로 얹는다"며
 *    추가했다가 다른 세션이 이유 설명 없이 주석으로 꺼둔 채(git blame `6de0cbf`)
 *    방치돼 있었다 — eslint 미사용 경고 13건의 원인이었다. **제거 사유는 "시안에
 *    없어서"가 아니다** — `GET /groups/{groupId}/dashboard`는 이 셋(`summary`/
 *    `approval`/`recentEntries`)을 실제로 내려주고 있어 서버 쪽엔 기획 근거가 있었을
 *    가능성이 높다. 이 화면(DSH-1-PAGE-01-0) 자체가 `billage-ia.md` 기준 W/F·Design
 *    모두 아직 '예정'(미확정)이라 **지금 시안엔 이 데이터가 들어갈 대응 영역이 없어서
 *    당장 그릴 근거가 없다는 뜻일 뿐** — 시안이 확정되면 재검토해야 한다
 *    (`docs/design-verification.md` §5-4 참고). 복원은 이 블록이 마지막으로 살아
 *    있던 커밋 `a7a5a18`(`git show a7a5a18:"src/screens/Dashboard/DashboardScreen.tsx"`)
 *    에서 가능하다.
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
import DuesProgressCard from '../../components/Data Display/Card/DuesProgressCard';
import QuickServiceCard from './QuickServiceCard';
import { MOCK_DASHBOARD_SUMMARY } from '../../types/dashboard';
import type { MiniCalendarData } from '../../types/dashboard';
import { getActiveGroup } from '../../types/group';
import { getCurrentUser } from '../../types/session';
import * as dashboardService from '../../services/dashboardService';
import type {
  CalendarDaySummary,
  DashboardOverview,
} from '../../services/dashboardService';
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
import { formatDDayLabel } from '../../utils/dueDate';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  DASHBOARD_DUES_CARD_DESCRIPTION,
  DASHBOARD_DUES_CARD_REMAINING_SUFFIX,
  DASHBOARD_DUES_EMPTY,
  DASHBOARD_DUES_SECTION_TITLE,
  DASHBOARD_LOADING,
  DASHBOARD_NOTIFICATION_ACCESSIBILITY_LABEL,
  DASHBOARD_QUICK_SERVICE_SUBTITLE_SUFFIX,
  DASHBOARD_QUICK_SERVICE_TITLE,
  DASHBOARD_RETRY_LABEL,
} from '../../constants/dashboardScreenText';
import {
  BACKGROUND_PRIMARY,
  BASIC_0,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { BOTTOM_NAVIGATION_HEIGHT } from '../../components/Navigation/Bottom Navigation/BottomNavigation';

const BELL_ICON = require('../../assets/icons/communication/Bell.png');

type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type LoadState = 'loading' | 'error' | 'ready';

/**
 * `GET /groups/{groupId}/calendar?yearMonth=...`(월간 집계) 응답을 미니 캘린더가
 * 쓰는 모양으로 바꾼다 — `CalendarScreen.tsx`의 `income - expense` 합산 방식과 동일.
 * 대시보드 응답 자체의 `calendar` 필드(오늘 기준 지난 14일 롤링 윈도우)는 안 쓴다 —
 * 시안(DSH-1-PAGE-01-0)이 요구하는 건 "이번 달 1일부터 2주"라 월 그리드 API가 맞다.
 */
function toMiniCalendarData(
  year: number,
  month: number,
  days: CalendarDaySummary[],
): MiniCalendarData {
  return {
    year,
    month,
    monthLabel: `${month}월`,
    days: days.map(day => ({
      date: Number(day.date.split('-')[2]),
      amount: day.income - day.expense,
    })),
  };
}

/** 홈 탭 대시보드 화면: 모임 현황(잔액/승인 대기/회비)과 최근 내역, 빠른 서비스 진입점을 보여준다. */
function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [miniCalendar, setMiniCalendar] = useState<MiniCalendarData | null>(null);
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
    setLoadState('loading');
    try {
      let group = getActiveGroup();
      if (!group) {
        // [치명1] 로그인 직후 첫 포커스처럼 모임 캐시가 아직 없는 순간 대비 —
        // "다시 시도"가 실제로 동작하도록 여기서 한 번 더 직접 불러온다.
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
      const [result, monthDays] = await Promise.all([
        dashboardService.getDashboard(group.id),
        dashboardService.getMonthlyCalendar(group.id, yearMonth),
      ]);
      setOverview(result);
      setMiniCalendar(toMiniCalendarData(year, month, monthDays));
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

  const handlePressQuickService = (itemId: string) => {
    if (itemId === 'statistics') {
      navigation.navigate('Statistics');
      return;
    }
    if (itemId === 'report') {
      navigation.navigate('ReportMain');
      return;
    }
    if (itemId === 'evidence-album') {
      navigation.navigate('ReceiptAlbum');
    }
  };

  const handlePressDues = (duesId: string) => {
    navigation.navigate('DuesDetail', { duesId });
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

        {miniCalendar && (
          <MiniCalendarCard data={miniCalendar} onPress={handlePressMiniCalendar} />
        )}

        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{DASHBOARD_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button label={DASHBOARD_RETRY_LABEL} onPress={load} hierarchy="secondary" style={{ alignSelf: 'center' }} />
          </View>
        )}

        {loadState === 'ready' && overview && (
          <>
            <Text style={styles.sectionTitle}>{DASHBOARD_DUES_SECTION_TITLE}</Text>
            {overview.upcomingDues.length === 0 ? (
              <Text style={styles.duesEmptyText}>{DASHBOARD_DUES_EMPTY}</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.duesCarousel}
              >
                {overview.upcomingDues.map(dues => (
                  <DuesProgressCard
                    key={dues.duesId}
                    type="dashboard"
                    onPress={() => handlePressDues(dues.duesId)}
                    progress={{
                      id: dues.duesId,
                      groupName: dues.title,
                      dDayLabel: formatDDayLabel(dues.daysLeft),
                      description: DASHBOARD_DUES_CARD_DESCRIPTION,
                      highlightDescription: `${dues.targetCount - dues.paidCount}${DASHBOARD_DUES_CARD_REMAINING_SUFFIX}`,
                      paidMemberCount: dues.paidCount,
                      totalMemberCount: dues.targetCount,
                      progressRatio:
                        dues.targetCount > 0 ? dues.paidCount / dues.targetCount : 0,
                    }}
                  />
                ))}
              </ScrollView>
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
              onPress={() => handlePressQuickService(item.id)}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: BOTTOM_NAVIGATION_HEIGHT+ 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 60,
  },
  nickname: {
    ...TYPOGRAPHY.h3,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle1,
    marginTop: 12,
    marginBottom: 0,
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
  duesEmptyText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 16,
  },
  duesCarousel: {
    gap: 12,
  },
  duesCard: {
    backgroundColor: BASIC_0,
  },
  quickServiceSubtitle: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_NORMAL,
    marginTop: 32,
  },
  quickServiceRow: {
    flexDirection: 'row',
    gap: 6,
  },
});

export default DashboardScreen;
