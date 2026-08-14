import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Divider from '../Divider/Divider';
import FolderTabShape from './FolderTabShape';
import type { MiniCalendarData } from '../../../types/dashboard';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';

const CHEVRON_RIGHT_ICON = require('../../../assets/icons/nav/Chevron Right.png');
const DAYS_PER_ROW = 7;
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

type MiniCalendarCardProps = {
  data: MiniCalendarData;
  onPress: () => void;
};

/** 대시보드 상단의 이번 달 14일치 미니 캘린더 카드. 첫 날짜의 실제 요일에 맞춰 앞에 빈 칸을 채운다. */
function MiniCalendarCard({ data, onPress }: MiniCalendarCardProps) {
  const firstDay = data.days[0];
  const leadingOffset = firstDay
    ? new Date(data.year, data.month - 1, firstDay.date).getDay()
    : 0;
  const cells: Array<MiniCalendarData['days'][number] | null> = [
    ...Array(leadingOffset).fill(null),
    ...data.days,
  ].slice(0, DAYS_PER_ROW * 2);
  const firstWeek = cells.slice(0, DAYS_PER_ROW);
  const secondWeek = cells.slice(DAYS_PER_ROW, DAYS_PER_ROW * 2);

  return (
    <View style={styles.card}>
      <FolderTabShape fill={FILL_NEUTRAL_SUBTLE} />
      <Pressable style={styles.header} onPress={onPress}>
        <Text style={styles.monthLabel}>{data.monthLabel}</Text>
        <Image source={CHEVRON_RIGHT_ICON} style={styles.chevronIcon} />
      </Pressable>
      <View style={styles.dividerWrapper}>
        <Divider />
      </View>
      <View style={styles.week}>
        {WEEKDAY_LABELS.map(label => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.week}>
        {firstWeek.map((day, index) =>
          day ? (
            <DayCell
              key={day.date}
              day={day}
              year={data.year}
              month={data.month}
              highlighted={data.highlightedDates.includes(day.date)}
            />
          ) : (
            <View key={`blank-${index}`} style={styles.dayCell} />
          ),
        )}
      </View>
      <View style={styles.week}>
        {secondWeek.map((day, index) =>
          day ? (
            <DayCell
              key={day.date}
              day={day}
              year={data.year}
              month={data.month}
              highlighted={data.highlightedDates.includes(day.date)}
            />
          ) : (
            <View key={`blank-${index}`} style={styles.dayCell} />
          ),
        )}
      </View>
    </View>
  );
}

type DayCellProps = {
  day: MiniCalendarData['days'][number];
  year: number;
  month: number;
  highlighted: boolean;
};

function DayCell({ day, year, month, highlighted }: DayCellProps) {
  const isSunday = new Date(year, month - 1, day.date).getDay() === 0;
  return (
    <View style={styles.dayCell}>
      <Text
        style={[
          styles.dateText,
          isSunday && styles.dateTextSunday,
          highlighted && styles.dateTextHighlighted,
        ]}
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
    backgroundColor: FILL_NEUTRAL_SUBTLE,
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
  dividerWrapper: {
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
  dateTextSunday: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  dateTextHighlighted: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  weekdayLabel: {
    width: 32,
    textAlign: 'center',
    fontSize: 12,
    color: FOREGROUND_DISABLED,
  },
  amountText: {
    fontSize: 10,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  amountTextPositive: {
    color: FOREGROUND_SECONDARY,
  },
});

export default MiniCalendarCard;
