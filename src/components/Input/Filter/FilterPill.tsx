import { Pressable, StyleSheet, Text } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type FilterPillProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

/** 필터 바텀시트의 단일/다중 선택 칩(둥근 알약형, 선택 시 채워짐). */
function FilterPill({ label, active, onPress }: FilterPillProps) {
  return (
    <Pressable
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
    >
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillActive: {
    borderColor: FOREGROUND_SECONDARY,
    backgroundColor: FOREGROUND_SECONDARY,
  },
  pillLabel: {
    ...TYPOGRAPHY.chips,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  // Medium 계열 fontFamily는 fontWeight 오버레이가 안 먹혀서(별도 폰트 파일),
  // 선택 상태는 굵기 대신 색상 대비로만 표현한다.
  pillLabelActive: {
    color: FOREGROUND_INVERSE,
  },
});

export default FilterPill;
