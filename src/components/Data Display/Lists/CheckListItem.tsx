import { Image, Pressable, StyleSheet, Text } from 'react-native';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';

const CHECK_ICON = require('../../../assets/icons/action/Check.png');

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
      {selected && <Image source={CHECK_ICON} style={styles.checkmark} />}
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
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
  },
  labelDisabled: {
    color: FOREGROUND_DISABLED,
  },
  checkmark: {
    width: 18,
    height: 18,
    tintColor: FOREGROUND_SECONDARY,
  },
});

export default CheckListItem;
