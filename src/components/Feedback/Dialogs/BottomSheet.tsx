import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import {
  BORDER_NEUTRAL_BOLD,
  FILL_NEUTRAL_SUBTLE,
  OVERLAY_SCRIM,
} from '../../../constants/colors';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <KeyboardStickyView style={styles.stickyWrapper}>
          <View style={[styles.sheet, { paddingBottom: 32 + insets.bottom }]}>
            <View style={styles.handle} />
            {children}
          </View>
        </KeyboardStickyView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: OVERLAY_SCRIM,
  },
  stickyWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER_NEUTRAL_BOLD,
    marginBottom: 16,
  },
});

export default BottomSheet;
