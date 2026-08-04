import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ActionButton from '../Button/ActionButton';
import { NAVY } from '../../constants/colors';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');

type SnackbarProps = {
  visible: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onClose?: () => void;
};

/** 화면 하단에 뜨는 어두운 배경의 토스트. title/description/action/close가 각각 독립적으로 optional하다. */
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
          <ActionButton
            label={actionLabel}
            style="inverse"
            onPress={onActionPress ?? (() => {})}
          />
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
    backgroundColor: NAVY,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 12,
    color: '#DEE2E6',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
});

export default Snackbar;
