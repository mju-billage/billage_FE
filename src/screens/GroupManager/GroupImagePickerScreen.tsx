/** @screen ETC-4-PAGE-02-0 이미지 선택 (모임 프로필 단일 선택) */
/**
 * `ReceiptGalleryPickerScreen`(ADD 도메인, 같은 Screen ID지만 다른 시안)과
 * 헷갈리기 쉽다 — 그쪽은 증빙자료 다중 선택(체크박스+"선택" 확인 버튼)이고
 * 이 화면은 모임 프로필 이미지 단일 선택이다. 시안(ETC\모임 관리\
 * ETC-4-PAGE-02-0.png)엔 체크박스도 확인 버튼도 없다 — 사진을 탭하는 즉시
 * 선택이 확정되고 이전 화면으로 돌아간다. 그 차이 때문에 `maxCount` prop 하나로
 * 갈리는 정도가 아니라서(선택 UI 자체가 다름) 새로 만들었다 — 카메라 타일
 * (`AttachmentAddButton` type="gallery")과 사진 썸네일(`Thumbnail`)은 그대로
 * 재사용했다.
 */
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../../components/Navigation/App bar/AppBar';
import AttachmentAddButton from '../../components/Input/Button/AttachmentAddButton';
import Thumbnail from '../../components/Data Display/Image Placeholder/Thumbnail';
import { GROUP_IMAGE_PICKER_TITLE } from '../../constants/groupManagerScreenText';

const GRID_COLUMNS = 3;
const TILE_SIZE = 112;
const MOCK_PHOTO_IDS = Array.from(
  { length: 12 },
  (_, index) => `group-gallery-photo-${index + 1}`,
);

type GridItem = { key: string; kind: 'camera' } | { key: string; kind: 'photo' };

const GRID_ITEMS: GridItem[] = [
  { key: 'camera', kind: 'camera' },
  ...MOCK_PHOTO_IDS.map(id => ({ key: id, kind: 'photo' as const })),
];

type GroupImagePickerScreenProps = {
  onSelect: (photoId: string) => void;
  onBack: () => void;
  onOpenCamera: () => void;
};

/** 실제 갤러리 접근 없이 mock 사진들로 구성한 단일선택 화면(모임 프로필 이미지 전용). */
function GroupImagePickerScreen({
  onSelect,
  onBack,
  onOpenCamera,
}: GroupImagePickerScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        type="imageSelect"
        title={GROUP_IMAGE_PICKER_TITLE}
        showDropdown
        showSelectionCount={false}
        onBackPress={onBack}
      />

      <FlatList
        data={GRID_ITEMS}
        keyExtractor={item => item.key}
        numColumns={GRID_COLUMNS}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) =>
          item.kind === 'camera' ? (
            <AttachmentAddButton type="gallery" onPress={onOpenCamera} />
          ) : (
            <Pressable onPress={() => onSelect(item.key)}>
              <Thumbnail size={TILE_SIZE} />
            </Pressable>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
});

export default GroupImagePickerScreen;
