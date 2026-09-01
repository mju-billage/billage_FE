import { Modal, Pressable, StyleSheet, View } from 'react-native';
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

/** 하단에서 올라오는 바텀시트. 반투명 백드롭을 탭하면 닫힌다. */
function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: OVERLAY_SCRIM,
  },
  sheet: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
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
