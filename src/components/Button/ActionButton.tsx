import { Pressable, StyleSheet, Text, TextStyle } from 'react-native';
import { ERROR_RED, LINK_BLUE, TEXT_MUTED } from '../../constants/colors';

type ActionButtonStyle =
  | 'default'
  | 'neutral'
  | 'success'
  | 'error'
  | 'inverse';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  style?: ActionButtonStyle;
  disabled?: boolean;
};

/** Dialog/Snackbar 안에서 쓰는 배경 없는 액션 텍스트 버튼. */
function ActionButton({
  label,
  onPress,
  style = 'default',
  disabled = false,
}: ActionButtonProps) {
  const labelStyle = disabled
    ? styles.disabledLabel
    : LABEL_STYLE_BY_STYLE[style];

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  defaultLabel: {
    color: '#212529',
  },
  neutralLabel: {
    color: '#868E96',
  },
  successLabel: {
    color: LINK_BLUE,
  },
  errorLabel: {
    color: ERROR_RED,
  },
  inverseLabel: {
    color: '#FFFFFF',
  },
  disabledLabel: {
    color: TEXT_MUTED,
  },
});

const LABEL_STYLE_BY_STYLE: Record<ActionButtonStyle, TextStyle> = {
  default: styles.defaultLabel,
  neutral: styles.neutralLabel,
  success: styles.successLabel,
  error: styles.errorLabel,
  inverse: styles.inverseLabel,
};

export default ActionButton;
