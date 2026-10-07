import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_INVERSE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
  OVERLAY_SCRIM,
} from '../../../constants/colors';

type IconButtonProps = {
  icon: ImageSourcePropType;
  onPress: () => void;
  disabled?: boolean;
  showPushBadge?: boolean;
  accessibilityLabel?: string;
  overlay?: boolean;
};

const ICON_SIZE = 24;

function IconButton({
  icon,
  onPress,
  disabled = false,
  showPushBadge = false,
  accessibilityLabel,
  overlay = false,
}: IconButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        overlay && styles.overlayButton,
        pressed && !disabled && !overlay && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityLabel={accessibilityLabel}
    >
      <Image
        source={icon}
        style={[
          styles.icon,
          overlay && styles.iconOverlay,
          disabled && styles.iconDisabled,
        ]}
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
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  overlayButton: {
    backgroundColor: OVERLAY_SCRIM,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    tintColor: FOREGROUND_PRIMARY,
  },
  iconOverlay: {
    tintColor: FOREGROUND_INVERSE,
  },
  iconDisabled: {
    tintColor: FOREGROUND_DISABLED,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FOREGROUND_SECONDARY,
  },
});

export default IconButton;
