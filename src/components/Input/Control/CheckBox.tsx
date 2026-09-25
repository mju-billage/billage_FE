import { Image, Pressable, StyleSheet } from 'react-native';
import {
  BORDER_NEUTRAL_BOLD,
  FILL_DISABLED,
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
        disabled && styles.disabled,
      ]}
      onPress={onToggle}
      disabled={disabled}
      hitSlop={8}
    >
      {checked && <Image source={CHECK_ICON} style={styles.checkmark} />}
    </Pressable>
  );
}

const SIZE = 22;

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    borderRadius: 4,
    borderWidth: 1,
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
  disabled: {
    backgroundColor: FILL_DISABLED,
    borderColor: FILL_DISABLED,
  },
  checkmark: {
    width: 14,
    height: 14,
    tintColor: FOREGROUND_INVERSE,
  },
});

export default CheckBox;
