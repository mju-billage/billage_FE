import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Menu, { MenuItem } from '../../components/Navigation/Menu/Menu';
import { BORDER_NEUTRAL_NORMAL, FILL_NEUTRAL_SUBTLE, OVERLAY_MENU_BACKDROP } from '../../constants/colors';

type MemberMoreMenuProps = {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
  onSelect: (key: string) => void;
};

function MemberMoreMenu({ visible, onClose, items, onSelect }: MemberMoreMenuProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.menuWrapper}>
          <Menu sections={[items]} onSelect={onSelect} showIcon={false} />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: OVERLAY_MENU_BACKDROP,
  },
  menuWrapper: {
    position: 'absolute',
    top: 56,
    right: 24,
    width: 200,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
});

export default MemberMoreMenu;
