import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../constants/colors';

type TextButtonHierarchy = 'primary' | 'secondary' | 'tertiary' | 'negative';

type TextButtonProps = {
  label: string;
  onPress: () => void;
  hierarchy?: TextButtonHierarchy;
  icon?: ImageSourcePropType;
  disabled?: boolean;
};

/** 배경 없는 텍스트 전용 버튼. hierarchy에 따라 색상만 다르다. */
function TextButton({
  label,
  onPress,
  hierarchy = 'primary',
  icon,
  disabled = false,
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
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
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
    gap: 4,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.6,
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
