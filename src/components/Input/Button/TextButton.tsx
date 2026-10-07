import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FEEDBACK_NEGATIVE_SUBTLE,
  FILL_NEUTRAL_NORMAL,
  FILL_SECONDARY_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type TextButtonHierarchy = 'primary' | 'secondary' | 'tertiary' | 'negative';

type TextButtonProps = {
  label: string;
  onPress: () => void;
  hierarchy?: TextButtonHierarchy;
  icon?: ImageSourcePropType;
  disabled?: boolean;
  underline?: boolean;
};

const PRESSED_BG_BY_HIERARCHY: Record<TextButtonHierarchy, object> = {
  primary: { backgroundColor: FILL_NEUTRAL_NORMAL },
  secondary: { backgroundColor: FILL_SECONDARY_SUBTLE },
  tertiary: { backgroundColor: FILL_NEUTRAL_NORMAL },
  negative: { backgroundColor: FEEDBACK_NEGATIVE_SUBTLE },
};

function TextButton({
  label,
  onPress,
  hierarchy = 'primary',
  icon,
  disabled = false,
  underline = false,
}: TextButtonProps) {
  const labelStyle = disabled
    ? styles.disabledLabel
    : hierarchy === 'secondary'
    ? styles.secondaryLabel
    : hierarchy === 'tertiary'
    ? styles.tertiaryLabel
    : hierarchy === 'negative'
    ? styles.negativeLabel
    : styles.primaryLabel;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && PRESSED_BG_BY_HIERARCHY[hierarchy],
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
      <Text style={[styles.label, labelStyle, underline && styles.underline]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  icon: {
    width: 16,
    height: 16,
  },
  label: {
    ...TYPOGRAPHY.button,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  primaryLabel: {
    color: FOREGROUND_PRIMARY,
  },
  secondaryLabel: {
    color: FOREGROUND_SECONDARY,
  },
  tertiaryLabel: {
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  negativeLabel: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  disabledLabel: {
    color: FOREGROUND_DISABLED,
  },
});

export default TextButton;
