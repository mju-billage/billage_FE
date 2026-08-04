import { StyleSheet, Text, View } from 'react-native';
import {
  ERROR_RED,
  NEGATIVE_BADGE_BG,
  WARNING_BADGE_BG,
  WARNING_BADGE_TEXT,
} from '../../constants/colors';

type BadgeStatus = 'positive' | 'warning' | 'destructive' | 'neutral';

type BadgeProps = {
  label: string;
  status?: BadgeStatus;
};

const BACKGROUND_BY_STATUS: Record<BadgeStatus, string> = {
  positive: '#E7EBFA',
  warning: WARNING_BADGE_BG,
  destructive: NEGATIVE_BADGE_BG,
  neutral: '#F1F3F5',
};

const TEXT_COLOR_BY_STATUS: Record<BadgeStatus, string> = {
  positive: '#3B5BDB',
  warning: WARNING_BADGE_TEXT,
  destructive: ERROR_RED,
  neutral: '#495057',
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
