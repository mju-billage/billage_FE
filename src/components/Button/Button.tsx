import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import {
  BACKGROUND_PRIMARY,
  FEEDBACK_NEGATIVE_BOLD,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
  NAVY_800,
} from '../../constants/colors';

type ButtonHierarchy = 'primary' | 'secondary' | 'tertiary';

type ButtonProps = {
  label: string;
  onPress: () => void;
  hierarchy?: ButtonHierarchy;
  negative?: boolean;
  icon?: ImageSourcePropType;
  disabled?: boolean;
};

/** 콘텐츠 너비의 범용 필박스 버튼. hierarchy와 negative 조합으로 색상이 정해진다. */
function Button({
  label,
  onPress,
  hierarchy = 'primary',
  negative = false,
  icon,
  disabled = false,
}: ButtonProps) {
  const containerStyle = negative
    ? styles.negative
    : hierarchy === 'secondary'
    ? styles.secondary
    : hierarchy === 'tertiary'
    ? styles.tertiary
    : styles.primary;
  const labelStyle = negative
    ? styles.negativeLabel
    : hierarchy === 'secondary'
    ? styles.secondaryLabel
    : hierarchy === 'tertiary'
    ? styles.tertiaryLabel
    : styles.primaryLabel;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        containerStyle,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && (
        <Image
          source={icon}
          style={[styles.icon, { tintColor: labelStyle.color }]}
        />
      )}
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
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
  negative: {
    backgroundColor: FEEDBACK_NEGATIVE_BOLD,
  },
  disabled: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    width: 16,
    height: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
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
  negativeLabel: {
    color: FOREGROUND_INVERSE,
  },
});

export default Button;
