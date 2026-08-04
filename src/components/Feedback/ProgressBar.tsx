import { StyleSheet, Text, View } from 'react-native';
import {
  FEEDBACK_POSITIVE_BOLD,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';

type ProgressBarStyle = 'round' | 'square';

type ProgressBarProps = {
  progress: number;
  style?: ProgressBarStyle;
  showLabel?: boolean;
};

/** 진행률 바. round(완전히 둥근)/square(각진) 두 형태를 지원한다. */
function ProgressBar({
  progress,
  style = 'round',
  showLabel = false,
}: ProgressBarProps) {
  const percent: `${number}%` = `${Math.round(progress * 100)}%`;
  const radius = style === 'round' ? BAR_HEIGHT / 2 : 4;

  return (
    <View>
      {showLabel && <Text style={styles.label}>{percent}</Text>}
      <View style={[styles.track, { borderRadius: radius }]}>
        <View style={[styles.fill, { width: percent, borderRadius: radius }]} />
      </View>
    </View>
  );
}

const BAR_HEIGHT = 8;

const styles = StyleSheet.create({
  label: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginBottom: 4,
  },
  track: {
    height: BAR_HEIGHT,
    backgroundColor: FILL_NEUTRAL_NORMAL,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: FEEDBACK_POSITIVE_BOLD,
  },
});

export default ProgressBar;
