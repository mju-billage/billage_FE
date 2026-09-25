import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Menu from '../../components/Navigation/Menu/Menu';
import { getCachedGroups } from '../../types/group';
import { GROUP_SWITCHER_ADD_ALL } from '../../constants/groupManagerScreenText';
import { BORDER_NEUTRAL_NORMAL, FILL_NEUTRAL_SUBTLE, OVERLAY_MENU_BACKDROP } from '../../constants/colors';

const ALL_GROUPS_KEY = '__all_groups__';

type GroupSwitcherMenuProps = {
  visible: boolean;
  onClose: () => void;
  onSelectGroup: (groupId: string) => void;
  onPressAllGroups: () => void;
};

function GroupSwitcherMenu({
  visible,
  onClose,
  onSelectGroup,
  onPressAllGroups,
}: GroupSwitcherMenuProps) {
  if (!visible) {
    return null;
  }

  const groups = getCachedGroups();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.menuWrapper}>
          <Menu
            sections={[
              [
                ...groups.map(group => ({ key: group.id, label: group.name })),
                { key: ALL_GROUPS_KEY, label: `+ ${GROUP_SWITCHER_ADD_ALL}` },
              ],
            ]}
            showIcon={false}
            onSelect={key => {
              if (key === ALL_GROUPS_KEY) {
                onPressAllGroups();
              } else {
                onSelectGroup(key);
              }
            }}
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
    left: 24,
    width: 200,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
});

export default GroupSwitcherMenu;
