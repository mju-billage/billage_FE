/** @screen ADD-4-SNACKBAR-01-0 이미지 첨부 제한 */
import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../../components/Navigation/App bar/AppBar';
import AttachmentAddButton from '../../components/Input/Button/AttachmentAddButton';
import Thumbnail from '../../components/Data Display/Image Placeholder/Thumbnail';
import Button from '../../components/Input/Button/Button';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import {
  GALLERY_PICKER_CONFIRM_LABEL,
  GALLERY_PICKER_TITLE,
  SNACKBAR_RECEIPT_MAX_LIMIT,
} from '../../constants/transactionScreenText';
import {
  BORDER_NEUTRAL_NORMAL,
  FOREGROUND_INVERSE,
  FOREGROUND_SECONDARY,
} from '../../constants/colors';

const CHECK_ICON = require('../../assets/icons/action/Check.png');

const GRID_COLUMNS = 3;
const SNACKBAR_AUTO_HIDE_MS = 1600;
const MOCK_PHOTO_IDS = Array.from(
  { length: 12 },
  (_, index) => `gallery-photo-${index + 1}`,
);

type GridItem = { key: string; kind: 'camera' } | { key: string; kind: 'photo' };

const GRID_ITEMS: GridItem[] = [
  { key: 'camera', kind: 'camera' },
  ...MOCK_PHOTO_IDS.map(id => ({ key: id, kind: 'photo' as const })),
];

type ReceiptGalleryPickerScreenProps = {
  remainingSlots: number;
  onConfirm: (photoIds: string[]) => void;
  onBack: () => void;
  onOpenCamera: () => void;
};

/** 실제 갤러리 접근 없이 mock 사진들로 구성한 다중선택 화면. */
function ReceiptGalleryPickerScreen({
  remainingSlots,
  onConfirm,
  onBack,
  onOpenCamera,
}: ReceiptGalleryPickerScreenProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showLimitSnackbar, setShowLimitSnackbar] = useState(false);

  const showLimitReached = () => {
    setShowLimitSnackbar(true);
    setTimeout(() => setShowLimitSnackbar(false), SNACKBAR_AUTO_HIDE_MS);
  };

  const toggleSelect = (id: string) => {
    setSelected(current => {
      if (current.includes(id)) {
        return current.filter(key => key !== id);
      }
      if (current.length >= remainingSlots) {
        showLimitReached();
        return current;
      }
      return [...current, id];
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        type="imageSelect"
        title={GALLERY_PICKER_TITLE}
        showDropdown
        onBackPress={onBack}
        selectedCount={selected.length}
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
            <SelectablePhotoTile
              selected={selected.includes(item.key)}
              onPress={() => toggleSelect(item.key)}
            />
          )
        }
      />

      <View style={styles.footer}>
        <Button
          label={GALLERY_PICKER_CONFIRM_LABEL}
          onPress={() =>
            onConfirm(selected.map(id => `${id}-${Date.now()}`))
          }
          disabled={selected.length === 0}
          fullWidth
        />
      </View>

      {showLimitSnackbar && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={SNACKBAR_RECEIPT_MAX_LIMIT} />
        </View>
      )}
    </SafeAreaView>
  );
}

function SelectablePhotoTile({
  selected,
  onPress,
}: {
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.photoTile} onPress={onPress}>
      <Thumbnail size={TILE_SIZE} />
      <View style={[styles.badge, selected && styles.badgeSelected]}>
        {selected && (
          <Image source={CHECK_ICON} style={styles.badgeCheck} />
        )}
      </View>
    </Pressable>
  );
}

const TILE_SIZE = 112;

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
  photoTile: {
    width: TILE_SIZE,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: FOREGROUND_INVERSE,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSelected: {
    backgroundColor: FOREGROUND_SECONDARY,
    borderColor: FOREGROUND_SECONDARY,
  },
  badgeCheck: {
    width: 12,
    height: 12,
    tintColor: FOREGROUND_INVERSE,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER_NEUTRAL_NORMAL,
  },
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 88,
  },
});

export default ReceiptGalleryPickerScreen;
