import { Pressable, StyleSheet, Text } from 'react-native';
import { LINK_BLUE } from '../../constants/colors';

type CheckBoxShape = 'square' | 'circle';

type CheckBoxProps = {
  checked: boolean;
  onToggle: () => void;
  shape?: CheckBoxShape;
  disabled?: boolean;
};

/** 체크 표시가 있는 선택 컨트롤. square(각진)/circle(원형) 두 모양을 지원한다. */
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
      {checked && <Text style={styles.checkmark}>✓</Text>}
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
    borderColor: '#CED4DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderRadius: SIZE / 2,
  },
  checked: {
    backgroundColor: LINK_BLUE,
    borderColor: LINK_BLUE,
  },
  disabled: {
    backgroundColor: '#F1F3F5',
    borderColor: '#F1F3F5',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CheckBox;
