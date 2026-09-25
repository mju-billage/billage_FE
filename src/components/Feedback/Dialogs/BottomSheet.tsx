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

/** 하단에서 올라오는 바텀시트. 반투명 백드롭을 탭하면 닫힌다.
 * 제스처 네비게이션 바가 있는 기기는 고정 32px 여백만으론 하단이 잘려서
 * `useSafeAreaInsets().bottom`을 더한다 — 이 컴포넌트를 쓰는 모든 시트에 공통 적용.
 *
 * `sheet`는 `backdrop`(flex:1)과 형제로 놓여 별도 포지셔닝 없이도 항상
 * 화면 맨 아래에 붙는다(flex column 배치) — 그래서 키보드가 뜰 때
 * `KeyboardStickyView`로 감싸기만 하면 그 즉시 위치(화면 맨 아래)에서
 * 정확히 키보드 높이만큼 위로 붙는다(디자이너 판단, 시안에 키보드 목업
 * 없음 — design-verification.md §5-12). */
function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardStickyView style={styles.stickyWrapper}>
        <View style={[styles.sheet, { paddingBottom: 32 + insets.bottom }]}>
          <View style={styles.handle} />
          {children}
        </View>
      </KeyboardStickyView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: OVERLAY_SCRIM,
  },
  // Modal 루트는 alignItems 기본값(stretch)이라 원래도 폭이 깨지진 않지만,
  // Dialog에서 실제로 폭 붕괴가 났던 것과 같은 종류의 문제라 명시해서
  // 막아둔다(design-verification.md §5-12 정정).
  stickyWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
