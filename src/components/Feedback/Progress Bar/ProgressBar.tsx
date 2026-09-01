import { StyleSheet, Text, View } from 'react-native';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type ProgressBarStyle = 'round' | 'square';

type ProgressBarProps = {
  progress: number;
  style?: ProgressBarStyle;
  showLabel?: boolean;
  /** true면 종료/비활성 상태처럼 회색으로 채운다. */
  muted?: boolean;
};

/** 진행률 바. round(완전히 둥근)/square(각진) 두 형태를 지원한다. */
function ProgressBar({
  progress,
  style = 'round',
  showLabel = false,
  muted = false,
}: ProgressBarProps) {
  const percent: `${number}%` = `${Math.round(progress * 100)}%`;
  const radius = style === 'round' ? BAR_HEIGHT / 2 : 4;

  return (
    <View>
      {showLabel && <Text style={styles.label}>{percent}</Text>}
      <View style={[styles.track, { borderRadius: radius }]}>
        <View
          style={[
            styles.fill,
            muted && styles.fillMuted,
            { width: percent, borderRadius: radius },
          ]}
        />
      </View>
    </View>
  );
}

const BAR_HEIGHT = 8;

const styles = StyleSheet.create({
  label: {
    ...TYPOGRAPHY.body3,
    alignSelf: 'flex-end',
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
    backgroundColor: FOREGROUND_SECONDARY,
  },
  fillMuted: {
    backgroundColor: FOREGROUND_DISABLED,
  },
});

export default ProgressBar;
