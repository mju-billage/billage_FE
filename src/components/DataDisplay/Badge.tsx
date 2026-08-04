import { StyleSheet, Text, View } from 'react-native';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FEEDBACK_NEGATIVE_SUBTLE,
  FEEDBACK_POSITIVE_BOLD,
  FEEDBACK_POSITIVE_SUBTLE,
  FEEDBACK_WARNING_BOLD,
  FEEDBACK_WARNING_SUBTLE,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_NORMAL,
} from '../../constants/colors';

type BadgeStatus = 'positive' | 'warning' | 'destructive' | 'neutral';

type BadgeProps = {
  label: string;
  status?: BadgeStatus;
};

const BACKGROUND_BY_STATUS: Record<BadgeStatus, string> = {
  positive: FEEDBACK_POSITIVE_SUBTLE,
  warning: FEEDBACK_WARNING_SUBTLE,
  destructive: FEEDBACK_NEGATIVE_SUBTLE,
  neutral: FILL_NEUTRAL_NORMAL,
};

const TEXT_COLOR_BY_STATUS: Record<BadgeStatus, string> = {
  positive: FEEDBACK_POSITIVE_BOLD,
  warning: FEEDBACK_WARNING_BOLD,
  destructive: FEEDBACK_NEGATIVE_BOLD,
  neutral: FOREGROUND_NEUTRAL_NORMAL,
};

/** 상태를 색상으로 표시하는 알약형 뱃지. */
function Badge({ label, status = 'neutral' }: BadgeProps) {
  return (
    <View
      style={[styles.badge, { backgroundColor: BACKGROUND_BY_STATUS[status] }]}
    >
      <Text style={[styles.label, { color: TEXT_COLOR_BY_STATUS[status] }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Badge;
