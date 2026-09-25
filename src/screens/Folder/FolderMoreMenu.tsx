import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Menu, { MenuItem } from '../../components/Navigation/Menu/Menu';
import { BORDER_NEUTRAL_NORMAL, FILL_NEUTRAL_SUBTLE, OVERLAY_MENU_BACKDROP } from '../../constants/colors';

type FolderMoreMenuProps = {
  visible: boolean;
  onClose: () => void;
  items?: MenuItem[];
  sections?: MenuItem[][];
  onSelect: (key: string) => void;
  showIcon?: boolean;
};

function FolderMoreMenu({
  visible,
  onClose,
  items,
  sections,
  onSelect,
  showIcon = false,
}: FolderMoreMenuProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.menuWrapper}>
          <Menu
            sections={sections ?? [items ?? []]}
            onSelect={key => {
              onSelect(key);
            }}
            showIcon={showIcon}
          />
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
    padding: 8,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
});

export default FolderMoreMenu;
