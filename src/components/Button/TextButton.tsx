import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { ERROR_RED, LINK_BLUE, TEXT_MUTED } from '../../constants/colors';

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
    color: '#212529',
  },
  secondaryLabel: {
    color: LINK_BLUE,
  },
  tertiaryLabel: {
    color: '#868E96',
  },
  negativeLabel: {
    color: ERROR_RED,
  },
  disabledLabel: {
    color: TEXT_MUTED,
  },
});

export default TextButton;
