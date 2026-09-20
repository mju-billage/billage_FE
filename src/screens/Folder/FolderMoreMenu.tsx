import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Menu, { MenuItem } from '../../components/Navigation/Menu/Menu';
import { FILL_NEUTRAL_SUBTLE, OVERLAY_MENU_BACKDROP } from '../../constants/colors';

type FolderMoreMenuProps = {
  visible: boolean;
  onClose: () => void;
  /** 구분선 없는 단일 그룹 메뉴. `sections`를 주면 이쪽은 무시된다. */
  items?: MenuItem[];
  /** 그룹 단위 배열 — 그룹 사이에 구분선이 들어간다(폴더 메인 헤더 메뉴처럼
   * 여러 그룹으로 나뉘는 경우, design-verification.md §2 FDR-1-PAGE-01-0 참고). */
  sections?: MenuItem[][];
  onSelect: (key: string) => void;
  /** true면 항목 아이콘을 보여준다(기본 false — 기존 호출부는 아이콘 없는
   * 텍스트 전용 메뉴였다). */
  showIcon?: boolean;
};

/** 폴더 화면 우상단 ⋮ 버튼을 누르면 뜨는 팝오버 메뉴. */
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
  },
});

export default FolderMoreMenu;
