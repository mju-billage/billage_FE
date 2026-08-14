import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Menu, { MenuItem } from '../../components/Navigation/Menu';
import { FILL_NEUTRAL_SUBTLE } from '../../constants/colors';

type FolderMoreMenuProps = {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
  onSelect: (key: string) => void;
};

/** 폴더 화면 우상단 ⋮ 버튼을 누르면 뜨는 팝오버 메뉴. */
function FolderMoreMenu({
  visible,
  onClose,
  items,
  onSelect,
}: FolderMoreMenuProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.menuWrapper}>
          <Menu
            items={items}
            onSelect={key => {
              onSelect(key);
            }}
            showIcon={false}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  menuWrapper: {
    position: 'absolute',
    top: 56,
    right: 24,
    width: 200,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default FolderMoreMenu;
