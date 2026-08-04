import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { MiniCalendarData } from '../../types/dashboard';
import { BORDER_NEUTRAL, ERROR_RED, LINK_BLUE } from '../../constants/colors';

const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/ChevronRight.png');
const DAYS_PER_ROW = 7;

type MiniCalendarCardProps = {
  data: MiniCalendarData;
  onPress: () => void;
};

/** 대시보드 상단의 이번 달 14일치 미니 캘린더 카드. */
function MiniCalendarCard({ data, onPress }: MiniCalendarCardProps) {
  const firstWeek = data.days.slice(0, DAYS_PER_ROW);
  const secondWeek = data.days.slice(DAYS_PER_ROW, DAYS_PER_ROW * 2);

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={onPress}>
        <Text style={styles.monthLabel}>{data.monthLabel}</Text>
        <Image source={CHEVRON_RIGHT_ICON} style={styles.chevronIcon} />
      </Pressable>
      <View style={styles.divider} />
      <View style={styles.week}>
        {firstWeek.map(day => (
          <DayCell
            key={day.date}
            day={day}
            highlighted={data.highlightedDates.includes(day.date)}
          />
        ))}
      </View>
      <View style={styles.week}>
        {secondWeek.map(day => (
          <DayCell
            key={day.date}
            day={day}
            highlighted={data.highlightedDates.includes(day.date)}
          />
        ))}
      </View>
    </View>
  );
}

type DayCellProps = {
  day: MiniCalendarData['days'][number];
  highlighted: boolean;
};

function DayCell({ day, highlighted }: DayCellProps) {
  return (
    <View style={styles.dayCell}>
      <Text
        style={[styles.dateText, highlighted && styles.dateTextHighlighted]}
      >
        {day.date}
      </Text>
      {day.amount != null && (
        <Text
          style={[
            styles.amountText,
            day.amount > 0 && styles.amountTextPositive,
          ]}
        >
          {day.amount > 0 ? '+' : ''}
          {day.amount.toLocaleString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chevronIcon: {
    width: 20,
    height: 20,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_NEUTRAL,
    marginVertical: 12,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayCell: {
    alignItems: 'center',
    width: 32,
  },
  dateText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateTextHighlighted: {
    color: ERROR_RED,
  },
  amountText: {
    fontSize: 10,
    color: '#495057',
  },
  amountTextPositive: {
    color: LINK_BLUE,
  },
});

export default MiniCalendarCard;
