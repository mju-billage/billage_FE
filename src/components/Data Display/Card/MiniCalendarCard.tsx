import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import CardBase from './CardBase';
import Divider from '../Divider/Divider';
import Calendar from '../Calendar/Calendar';
import FolderTabShape from './FolderTabShape';
import type { MiniCalendarData } from '../../../types/dashboard';
import { FILL_NEUTRAL_SUBTLE } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CHEVRON_RIGHT_ICON = require('../../../assets/icons/nav/Chevron Right.png');
const WEEKS_TO_SHOW = 2;

type MiniCalendarCardProps = {
  data: MiniCalendarData;
  onPress: () => void;
};

function MiniCalendarCard({ data, onPress }: MiniCalendarCardProps) {
  const amountsByDate = Object.fromEntries(
    data.days.map(day => [day.date, day.amount]),
  );

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
      <Calendar
        year={data.year}
        month={data.month}
        weeksToShow={WEEKS_TO_SHOW}
        showHeader={false}
        showDateFields={false}
        interactive={false}
        amountsByDate={amountsByDate}
      />
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
  },
  dividerWrapper: {
    marginVertical: 12,
  },
});

export default MiniCalendarCard;
