/**
 * 앨범 메인(ETC-2-PAGE-05-0)·앨범 내 검색(ETC-3-PAGE-05-0) 둘 다 쓰는 3열 그리드.
 * 두 화면이 필터/검색창만 다르고 "그리드+무한스크롤+빈 상태" 로직이 완전히
 * 같아 이 조각만 분리했다.
 *
 * 썸네일에 원본 이미지를 그대로 쓴다 — 이 API엔 별도 축소본 URL이 없다
 * (`types/receipt.ts` 주석, File.txt "이미지 압축은 하지 않습니다"). 장수가
 * 많은 모임은 그리드 전체가 원본 수십 장을 내려받는 셈이라 느려질 수 있다 —
 * 알려진 제약으로 남겨둔다(design-verification.md §5-4).
 */
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Thumbnail from '../../components/Data Display/Image Placeholder/Thumbnail';
import type { Receipt } from '../../types/receipt';
import { buildAuthenticatedImageSource } from '../../utils/authenticatedImage';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const GRID_COLUMNS = 3;
const GRID_GAP = 8;
const HORIZONTAL_PADDING = 24;
const TILE_SIZE =
  (Dimensions.get('window').width -
    HORIZONTAL_PADDING * 2 -
    GRID_GAP * (GRID_COLUMNS - 1)) /
  GRID_COLUMNS;

type ReceiptGridProps = {
  items: Receipt[];
  emptyText: string;
  onEndReached: () => void;
  onPressItem: (item: Receipt) => void;
};

function ReceiptGrid({ items, emptyText, onEndReached, onPressItem }: ReceiptGridProps) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={item => item.fileId}
      numColumns={GRID_COLUMNS}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={styles.gridContent}
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
      renderItem={({ item }) => {
        const source = buildAuthenticatedImageSource(item.fileUrl);
        return (
          <Pressable onPress={() => onPressItem(item)}>
            <Thumbnail imageUri={source.uri} imageHeaders={source.headers} size={TILE_SIZE} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  gridContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  gridRow: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default ReceiptGrid;
