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
  FOREGROUND_NEUTRAL_NORMAL,
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
  /** 'caption'이면 Other/Caption(10px/regular) 사용 — 로그인 화면 하단 링크 등 보조 텍스트용(옵트인, 기본 'default') */
  size?: 'default' | 'caption';
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
  size = 'default',
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
      <Text
        style={[
          size === 'caption' ? styles.labelCaption : styles.label,
          labelStyle,
          underline && styles.underline,
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
  labelCaption: {
    ...TYPOGRAPHY.caption,
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
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  negativeLabel: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  disabledLabel: {
    color: FOREGROUND_DISABLED,
  },
});

export default TextButton;
