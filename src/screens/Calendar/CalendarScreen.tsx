/** @screen DSH-2-PAGE-03-0 대시보드 캘린더 */
/**
 * 2026-09-06: `GET /groups/{groupId}/calendar`(월간 집계, 서버 `미구현`)와
 * `entryService.getGroupEntries`(선택 일자 내역, `from=to=그 날짜`)로 실제
 * 연동했다 — 그동안 `MOCK_CALENDAR_MONTH`(types/calendar.ts) 고정값을 쓰던
 * 화면이었다. 월간 집계 API는 날짜별 수입/지출 "합계"만 주고 개별 내역은
 * 안 줘서(Dashboard.txt 3번), 날짜를 선택할 때마다 그 날짜 하루 범위로 내역
 * 목록을 별도 호출한다.
 */
import { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Divider from '../../components/Data Display/Divider/Divider';
import Calendar from '../../components/Data Display/Calendar/Calendar';
import Button from '../../components/Input/Button/Button';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import { getActiveGroup } from '../../types/group';
import type { EntrySummary } from '../../types/entry';
import * as dashboardService from '../../services/dashboardService';
import type { CalendarDaySummary } from '../../services/dashboardService';
import * as entryService from '../../services/entryService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import { shiftMonth } from '../../utils/calendarGrid';
import {
  CALENDAR_SCREEN_TITLE,
  CALENDAR_WEEKDAY_LABELS,
} from '../../constants/calendarScreenText';
import { BACKGROUND_PRIMARY, BACKGROUND_SECONDARY, FOREGROUND_DISABLED } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CHEVRON_LEFT_ICON = require('../../assets/icons/nav/Chevron Left.png');
const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/Chevron Right.png');

const CALENDAR_LOADING = '캘린더를 불러오는 중이에요.';
const CALENDAR_RETRY_LABEL = '다시 시도';
const DAILY_LOADING = '내역을 불러오는 중이에요.';
const DAILY_EMPTY = '이 날의 내역이 없어요.';
const DAILY_RETRY_LABEL = '다시 시도';

type CalendarScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Calendar'
>;

type MonthLoadState = 'loading' | 'error' | 'ready';
type DayLoadState = 'idle' | 'loading' | 'error' | 'ready';

function toIsoDate(year: number, month: number, date: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

/** 캘린더 전체보기 화면. */
function CalendarScreen() {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const now = new Date();
  const [viewedYear, setViewedYear] = useState(now.getFullYear());
  const [viewedMonth, setViewedMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const [monthLoadState, setMonthLoadState] = useState<MonthLoadState>('loading');
  const [monthErrorMessage, setMonthErrorMessage] = useState('');
  const [monthDays, setMonthDays] = useState<CalendarDaySummary[]>([]);

  const [dayLoadState, setDayLoadState] = useState<DayLoadState>('idle');
  const [dayErrorMessage, setDayErrorMessage] = useState('');
  const [dayEntries, setDayEntries] = useState<EntrySummary[]>([]);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const loadMonth = useCallback(async (year: number, month: number) => {
    setMonthLoadState('loading');
    try {
      const group = getActiveGroup();
      if (!group) {
        setMonthErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setMonthLoadState('error');
        return;
      }
      const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
      const days = await dashboardService.getMonthlyCalendar(group.id, yearMonth);
      setMonthDays(days);
      setMonthLoadState('ready');
    } catch (error) {
      setMonthErrorMessage(toErrorMessage(error));
      setMonthLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMonth(viewedYear, viewedMonth);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewedYear, viewedMonth]),
  );

  const loadDay = useCallback(
    async (year: number, month: number, date: number) => {
      setDayLoadState('loading');
      try {
        const group = getActiveGroup();
        if (!group) {
          setDayErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
          setDayLoadState('error');
          return;
        }
        const isoDate = toIsoDate(year, month, date);
        const result = await entryService.getGroupEntries(group.id, {
          from: isoDate,
          to: isoDate,
        });
        setDayEntries(result.items);
        setDayLoadState('ready');
      } catch (error) {
        setDayErrorMessage(toErrorMessage(error));
        setDayLoadState('error');
      }
    },
    [],
  );

  const amountsByDate: Record<number, number> = {};
  for (const day of monthDays) {
    const dayNumber = Number(day.date.split('-')[2]);
    amountsByDate[dayNumber] = day.income - day.expense;
  }

  const selectedDateKey =
    selectedDate != null
      ? `${viewedYear}.${String(viewedMonth).padStart(2, '0')}.${String(
          selectedDate,
        ).padStart(2, '0')}`
      : undefined;
  const todayDateKey =
    viewedYear === now.getFullYear() && viewedMonth === now.getMonth() + 1
      ? `${viewedYear}.${String(viewedMonth).padStart(2, '0')}.${String(
          now.getDate(),
        ).padStart(2, '0')}`
      : undefined;

  const handleChangeMonth = (delta: number) => {
    const next = shiftMonth(viewedYear, viewedMonth, delta);
    setViewedYear(next.year);
    setViewedMonth(next.month);
    setSelectedDate(null);
    setDayLoadState('idle');
  };

  const handleSelectDate = (dateKey: string) => {
    const date = Number(dateKey.split('.')[2]);
    setSelectedDate(date);
    loadDay(viewedYear, viewedMonth, date);
  };

  const selectedDateLabel =
    selectedDate != null
      ? `${viewedMonth}월 ${selectedDate}일 ${
          CALENDAR_WEEKDAY_LABELS[
            new Date(viewedYear, viewedMonth - 1, selectedDate).getDay()
          ]
        }요일`
      : null;

  return (
    <View style={{backgroundColor: BACKGROUND_SECONDARY, height: '100%'}}>
      <AppBar
        title={CALENDAR_SCREEN_TITLE}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.scrollContent}>
        <View style={styles.monthNavRow}>
          <View style={styles.monthNav}>
            <Pressable onPress={() => handleChangeMonth(-1)} hitSlop={8}>
              <Image source={CHEVRON_LEFT_ICON} style={styles.chevronIcon} />
            </Pressable>
            <Text style={styles.monthLabel}>
              {viewedYear}.{String(viewedMonth).padStart(2, '0')}
            </Text>
            <Pressable onPress={() => handleChangeMonth(1)} hitSlop={8}>
              <Image source={CHEVRON_RIGHT_ICON} style={styles.chevronIcon} />
            </Pressable>
          </View>
        </View>

        {monthLoadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{CALENDAR_LOADING}</Text>
          </View>
        )}

        {monthLoadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{monthErrorMessage}</Text>
            <Button
              label={CALENDAR_RETRY_LABEL}
              onPress={() => loadMonth(viewedYear, viewedMonth)}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          </View>
        )}

        {monthLoadState === 'ready' && (
          <Calendar
            year={viewedYear}
            month={viewedMonth}
            selectedStartDate={selectedDateKey}
            selectedEndDate={selectedDateKey}
            outlinedDates={todayDateKey ? [todayDateKey] : []}
            amountsByDate={amountsByDate}
            onSelectDate={handleSelectDate}
            onChangeMonth={handleChangeMonth}
            showHeader={false}
            showDateFields={false}
          />
        )}
      </View>
      <View style={styles.gap}></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedDateLabel && (
          <>
            <Text style={styles.selectedDateLabel}>{selectedDateLabel}</Text>

            {dayLoadState === 'loading' && (
              <Text style={styles.stateText}>{DAILY_LOADING}</Text>
            )}

            {dayLoadState === 'error' && (
              <View style={styles.stateContainer}>
                <Text style={styles.stateText}>{dayErrorMessage}</Text>
                <Button
                  label={DAILY_RETRY_LABEL}
                  onPress={() => loadDay(viewedYear, viewedMonth, selectedDate!)}
                  hierarchy="secondary"
                  style={{ alignSelf: 'center' }}
                />
              </View>
            )}

            {dayLoadState === 'ready' && dayEntries.length === 0 && (
              <Text style={styles.stateText}>{DAILY_EMPTY}</Text>
            )}

            {dayLoadState === 'ready' &&
              dayEntries.map(entry => (
                <TransactionListItem
                  key={entry.id}
                  label={entry.ledgerName}
                  itemName={entry.title}
                  amount={entry.type === 'INCOME' ? entry.amount : -entry.amount}
                  hasReceipt={entry.receiptCount > 0}
                  isPendingApproval={entry.approvalStatus === 'PENDING'}
                  onPress={() =>
                    navigation.navigate('TransactionDetail', {
                      transactionId: entry.id,
                    })
                  }
                />
              ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: BACKGROUND_SECONDARY,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 30,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chevronIcon: {
    width: 20,
    height: 20,
  },
  monthLabel: {
    ...TYPOGRAPHY.h3,
  },
  gap: {
    height: 16,
    width: '100%',
    backgroundColor: BACKGROUND_PRIMARY,
  },
  selectedDateLabel: {
    ...TYPOGRAPHY.subtitle3,
    marginTop: 16,
    marginBottom: 12,
  },
  dividerWrapper: {
    marginBottom: 8,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 24,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
    textAlign: 'center',
  },
});

export default CalendarScreen;
