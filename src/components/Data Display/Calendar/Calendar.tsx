import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import DateField from '../../Input/Date Field/DateField';
import { getMonthGridWeeks } from '../../../utils/calendarGrid';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';

const CHEVRON_LEFT_ICON = require('../../../assets/icons/nav/Chevron Left.png');
const CHEVRON_RIGHT_ICON = require('../../../assets/icons/nav/Chevron Right.png');
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

type CalendarProps = {
  year: number;
  month: number;
  selectedStartDate?: string;
  selectedEndDate?: string;
  disabledDates?: string[];
  outlinedDates?: string[];
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
  disabledDates,
  outlinedDates,
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
            const isSelected = isStart || isEnd;
            const hasRange =
              selectedStartDate != null &&
              selectedEndDate != null &&
              selectedStartDate !== selectedEndDate;
            const isRangeStart = isStart && hasRange;
            const isRangeEnd = isEnd && hasRange;
            const isInRange =
              selectedStartDate != null &&
              selectedEndDate != null &&
              dateKey > selectedStartDate &&
              dateKey < selectedEndDate;
            const isDisabled = disabledDates?.includes(dateKey) ?? false;
            const isOutlined =
              !isSelected &&
              !isDisabled &&
              (outlinedDates?.includes(dateKey) ?? false);

            return (
              <Pressable
                key={cellIndex}
                style={styles.dayCell}
                disabled={isDisabled}
                onPress={() => onSelectDate(dateKey)}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      styles.dateCircle,
                      isOutlined && styles.dateCircleOutlined,
                      isSelected && styles.dateCircleSelected,
                      isRangeStart && styles.dateCircleRangeStart,
                      isRangeEnd && styles.dateCircleRangeEnd,
                      !isSelected &&
                        !isDisabled &&
                        !isOutlined &&
                        pressed &&
                        styles.dateCirclePressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        cellIndex === 0 && styles.dateTextSunday,
                        isInRange && styles.dateTextInRange,
                        isOutlined && styles.dateTextOutlined,
                        isSelected && styles.dateTextSelected,
                        isDisabled && styles.dateTextDisabled,
                      ]}
                    >
                      {cell.date}
                    </Text>
                  </View>
                )}
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
    color: FOREGROUND_NEUTRAL_NORMAL,
    fontWeight: 'bold',
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
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCirclePressed: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  dateCircleSelected: {
    backgroundColor: FOREGROUND_SECONDARY,
  },
  dateCircleRangeStart: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    opacity: 0.6,
  },
  dateCircleRangeEnd: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  dateCircleOutlined: {
    borderWidth: 1.5,
    borderColor: FOREGROUND_SECONDARY,
  },
  dateText: {
    fontSize: 13,
  },
  dateTextSunday: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  dateTextInRange: {
    color: FOREGROUND_SECONDARY,
  },
  dateTextOutlined: {
    color: FOREGROUND_SECONDARY,
    fontWeight: 'bold',
  },
  dateTextSelected: {
    color: FOREGROUND_INVERSE,
    fontWeight: 'bold',
  },
  dateTextDisabled: {
    color: FOREGROUND_DISABLED,
  },
  dateFieldWrapper: {
    marginTop: 16,
  },
});

export default Calendar;
