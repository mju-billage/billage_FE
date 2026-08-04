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
import AppBar from '../../components/Navigation/AppBar';
import MonthGridCalendar from './MonthGridCalendar';
import CalendarViewToggle from './CalendarViewToggle';
import TransactionListItem from './TransactionListItem';
import { MOCK_CALENDAR_MONTH } from '../../types/calendar';
import { shiftMonth } from '../../utils/calendarGrid';
import {
  CALENDAR_SCREEN_TITLE,
  CALENDAR_WEEKDAY_LABELS,
} from '../../constants/calendarScreenText';
import { BORDER_NEUTRAL } from '../../constants/colors';

const CHEVRON_LEFT_ICON = require('../../assets/icons/nav/ChevronLeft.png');
const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/ChevronRight.png');
const NO_MOCK_DATE = -1;

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

  const handlePressPrevMonth = () => {
    const next = shiftMonth(viewedYear, viewedMonth, -1);
    setViewedYear(next.year);
    setViewedMonth(next.month);
    setSelectedDate(null);
  };

  const handlePressNextMonth = () => {
    const next = shiftMonth(viewedYear, viewedMonth, 1);
    setViewedYear(next.year);
    setViewedMonth(next.month);
    setSelectedDate(null);
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
            <Pressable onPress={handlePressPrevMonth} hitSlop={8}>
              <Image source={CHEVRON_LEFT_ICON} style={styles.chevronIcon} />
            </Pressable>
            <Text style={styles.monthLabel}>
              {viewedYear}.{String(viewedMonth).padStart(2, '0')}
            </Text>
            <Pressable onPress={handlePressNextMonth} hitSlop={8}>
              <Image source={CHEVRON_RIGHT_ICON} style={styles.chevronIcon} />
            </Pressable>
          </View>
          <CalendarViewToggle onPressDaily={handlePressDailyToggle} />
        </View>

        <MonthGridCalendar
          year={viewedYear}
          month={viewedMonth}
          todayDate={isMockMonth ? MOCK_CALENDAR_MONTH.todayDate : NO_MOCK_DATE}
          transactionsByDate={transactionsByDate}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {selectedDateLabel && (
          <>
            <Text style={styles.selectedDateLabel}>{selectedDateLabel}</Text>
            <View style={styles.divider} />
            {selectedTransactions.map(transaction => (
              <TransactionListItem
                key={transaction.id}
                transaction={transaction}
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
    backgroundColor: '#FFFFFF',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedDateLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_NEUTRAL,
    marginBottom: 8,
  },
});

export default CalendarScreen;
