import { Image, Pressable, StyleSheet } from 'react-native';
import {
  BORDER_NEUTRAL_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_INVERSE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';

const CHECK_ICON = require('../../../assets/icons/action/Check.png');

type CheckBoxShape = 'square' | 'circle';

type CheckBoxProps = {
  checked: boolean;
  onToggle: () => void;
  shape?: CheckBoxShape;
  disabled?: boolean;
};

function CheckBox({
  checked,
  onToggle,
  shape = 'square',
  disabled = false,
}: CheckBoxProps) {
  return (
    <Pressable
      style={[
        styles.box,
        shape === 'circle' && styles.circle,
        checked && styles.checked,
        disabled && (checked ? styles.disabledChecked : styles.disabledUnchecked),
      ]}
      onPress={onToggle}
      disabled={disabled}
      hitSlop={8}
    >
      {checked && <Image source={CHECK_ICON} style={styles.checkmark} />}
    </Pressable>
  );
}

const SIZE = 20;

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: BORDER_NEUTRAL_BOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderRadius: SIZE / 2,
  },
  checked: {
    backgroundColor: FOREGROUND_SECONDARY,
    borderColor: FOREGROUND_SECONDARY,
  },
  disabledUnchecked: {
    borderColor: FOREGROUND_DISABLED,
  },
  disabledChecked: {
    backgroundColor: FOREGROUND_DISABLED,
    borderColor: FOREGROUND_DISABLED,
  },
  checkmark: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_INVERSE,
  },
});

export default CheckBox;
