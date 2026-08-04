import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { LINK_BLUE, TEXT_MUTED } from '../../constants/colors';

type IconButtonProps = {
  icon: ImageSourcePropType;
  onPress: () => void;
  disabled?: boolean;
  showPushBadge?: boolean;
  accessibilityLabel?: string;
};

const ICON_SIZE = 24;

/** 아이콘 하나만 있는 미니멀 버튼. 우상단에 알림 뱃지 점을 옵션으로 표시한다. */
function IconButton({
  icon,
  onPress,
  disabled = false,
  showPushBadge = false,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityLabel={accessibilityLabel}
    >
      <Image
        source={icon}
        style={[styles.icon, disabled && styles.iconDisabled]}
      />
      {showPushBadge && <View style={styles.badge} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  pressed: {
    backgroundColor: '#F1F3F5',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    tintColor: '#212529',
  },
  iconDisabled: {
    tintColor: TEXT_MUTED,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LINK_BLUE,
  },
});

export default IconButton;
