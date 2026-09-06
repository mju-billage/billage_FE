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
  /** 빈 트랙 배경색. 기본값(FILL_NEUTRAL_NORMAL)은 흰 배경 카드 위에서
   * 대비가 약해 안 보인다는 검증 결과가 나온 화면(회비 카드)에서만
   * 더 진한 색으로 덮어쓴다 — 다른 소비자(BudgetCard 등)는 그대로 둔다. */
  trackColor?: string;
};

/** 진행률 바. round(완전히 둥근)/square(각진) 두 형태를 지원한다. */
function ProgressBar({
  progress,
  style = 'round',
  showLabel = false,
  muted = false,
  trackColor,
}: ProgressBarProps) {
  const percent: `${number}%` = `${Math.round(progress * 100)}%`;
  const radius = style === 'round' ? BAR_HEIGHT / 2 : 4;

  return (
    <View>
      {showLabel && <Text style={styles.label}>{percent}</Text>}
      <View
        style={[
          styles.track,
          { borderRadius: radius },
          trackColor ? { backgroundColor: trackColor } : null,
        ]}
      >
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
