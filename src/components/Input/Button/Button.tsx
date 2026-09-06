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
  FEEDBACK_NEGATIVE_BOLD,
  FILL_DISABLED,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
  NAVY_800,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type ButtonHierarchy = 'primary' | 'secondary' | 'tertiary';

type ButtonProps = {
  label: string;
  onPress: () => void;
  hierarchy?: ButtonHierarchy;
  negative?: boolean;
  icon?: ImageSourcePropType;
  disabled?: boolean;
  /** true면 전체 너비의 큰 버튼(온보딩 등 주요 CTA)으로 렌더링한다. */
  fullWidth?: boolean;
  /** 기본 배치(auto 너비일 때 왼쪽 정렬)를 벗어나야 할 때만 쓴다 — 예:
   * `alignItems:'center'` 컨테이너 안의 "다시 시도" 버튼을 실제로 가운데
   * 두려면 `style={{ alignSelf: 'center' }}`. `buttonAuto`의 고정
   * `alignSelf:'flex-start'`는 시트 하단의 flex:1 취소 버튼엔 필요해서
   * 못 없앤다(검증 중 발견 — 없애면 그 버튼들이 늘어나 버림). */
  style?: StyleProp<ViewStyle>;
};

/** 필박스 버튼. hierarchy/negative로 색을, fullWidth로 온보딩용 전체너비 큰 버튼 여부를 정한다. */
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
    : styles.primary;
  const labelStyle = negative
    ? styles.negativeLabel
    : hierarchy === 'secondary'
    ? styles.secondaryLabel
    : hierarchy === 'tertiary'
    ? styles.tertiaryLabel
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
  negativeLabel: {
    color: FOREGROUND_INVERSE,
  },
  disabledLabel: {
    color: FOREGROUND_DISABLED,
  },
});

export default Button;
