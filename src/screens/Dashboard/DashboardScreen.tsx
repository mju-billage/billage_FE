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
