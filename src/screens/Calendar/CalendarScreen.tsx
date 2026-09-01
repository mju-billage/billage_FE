/** @screen DSH-2-PAGE-03-0 대시보드 캘린더 */
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Divider from '../../components/Data Display/Divider/Divider';
import Calendar from '../../components/Data Display/Calendar/Calendar';
import CalendarViewToggle from './CalendarViewToggle';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import { MOCK_CALENDAR_MONTH } from '../../types/calendar';
import { sumTransactions } from '../../utils/transactionSummary';
import { formatDateKey, shiftMonth } from '../../utils/calendarGrid';
import {
  CALENDAR_SCREEN_TITLE,
  CALENDAR_WEEKDAY_LABELS,
} from '../../constants/calendarScreenText';
import { BACKGROUND_SECONDARY } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CHEVRON_LEFT_ICON = require('../../assets/icons/nav/Chevron Left.png');
const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/Chevron Right.png');

type CalendarScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Calendar'
>;

/** 캘린더 전체보기 화면. */
function CalendarScreen() {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const [viewedYear, setViewedYear] = useState(MOCK_CALENDAR_MONTH.year);
  const [viewedMonth, setViewedMonth] = useState(MOCK_CALENDAR_MONTH.month);
  const [selectedDate, setSelectedDate] = useState<number | null>(
    MOCK_CALENDAR_MONTH.todayDate,
  );

  const isMockMonth =
    viewedYear === MOCK_CALENDAR_MONTH.year &&
    viewedMonth === MOCK_CALENDAR_MONTH.month;
  const transactionsByDate = isMockMonth
    ? MOCK_CALENDAR_MONTH.transactionsByDate
    : {};
  const selectedTransactions =
    selectedDate != null ? transactionsByDate[selectedDate] ?? [] : [];
  const amountsByDate = Object.fromEntries(
    Object.entries(transactionsByDate).map(([date, txs]) => [
      Number(date),
      sumTransactions(txs),
    ]),
  );

  const selectedDateKey =
    selectedDate != null
      ? formatDateKey(viewedYear, viewedMonth, selectedDate)
      : undefined;
  const todayDateKey = isMockMonth
    ? formatDateKey(viewedYear, viewedMonth, MOCK_CALENDAR_MONTH.todayDate)
    : undefined;

  const handleChangeMonth = (delta: number) => {
    const next = shiftMonth(viewedYear, viewedMonth, delta);
    setViewedYear(next.year);
    setViewedMonth(next.month);
    setSelectedDate(null);
  };

  const handleSelectDate = (dateKey: string) => {
    setSelectedDate(Number(dateKey.split('.')[2]));
  };

  const handlePressDailyToggle = () => {
    // TODO: 일별 보기 화면 미정의(IA 문서에 없음)
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        title={CALENDAR_SCREEN_TITLE}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          <CalendarViewToggle onPressDaily={handlePressDailyToggle} />
        </View>

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

        {selectedDateLabel && (
          <>
            <Text style={styles.selectedDateLabel}>{selectedDateLabel}</Text>
            <View style={styles.dividerWrapper}>
              <Divider />
            </View>
            {selectedTransactions.map(transaction => (
              <TransactionListItem
                key={transaction.id}
                label={transaction.groupName}
                itemName={transaction.itemName}
                amount={transaction.amount}
                hasReceipt={transaction.hasReceipt}
                isPendingApproval={transaction.isPendingApproval}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_SECONDARY,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  selectedDateLabel: {
    ...TYPOGRAPHY.subtitle3,
    marginTop: 16,
    marginBottom: 12,
  },
  dividerWrapper: {
    marginBottom: 8,
  },
});

export default CalendarScreen;
