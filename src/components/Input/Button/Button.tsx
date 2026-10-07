import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import {
  BACKGROUND_PRIMARY,
  BASIC_0,
  BORDER_NEUTRAL_NORMAL,
  FEEDBACK_NEGATIVE_BOLD,
  FILL_DISABLED,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
  NAVY_800,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type ButtonHierarchy = 'primary' | 'secondary' | 'tertiary' | 'outlined';

type ButtonProps = {
  label: string;
  onPress: () => void;
  hierarchy?: ButtonHierarchy;
  negative?: boolean;
  icon?: ImageSourcePropType;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

function Button({
  label,
  onPress,
  hierarchy = 'primary',
  negative = false,
  icon,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const containerStyle = negative
    ? styles.negative
    : hierarchy === 'secondary'
    ? styles.secondary
    : hierarchy === 'tertiary'
    ? styles.tertiary
    : hierarchy === 'outlined'
    ? styles.outlined
    : styles.primary;
  const labelStyle = negative
    ? styles.negativeLabel
    : hierarchy === 'secondary'
    ? styles.secondaryLabel
    : hierarchy === 'tertiary'
    ? styles.tertiaryLabel
    : hierarchy === 'outlined'
    ? styles.outlinedLabel
    : styles.primaryLabel;
  const iconTint = disabled ? FOREGROUND_DISABLED : labelStyle.color;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        fullWidth ? styles.buttonFullWidth : styles.buttonAuto,
        containerStyle,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && (
        <Image source={icon} style={[styles.icon, { tintColor: iconTint }]} />
      )}
      <Text
        style={[
          fullWidth ? styles.labelLarge : styles.label,
          disabled ? styles.disabledLabel : labelStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
  },
  buttonAuto: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonFullWidth: {
    width: '100%',
    height: 52,
  },
  primary: {
    backgroundColor: NAVY_800,
  },
  secondary: {
    backgroundColor: BACKGROUND_PRIMARY,
  },
  tertiary: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  outlined: {
    backgroundColor: BASIC_0,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
  negative: {
    backgroundColor: FEEDBACK_NEGATIVE_BOLD,
  },
  disabled: {
    backgroundColor: FILL_DISABLED,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    width: 16,
    height: 16,
  },
  label: {
    ...TYPOGRAPHY.button,
  },
  labelLarge: {
    ...TYPOGRAPHY.button,
  },
  primaryLabel: {
    color: FOREGROUND_INVERSE,
  },
  secondaryLabel: {
    color: FOREGROUND_SECONDARY,
  },
  tertiaryLabel: {
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  outlinedLabel: {
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  negativeLabel: {
    color: FOREGROUND_INVERSE,
  },
  disabledLabel: {
    color: FOREGROUND_DISABLED,
  },
});

export default Button;
