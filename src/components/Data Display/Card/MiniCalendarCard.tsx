import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import CardBase from './CardBase';
import Divider from '../Divider/Divider';
import FolderTabShape from './FolderTabShape';
import { formatWon, truncateDigits } from '../../../utils/currency';
import { todayKey } from '../../../utils/calendarGrid';
import { CALENDAR_WEEKDAY_LABELS } from '../../../constants/calendarScreenText';
import type { MiniCalendarData } from '../../../types/dashboard';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { FONT_FAMILY, FONT_WEIGHT, TYPOGRAPHY } from '../../../constants/typography';

const CHEVRON_RIGHT_ICON = require('../../../assets/icons/nav/Chevron Right.png');

function toDotDateKey(dateKey: string): string {
  return dateKey.replace(/-/g, '.');
}

type MiniCalendarCardProps = {
  data: MiniCalendarData;
  onPress: () => void;
};

function MiniCalendarCard({ data, onPress }: MiniCalendarCardProps) {
  const todayDotKey = todayKey();

  return (
    <CardBase>
      <FolderTabShape fill={FILL_NEUTRAL_SUBTLE} />
      <Pressable style={styles.header} onPress={onPress}>
        <Text style={styles.monthLabel}>{data.monthLabel}</Text>
        <Image source={CHEVRON_RIGHT_ICON} style={styles.chevronIcon} />
      </Pressable>
      <View style={styles.dividerWrapper}>
        <Divider />
      </View>

      <View style={styles.weekdayRow}>
        {CALENDAR_WEEKDAY_LABELS.map(label => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      {data.weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((cell, cellIndex) => {
            const isToday = toDotDateKey(cell.dateKey) === todayDotKey;
            return (
              <View key={cell.dateKey} style={styles.dayCell}>
                <View
                  style={[styles.dateCircle, isToday && styles.dateCircleToday]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      cellIndex === 0 && styles.dateTextSunday,
                    ]}
                  >
                    {cell.day}
                  </Text>
                </View>
                <View style={styles.amountWrap}>
                  {cell.income > 0 && (
                    <Text style={styles.amountTextIncome} numberOfLines={1}>
                      +{truncateDigits(formatWon(cell.income), 8)}
                    </Text>
                  )}
                  {cell.expense > 0 && (
                    <Text style={styles.amountTextExpense} numberOfLines={1}>
                      -{truncateDigits(formatWon(cell.expense), 8)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </CardBase>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    ...TYPOGRAPHY.h3,
  },
  chevronIcon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  dividerWrapper: {
    marginVertical: 12,
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
    marginBottom: 4,
  },
  dayCell: {
    width: 36,
    alignItems: 'center',
    gap: 2,
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleToday: {
    borderWidth: 1.5,
    borderColor: FOREGROUND_SECONDARY,
  },
  dateText: {
    ...TYPOGRAPHY.subtitle1,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  dateTextSunday: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  amountWrap: {
    alignItems: 'center',
  },
  amountTextIncome: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 7,
    lineHeight: 9,
    letterSpacing: 0.4,
    color: FOREGROUND_SECONDARY,
  },
  amountTextExpense: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 7,
    lineHeight: 9,
    letterSpacing: 0.4,
    color: FOREGROUND_PRIMARY,
  },
});

export default MiniCalendarCard;
