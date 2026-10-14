import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import DateField from '../../Input/Date Field/DateField';
import { formatWon } from '../../../utils/currency';
import { formatDateKey, getMonthGridWeeks } from '../../../utils/calendarGrid';
import { CALENDAR_WEEKDAY_LABELS } from '../../../constants/calendarScreenText';
import { FONT_FAMILY, FONT_WEIGHT, TYPOGRAPHY } from '../../../constants/typography';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FILL_NEUTRAL_NORMAL,
  FILL_SECONDARY_SUBTLE,
  FILL_SECONDARY_SUBTLER,
  FOREGROUND_DISABLED,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
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
  amountsByDate?: Record<number, number | null | undefined>;
  weeksToShow?: number;
  showHeader?: boolean;
  interactive?: boolean;
  onSelectDate?: (date: string) => void;
  onChangeMonth?: (delta: number) => void;
  showDateFields?: boolean;
  largeDates?: boolean;
  variant?: 'default' | 'ledger' | 'picker';
  amountsSplitByDate?: Record<number, { income: number; expense: number }>;
};

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
  largeDates = false,
  variant = 'default',
  amountsSplitByDate,
}: CalendarProps) {
  const allWeeks = getMonthGridWeeks(year, month);
  const weeks =
    weeksToShow != null ? allWeeks.slice(0, weeksToShow) : allWeeks;

  const renderLedgerDayCell = (
    cellIndex: number,
    cell: { date: number } | null,
  ) => {
    if (!cell) {
      return (
        <View key={cellIndex} style={[styles.dayCell, styles.dayCellLedger]} />
      );
    }
    const dateKey = formatDateKey(year, month, cell.date);
    const isSelected = dateKey === selectedStartDate || dateKey === selectedEndDate;
    const isDisabled = disabledDates?.includes(dateKey) ?? false;
    const split = amountsSplitByDate?.[cell.date];
    const income = split?.income ?? 0;
    const expense = split?.expense ?? 0;

    const cellStyle = (pressed: boolean) => [
      styles.dayCell,
      styles.dayCellLedger,
      isSelected && styles.dayCellLedgerSelected,
      !isSelected && !isDisabled && pressed && styles.dayCellLedgerPressed,
    ];

    const content = (
      <>
        <View style={styles.ledgerDateWrap}>
          <Text
            style={[
              styles.ledgerDateText,
              isSelected && styles.ledgerDateTextSelected,
              isDisabled && styles.dateTextDisabled,
            ]}
          >
            {cell.date}
          </Text>
        </View>
        <View style={styles.ledgerAmountWrap}>
          {!isDisabled && income > 0 && (
            <Text style={styles.ledgerAmountIncome} numberOfLines={1}>
              +{formatWon(income)}
            </Text>
          )}
          {!isDisabled && expense > 0 && (
            <Text style={styles.ledgerAmountExpense} numberOfLines={1}>
              -{formatWon(expense)}
            </Text>
          )}
        </View>
      </>
    );

    if (interactive) {
      return (
        <Pressable
          key={cellIndex}
          style={({ pressed }) => cellStyle(pressed)}
          disabled={isDisabled}
          onPress={() => onSelectDate?.(dateKey)}
        >
          {content}
        </Pressable>
      );
    }
    return (
      <View key={cellIndex} style={cellStyle(false)}>
        {content}
      </View>
    );
  };

  const renderPickerDayCell = (
    cellIndex: number,
    cell: { date: number } | null,
  ) => {
    if (!cell) {
      return (
        <View key={cellIndex} style={[styles.dayCell, styles.dayCellPicker]} />
      );
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
      !isInRange &&
      !isDisabled &&
      (outlinedDates?.includes(dateKey) ?? false);

    const backdropStyle = (pressed: boolean) => [
      styles.pickerBackdrop,
      isInRange && styles.pickerBackdropInRange,
      isSelected && styles.pickerBackdropSelected,
      isRangeStart && styles.pickerBackdropRangeStart,
      isRangeStart && styles.pickerBackdropStartDim,
      isRangeEnd && styles.pickerBackdropRangeEnd,
      isOutlined && styles.pickerBackdropOutlined,
      !isSelected &&
        !isInRange &&
        !isOutlined &&
        !isDisabled &&
        pressed &&
        styles.pickerBackdropPressed,
    ];

    const textStyle = [
      styles.pickerDateText,
      cellIndex === 0 && styles.dateTextSunday,
      isInRange && styles.pickerDateTextInRange,
      isOutlined && styles.pickerDateTextOutlined,
      isSelected && styles.pickerDateTextSelected,
      isDisabled && styles.dateTextDisabled,
    ];

    const content = (pressed: boolean) => (
      <>
        <View style={backdropStyle(pressed)} />
        <Text style={textStyle}>{cell.date}</Text>
      </>
    );

    if (interactive) {
      return (
        <Pressable
          key={cellIndex}
          style={[styles.dayCell, styles.dayCellPicker]}
          disabled={isDisabled}
          onPress={() => onSelectDate?.(dateKey)}
        >
          {({ pressed }) => content(pressed)}
        </Pressable>
      );
    }
    return (
      <View key={cellIndex} style={[styles.dayCell, styles.dayCellPicker]}>
        {content(false)}
      </View>
    );
  };

  const pickerFieldDate = (dateKey?: string) =>
    dateKey ? dateKey.slice(2) : undefined;

  return (
    <View>
      {showHeader && (
        variant === 'picker' ? (
          <View style={styles.headerPicker}>
            <Pressable onPress={() => onChangeMonth?.(-1)} hitSlop={8}>
              <Image
                source={CHEVRON_LEFT_ICON}
                style={[styles.chevron, styles.pickerChevron]}
              />
            </Pressable>
            <Text style={styles.monthLabel}>
              {year}년 {month}월
            </Text>
            <Pressable onPress={() => onChangeMonth?.(1)} hitSlop={8}>
              <Image
                source={CHEVRON_RIGHT_ICON}
                style={[styles.chevron, styles.pickerChevron]}
              />
            </Pressable>
          </View>
        ) : (
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
        )
      )}

      <View style={styles.weekdayRow}>
        {CALENDAR_WEEKDAY_LABELS.map(label => (
          <Text
            key={label}
            style={[
              styles.weekdayLabel,
              variant === 'ledger' && styles.weekdayLabelLedger,
              variant === 'picker' && styles.weekdayLabelPicker,
            ]}
          >
            {label}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View
          key={weekIndex}
          style={[
            styles.weekRow,
            variant === 'ledger' && styles.weekRowLedger,
            variant === 'picker' && styles.weekRowPicker,
          ]}
        >
          {week.map((cell, cellIndex) => {
            if (variant === 'ledger') {
              return renderLedgerDayCell(cellIndex, cell);
            }
            if (variant === 'picker') {
              return renderPickerDayCell(cellIndex, cell);
            }
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
                    largeDates && styles.dateTextLarge,
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
          {variant === 'picker' ? (
            <DateField
              startDate={pickerFieldDate(selectedStartDate)}
              endDate={pickerFieldDate(selectedEndDate)}
              onPress={() => {}}
              bleed={20}
            />
          ) : (
            <DateField
              startDate={selectedStartDate}
              endDate={selectedEndDate}
              onPress={() => {}}
            />
          )}
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
  headerPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  pickerChevron: {
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
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
  weekdayLabelLedger: {
    flex: 1,
  },
  weekdayLabelPicker: {
    flex: 1,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekRowLedger: {
    marginBottom: 2,
  },
  weekRowPicker: {
    marginBottom: 4,
  },
  dayCell: {
    width: 36,
    alignItems: 'center',
    gap: 2,
    position: 'relative',
  },
  dayCellPicker: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  pickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
  },
  pickerBackdropSelected: {
    backgroundColor: FOREGROUND_SECONDARY,
  },
  pickerBackdropRangeStart: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  pickerBackdropStartDim: {
    opacity: 0.6,
  },
  pickerBackdropRangeEnd: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  pickerBackdropInRange: {
    backgroundColor: FILL_SECONDARY_SUBTLER,
    borderRadius: 0,
  },
  pickerBackdropOutlined: {
    borderWidth: 1,
    borderColor: FOREGROUND_SECONDARY,
  },
  pickerBackdropPressed: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  pickerDateText: {
    ...TYPOGRAPHY.subtitle1,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  pickerDateTextInRange: {
    color: FOREGROUND_SECONDARY,
  },
  pickerDateTextOutlined: {
    color: FOREGROUND_SECONDARY,
  },
  pickerDateTextSelected: {
    color: FOREGROUND_INVERSE,
  },
  dayCellLedger: {
    flex: 1,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayCellLedgerSelected: {
    backgroundColor: FILL_SECONDARY_SUBTLER,
  },
  dayCellLedgerPressed: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  ledgerDateWrap: {
    height: 24,
    justifyContent: 'center',
  },
  ledgerDateText: {
    ...TYPOGRAPHY.subtitle1,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  ledgerDateTextSelected: {
    color: FOREGROUND_PRIMARY,
  },
  ledgerAmountWrap: {
    height: 18,
  },
  ledgerAmountIncome: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 7,
    lineHeight: 9,
    letterSpacing: 0.4,
    color: FOREGROUND_SECONDARY,
  },
  ledgerAmountExpense: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 7,
    lineHeight: 9,
    letterSpacing: 0.4,
    color: FOREGROUND_PRIMARY,
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
  dateTextLarge: {
    ...TYPOGRAPHY.subtitle1,
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
