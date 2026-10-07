import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FOREGROUND_INACTIVE,
  FOREGROUND_INVERSE,
  GREY_700,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CLOSE_ICON = require('../../../assets/icons/action/Close.png');

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
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
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
        {onClose && (
          <Pressable onPress={onClose} hitSlop={8}>
            <Image source={CLOSE_ICON} style={styles.closeIcon} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GREY_700,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...TYPOGRAPHY.subtitle3,
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
