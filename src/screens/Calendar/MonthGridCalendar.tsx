import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CalendarTransaction } from '../../types/calendar';
import { getMonthGridWeeks } from '../../utils/calendarGrid';
import { sumTransactions } from '../../utils/transactionSummary';
import { CALENDAR_WEEKDAY_LABELS } from '../../constants/calendarScreenText';
import {
  BORDER_NEUTRAL,
  CALENDAR_TODAY_GREEN,
  LINK_BLUE,
} from '../../constants/colors';

type MonthGridCalendarProps = {
  year: number;
  month: number;
  todayDate: number;
  transactionsByDate: Record<number, CalendarTransaction[]>;
  selectedDate: number | null;
  onSelectDate: (date: number) => void;
};

/** 선택한 연/월의 전체 달력 그리드. 날짜별 입출금 합계를 함께 보여준다. */
function MonthGridCalendar({
  year,
  month,
  todayDate,
  transactionsByDate,
  selectedDate,
  onSelectDate,
}: MonthGridCalendarProps) {
  const weeks = getMonthGridWeeks(year, month);

  return (
    <View>
      <View style={styles.weekdayRow}>
        {CALENDAR_WEEKDAY_LABELS.map(label => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((cell, cellIndex) => {
            if (!cell) {
              return <View key={cellIndex} style={styles.dayCell} />;
            }

            const isToday = cell.date === todayDate;
            const isSelected = cell.date === selectedDate;
            const dayTransactions = transactionsByDate[cell.date] ?? [];
            const amount = sumTransactions(dayTransactions);

            return (
              <Pressable
                key={cellIndex}
                style={styles.dayCell}
                onPress={() => onSelectDate(cell.date)}
              >
                <View
                  style={[
                    styles.dateCircle,
                    isSelected && !isToday && styles.selectedCircle,
                    isToday && styles.todayCircle,
                  ]}
                >
                  <Text style={[styles.dateText, isToday && styles.todayText]}>
                    {cell.date}
                  </Text>
                </View>
                {!isToday && dayTransactions.length > 0 && (
                  <Text
                    style={[
                      styles.amountText,
                      amount > 0 && styles.amountTextPositive,
                    ]}
                  >
                    {amount > 0 ? '+' : ''}
                    {amount.toLocaleString()}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#868E96',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayCell: {
    width: 40,
    alignItems: 'center',
  },
  dateCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL,
  },
  todayCircle: {
    backgroundColor: CALENDAR_TODAY_GREEN,
  },
  dateText: {
    fontSize: 14,
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  amountText: {
    fontSize: 10,
    color: '#495057',
    marginTop: 2,
  },
  amountTextPositive: {
    color: LINK_BLUE,
  },
});

export default MonthGridCalendar;
