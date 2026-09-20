import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import DateField from '../../Input/Date Field/DateField';
import { formatWon } from '../../../utils/currency';
import { formatDateKey, getMonthGridWeeks } from '../../../utils/calendarGrid';
import { CALENDAR_WEEKDAY_LABELS } from '../../../constants/calendarScreenText';
import { TYPOGRAPHY } from '../../../constants/typography';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FILL_NEUTRAL_NORMAL,
  FILL_SECONDARY_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';

const CHEVRON_LEFT_ICON = require('../../../assets/icons/nav/Chevron Left.png');
const CHEVRON_RIGHT_ICON = require('../../../assets/icons/nav/Chevron Right.png');

type CalendarProps = {
  year: number;
  month: number;
  selectedStartDate?: string;
  selectedEndDate?: string;
  disabledDates?: string[];
  outlinedDates?: string[];
  /** 날짜 아래에 표시할 날짜별 금액(일자 → 금액). */
  amountsByDate?: Record<number, number | null | undefined>;
  /** 앞에서부터 보여줄 주(week) 수. 기본값은 해당 월 전체. */
  weeksToShow?: number;
  /** 내부 월이동 헤더 노출 여부. 기본 true. */
  showHeader?: boolean;
  /** false면 날짜 셀이 탭 불가능한 순수 표시용이 된다. 기본 true. */
  interactive?: boolean;
  onSelectDate?: (date: string) => void;
  onChangeMonth?: (delta: number) => void;
  showDateFields?: boolean;
};

/** 앱 전체에서 쓰는 유일한 날짜 그리드 컴포넌트. 범위 선택형 바텀시트부터 대시보드 미니 미리보기,
 * 내역 탭 전체 월 보기까지 옵션으로 커버한다. */
function Calendar({
  year,
  month,
  selectedStartDate,
  selectedEndDate,
  disabledDates,
  outlinedDates,
  amountsByDate,
  weeksToShow,
  showHeader = true,
  interactive = true,
  onSelectDate,
  onChangeMonth,
  showDateFields = true,
}: CalendarProps) {
  const allWeeks = getMonthGridWeeks(year, month);
  const weeks =
    weeksToShow != null ? allWeeks.slice(0, weeksToShow) : allWeeks;

  return (
    <View>
      {showHeader && (
        <View style={styles.header}>
          <Pressable onPress={() => onChangeMonth?.(-1)} hitSlop={8}>
            <Image source={CHEVRON_LEFT_ICON} style={styles.chevron} />
          </Pressable>
          <Text style={styles.monthLabel}>
            {year}년 {month}월
          </Text>
          <Pressable onPress={() => onChangeMonth?.(1)} hitSlop={8}>
            <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
          </Pressable>
        </View>
      )}

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
            const amount = amountsByDate?.[cell.date];

            const renderCircle = (pressed: boolean) => (
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
            );

            return (
              <View key={cellIndex} style={styles.dayCell}>
                {/* 명세 No.3 [액션]: "시작일/종료일/사이 구간이 시각적으로 구분되어야 함" —
                    사이 구간은 옅은 배경 띠로 이어 붙이고, 전체 구간의 양 끝(시작일/종료일)
                    쪽만 둥글게 처리한다(안쪽 경계는 각지게 둬야 셀 사이가 이어져 보인다). */}
                {(isInRange || isRangeStart || isRangeEnd) && (
                  <View
                    style={[
                      styles.rangeBand,
                      isInRange && styles.rangeBandFull,
                      isRangeStart && styles.rangeBandStart,
                      isRangeEnd && styles.rangeBandEnd,
                    ]}
                  />
                )}
                {interactive ? (
                  <Pressable
                    style={styles.dayCellTouchable}
                    disabled={isDisabled}
                    onPress={() => onSelectDate?.(dateKey)}
                  >
                    {({ pressed }) => renderCircle(pressed)}
                  </Pressable>
                ) : (
                  renderCircle(false)
                )}
                {amount != null && (
                  <Text
                    style={[
                      styles.amountText,
                      amount > 0 && styles.amountTextPositive,
                    ]}
                  >
                    {amount > 0 ? '+' : ''}
                    {formatWon(amount)}
                  </Text>
                )}
              </View>
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
    ...TYPOGRAPHY.subtitle1,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    ...TYPOGRAPHY.subtitle1,
    width: 36,
    textAlign: 'center',
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayCell: {
    width: 36,
    alignItems: 'center',
    gap: 2,
    position: 'relative',
  },
  rangeBand: {
    position: 'absolute',
    top: 0,
    height: 32,
  },
  rangeBandFull: {
    left: 0,
    right: 0,
    backgroundColor: FILL_SECONDARY_SUBTLE,
  },
  rangeBandStart: {
    left: '50%',
    right: 0,
    backgroundColor: FILL_SECONDARY_SUBTLE,
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },
  rangeBandEnd: {
    left: 0,
    right: '50%',
    backgroundColor: FILL_SECONDARY_SUBTLE,
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
  },
  dayCellTouchable: {
    width: '100%',
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
    borderRadius: 9,
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
    ...TYPOGRAPHY.body3,
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
  amountText: {
    ...TYPOGRAPHY.caption,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  amountTextPositive: {
    color: FOREGROUND_SECONDARY,
  },
  dateFieldWrapper: {
    marginTop: 16,
  },
});

export default Calendar;
