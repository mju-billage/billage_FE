import { Pressable, StyleSheet, Text } from 'react-native';
import { LINK_BLUE, TEXT_MUTED } from '../../constants/colors';

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
    borderColor: '#DEE2E6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: LINK_BLUE,
  },
  plus: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  label: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  textActive: {
    color: LINK_BLUE,
  },
});

export default FilterChip;
