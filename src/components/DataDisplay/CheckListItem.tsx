import { Pressable, StyleSheet, Text } from 'react-native';
import { FILL_NEUTRAL, LINK_BLUE, TEXT_MUTED } from '../../constants/colors';

type CheckListItemProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

/** 선택 시 체크마크가 붙는 리스트 항목. */
function CheckListItem({
  label,
  selected = false,
  disabled = false,
  onPress,
}: CheckListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && !disabled && styles.itemPressed,
        disabled && styles.itemDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {label}
      </Text>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  itemPressed: {
    backgroundColor: FILL_NEUTRAL,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
  },
  labelDisabled: {
    color: TEXT_MUTED,
  },
  checkmark: {
    color: LINK_BLUE,
    fontWeight: 'bold',
  },
});

export default CheckListItem;
