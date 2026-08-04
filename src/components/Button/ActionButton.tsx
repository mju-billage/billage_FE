import { Pressable, StyleSheet, Text, TextStyle } from 'react-native';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../constants/colors';

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
    color: FOREGROUND_PRIMARY,
  },
  neutralLabel: {
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  successLabel: {
    color: FOREGROUND_SECONDARY,
  },
  errorLabel: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  inverseLabel: {
    color: FOREGROUND_INVERSE,
  },
  disabledLabel: {
    color: FOREGROUND_DISABLED,
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
