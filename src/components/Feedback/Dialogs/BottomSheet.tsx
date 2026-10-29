import { Modal, Pressable, StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
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

function BottomSheetInner({ onClose, children }: Omit<BottomSheetProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardStickyView style={styles.stickyWrapper}>
        <View style={[styles.sheet, { paddingBottom: 32 + insets.bottom }]}>
          <View style={styles.handle} />
          {children}
        </View>
      </KeyboardStickyView>
    </View>
  );
}

function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <BottomSheetInner onClose={onClose}>{children}</BottomSheetInner>
      </SafeAreaProvider>
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
