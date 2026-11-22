import { StyleSheet, Text, View } from 'react-native';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { SHADOW_PROGRESS_INDICATOR } from '../../../constants/shadows';
import { TYPOGRAPHY } from '../../../constants/typography';

type ProgressBarStyle = 'round' | 'square';

type ProgressBarProps = {
  progress: number;
  style?: ProgressBarStyle;
  showLabel?: boolean;
  muted?: boolean;
  trackColor?: string;
};

function ProgressBar({
  progress,
  style = 'round',
  showLabel = false,
  muted = false,
  trackColor,
}: ProgressBarProps) {
  const percent: `${number}%` = `${Math.round(progress * 100)}%`;
  const height = style === 'square' ? SQUARE_HEIGHT : ROUND_HEIGHT;
  const radius = style === 'round' ? height / 2 : SQUARE_RADIUS;

  return (
    <View>
      {showLabel && <Text style={styles.label}>{percent}</Text>}
      <View
        style={[
          styles.track,
          { height, borderRadius: radius },
          trackColor ? { backgroundColor: trackColor } : null,
        ]}
      >
        <View
          style={[
            styles.fill,
            muted && styles.fillMuted,
            style === 'square' && !muted && styles.fillGlow,
            { width: percent, borderRadius: radius },
          ]}
        />
      </View>
    </View>
  );
}

const ROUND_HEIGHT = 8;
const SQUARE_HEIGHT = 16;
const SQUARE_RADIUS = 2;

const styles = StyleSheet.create({
  label: {
    ...TYPOGRAPHY.body3,
    alignSelf: 'flex-end',
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginBottom: 4,
  },
  track: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  fill: {
    height: '100%',
    backgroundColor: FOREGROUND_SECONDARY,
  },
  fillMuted: {
    backgroundColor: FOREGROUND_DISABLED,
  },
  fillGlow: {
    boxShadow: SHADOW_PROGRESS_INDICATOR,
  },
});

export default ProgressBar;
