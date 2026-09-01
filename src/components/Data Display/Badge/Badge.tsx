import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FEEDBACK_NEGATIVE_SUBTLE,
  FEEDBACK_POSITIVE_BOLD,
  FEEDBACK_POSITIVE_SUBTLE,
  FEEDBACK_WARNING_BOLD,
  FEEDBACK_WARNING_SUBTLE,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_NORMAL,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type BadgeStatus = 'positive' | 'warning' | 'destructive' | 'neutral';

type BadgeProps = {
  label: string;
  status?: BadgeStatus;
  icon?: ImageSourcePropType;
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
function Badge({ label, status = 'neutral', icon }: BadgeProps) {
  return (
    <View
      style={[styles.badge, { backgroundColor: BACKGROUND_BY_STATUS[status] }]}
    >
      <Text style={[styles.label, { color: TEXT_COLOR_BY_STATUS[status] }]}>
        {label}
      </Text>
      {icon && (
        <Image
          source={icon}
          style={[styles.icon, { tintColor: TEXT_COLOR_BY_STATUS[status] }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  icon: {
    width: 12,
    height: 12,
  },
  label: {
    ...TYPOGRAPHY.badge,
  },
});

export default Badge;
