import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CALENDAR_VIEW_TOGGLE_CALENDAR_LABEL,
  CALENDAR_VIEW_TOGGLE_DAILY_LABEL,
} from '../../constants/calendarScreenText';
import { FILL_NEUTRAL, TEXT_MUTED } from '../../constants/colors';

type CalendarViewToggleProps = {
  onPressDaily: () => void;
};

/** "캘린더"/"일별" 보기 전환 세그먼트. "일별"은 아직 목적지가 없어 탭해도 동작하지 않는다. */
function CalendarViewToggle({ onPressDaily }: CalendarViewToggleProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.segment, styles.activeSegment]}>
        <Text style={styles.activeLabel}>
          {CALENDAR_VIEW_TOGGLE_CALENDAR_LABEL}
        </Text>
      </View>
      <Pressable style={styles.segment} onPress={onPressDaily}>
        <Text style={styles.inactiveLabel}>
          {CALENDAR_VIEW_TOGGLE_DAILY_LABEL}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: FILL_NEUTRAL,
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeSegment: {
    backgroundColor: '#FFFFFF',
  },
  activeLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  inactiveLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
});

export default CalendarViewToggle;
