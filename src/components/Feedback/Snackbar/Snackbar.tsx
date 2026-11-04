import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FOREGROUND_INACTIVE,
  FOREGROUND_INVERSE,
  GREY_700,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CLOSE_ICON = require('../../../assets/icons/action/Close.png');

export const SNACKBAR_DURATION_MS = 3000;
const SNACKBAR_FADE_MS = 200;

type SnackbarProps = {
  visible: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onClose?: () => void;
};

function Snackbar({
  visible,
  title,
  description,
  actionLabel,
  onActionPress,
  onClose,
}: SnackbarProps) {
  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const fadeOutAndClose = () => {
    clearHideTimer();
    Animated.timing(opacity, {
      toValue: 0,
      duration: SNACKBAR_FADE_MS,
      useNativeDriver: true,
    }).start(() => {
      setMounted(false);
      onClose?.();
    });
  };

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: SNACKBAR_FADE_MS,
        useNativeDriver: true,
      }).start();
      clearHideTimer();
      hideTimerRef.current = setTimeout(fadeOutAndClose, SNACKBAR_DURATION_MS);
    } else {
      clearHideTimer();
      setMounted(false);
    }
    return clearHideTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, title, description]);

  if (!visible && !mounted) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.textColumn}>
        {title && <Text style={styles.title}>{title}</Text>}
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <View style={styles.actions}>
        {actionLabel && (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={onActionPress ?? (() => {})}
          >
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </Pressable>
        )}
        <Pressable onPress={fadeOutAndClose} hitSlop={8}>
          <Image source={CLOSE_ICON} style={styles.closeIcon} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GREY_700,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...TYPOGRAPHY.subtitle4,
    color: FOREGROUND_INVERSE,
  },
  description: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_INACTIVE,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionLabel: {
    ...TYPOGRAPHY.button,
    color: FOREGROUND_INVERSE,
  },
  closeIcon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_INVERSE,
  },
});

export default Snackbar;
