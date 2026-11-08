import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import FAB, { FAB_SIZE } from '../../components/Input/Button/FAB';
import IconButton from '../../components/Input/Button/IconButton';
import Button from '../../components/Input/Button/Button';
import MiniCalendarCard from '../../components/Data Display/Card/MiniCalendarCard';
import DuesProgressCard from '../../components/Data Display/Card/DuesProgressCard';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import QuickServiceCard from './QuickServiceCard';
import { takePendingSnackbar } from '../../utils/pendingSnackbar';
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
import { getTwoWeekRange, todayKey } from '../../utils/calendarGrid';
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

const SCREEN_HORIZONTAL_PADDING = 20;
const DUES_CARD_GAP = 8;
// 내역 탭의 SNACKBAR_FAB_GAP(TransactionsScreen.tsx)과 같은 값 — FAB 위로 스낵바를 띄우는 간격
const SNACKBAR_FAB_GAP = 8;

type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type LoadState = 'loading' | 'error' | 'ready';

function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { width: windowWidth } = useWindowDimensions();
  const duesCardWidth = windowWidth - SCREEN_HORIZONTAL_PADDING * 2;

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [miniCalendar, setMiniCalendar] = useState<MiniCalendarData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [groupName, setGroupName] = useState(getActiveGroup()?.name ?? '');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const lastLoadedDayRef = useRef(todayKey());

  const nickname = getCurrentUser()?.name ?? '';

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      let group = getActiveGroup();
      if (!group) {
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      setGroupName(group?.name ?? '');
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const today = new Date();
      const weeks = getTwoWeekRange(today);
      const yearMonths = Array.from(
        new Set(
          weeks
            .flat()
            .map(cell => `${cell.year}-${String(cell.month).padStart(2, '0')}`),
        ),
      );
      const [result, ...monthlyDaysList] = await Promise.all([
        dashboardService.getDashboard(group.id),
        ...yearMonths.map(yearMonth =>
          dashboardService.getMonthlyCalendar(group.id, yearMonth),
        ),
      ]);
      const daysByDateKey = new Map<string, CalendarDaySummary>();
      monthlyDaysList.forEach(days => {
        days.forEach(day => daysByDateKey.set(day.date, day));
      });
      setOverview(result);
      setMiniCalendar({
        monthLabel: `${today.getMonth() + 1}월`,
        weeks: weeks.map(week =>
          week.map(cell => {
            const day = daysByDateKey.get(cell.dateKey);
            return {
              dateKey: cell.dateKey,
              day: cell.day,
              income: day?.income ?? 0,
              expense: day?.expense ?? 0,
            };
          }),
        ),
      });
      lastLoadedDayRef.current = todayKey();
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && todayKey() !== lastLoadedDayRef.current) {
        load();
      }
    });
    return () => subscription.remove();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
      const pending = takePendingSnackbar();
      if (pending) {
        setSnackbarMessage(pending.title);
      }
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
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.groupName} numberOfLines={1}>
            {groupName}
          </Text>
          <IconButton
            icon={BELL_ICON}
            onPress={handlePressNotification}
            accessibilityLabel={DASHBOARD_NOTIFICATION_ACCESSIBILITY_LABEL}
          />
        </View>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
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
            <Text style={styles.duesSectionTitle}>{DASHBOARD_DUES_SECTION_TITLE}</Text>
            {overview.upcomingDues.length === 0 ? (
              <Text style={styles.duesEmptyText}>{DASHBOARD_DUES_EMPTY}</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.duesCarouselScroll}
                contentContainerStyle={styles.duesCarousel}
                snapToInterval={duesCardWidth + DUES_CARD_GAP}
                snapToAlignment="start"
                decelerationRate="fast"
                disableIntervalMomentum
              >
                {overview.upcomingDues.map(dues => (
                  <DuesProgressCard
                    key={dues.duesId}
                    type="dashboard"
                    width={duesCardWidth}
                    onPress={() => handlePressDues(dues.duesId)}
                    progress={{
                      id: dues.duesId,
                      groupName: dues.title,
                      dDayLabel: formatDDayLabel(dues.daysLeft),
                      description: DASHBOARD_DUES_CARD_DESCRIPTION,
                      highlightCount: dues.targetCount - dues.paidCount,
                      highlightDescription: DASHBOARD_DUES_CARD_REMAINING_SUFFIX,
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
        <Text style={styles.quickServiceTitle}>{DASHBOARD_QUICK_SERVICE_TITLE}</Text>
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
      <View style={styles.snackbarSlot} pointerEvents="box-none">
        <Snackbar
          visible={snackbarMessage != null}
          title={snackbarMessage ?? ''}
          onClose={() => setSnackbarMessage(null)}
        />
      </View>
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
  snackbarSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: BOTTOM_NAVIGATION_HEIGHT + 20 + FAB_SIZE + SNACKBAR_FAB_GAP,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    zIndex: 10,
    elevation: 10,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: BOTTOM_NAVIGATION_HEIGHT+ 12,
  },
  fixedHeader: {
    backgroundColor: BACKGROUND_PRIMARY,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 60,
  },
  groupName: {
    ...TYPOGRAPHY.h3,
    flex: 1,
    marginRight: 8,
  },
  duesSectionTitle: {
    ...TYPOGRAPHY.subtitle1,
    marginTop: 12,
    marginBottom: 10,
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
    marginTop: 6,
  },
  duesCarouselScroll: {
    marginHorizontal: -SCREEN_HORIZONTAL_PADDING,
  },
  duesCarousel: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: DUES_CARD_GAP,
  },
  duesCard: {
    backgroundColor: BASIC_0,
  },
  quickServiceSubtitle: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_NORMAL,
    marginTop: 32,
  },
  quickServiceTitle: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 10
  },
  quickServiceRow: {
    flexDirection: 'row',
    gap: 6,
  },
});

export default DashboardScreen;
