import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import DateField from '../Field/DateField';
import { getMonthGridWeeks } from '../../utils/calendarGrid';
import {
  BACKGROUND_PRIMARY,
  LINK_BLUE,
  TEXT_MUTED,
} from '../../constants/colors';

const CHEVRON_LEFT_ICON = require('../../assets/icons/nav/ChevronLeft.png');
const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/ChevronRight.png');
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

type CalendarProps = {
  year: number;
  month: number;
  selectedStartDate?: string;
  selectedEndDate?: string;
  onSelectDate: (date: string) => void;
  onChangeMonth: (delta: number) => void;
  showDateFields?: boolean;
};

/** 시작~종료 날짜 범위를 선택하는 범용 캘린더. */
function Calendar({
  year,
  month,
  selectedStartDate,
  selectedEndDate,
  onSelectDate,
  onChangeMonth,
  showDateFields = true,
}: CalendarProps) {
  const weeks = getMonthGridWeeks(year, month);

  return (
    <View>
      <View style={styles.header}>
        <Pressable onPress={() => onChangeMonth(-1)} hitSlop={8}>
          <Image source={CHEVRON_LEFT_ICON} style={styles.chevron} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {year}년 {month}월
        </Text>
        <Pressable onPress={() => onChangeMonth(1)} hitSlop={8}>
          <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map(label => (
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
            const dateKey = formatDateKey(year, month, cell.date);
            const isStart = dateKey === selectedStartDate;
            const isEnd = dateKey === selectedEndDate;
            const isInRange =
              selectedStartDate != null &&
              selectedEndDate != null &&
              dateKey > selectedStartDate &&
              dateKey < selectedEndDate;

            return (
              <Pressable
                key={cellIndex}
                style={styles.dayCell}
                onPress={() => onSelectDate(dateKey)}
              >
                <View
                  style={[
                    styles.dateCircle,
                    isInRange && styles.dateCircleInRange,
                    (isStart || isEnd) && styles.dateCircleSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      (isStart || isEnd) && styles.dateTextSelected,
                    ]}
                  >
                    {cell.date}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}

      {showDateFields && (
        <View style={styles.dateFieldWrapper}>
          <DateField
            startDate={selectedStartDate}
            endDate={selectedEndDate}
            onPress={() => {}}
          />
        </View>
      )}
    </View>
  );
}

function formatDateKey(year: number, month: number, date: number) {
  return `${year}.${String(month).padStart(2, '0')}.${String(date).padStart(
    2,
    '0',
  )}`;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chevron: {
    width: 20,
    height: 20,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    color: TEXT_MUTED,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayCell: {
    width: 36,
    alignItems: 'center',
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleInRange: {
    backgroundColor: BACKGROUND_PRIMARY,
  },
  dateCircleSelected: {
    backgroundColor: LINK_BLUE,
  },
  dateText: {
    fontSize: 13,
  },
  dateTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dateFieldWrapper: {
    marginTop: 16,
  },
});

export default Calendar;
