import { Pressable, StyleSheet, Text } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type FilterChipProps = {
  label: string;
  onPress: () => void;
  active?: boolean;
};

/** "+텍스트" 형태의 아웃라인 필터 칩. */
function FilterChip({ label, onPress, active = false }: FilterChipProps) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.plus, active && styles.textActive]}>+</Text>
      <Text style={[styles.label, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: FOREGROUND_SECONDARY,
  },
  plus: {
    ...TYPOGRAPHY.chips,
    color: FOREGROUND_DISABLED,
  },
  label: {
    ...TYPOGRAPHY.chips,
    color: FOREGROUND_DISABLED,
  },
  textActive: {
    color: FOREGROUND_SECONDARY,
  },
});

export default FilterChip;
