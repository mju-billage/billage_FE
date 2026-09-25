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
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Thumbnail from '../../components/Data Display/Image Placeholder/Thumbnail';
import type { Receipt } from '../../types/receipt';
import { buildAuthenticatedImageSource } from '../../utils/authenticatedImage';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

// 폴더 그리드(`FolderItem`의 FOLDER_GRID_*)는 시안 실측 gap 16으로 변경됨, 앨범은 미실측 —
// 그래서 이 파일의 gap 8/패딩 24는 폴더와 묶지 않고 그대로 둔다. 앨범 시안(`더보기_증빙자료앨범.png`)
// 목업은 좌우 여백 약 20dp/타일 간격 약 7~8dp로 보이나 축소 이미지라 실측 필요.
const GRID_COLUMNS = 3;
const GRID_GAP = 8;
const HORIZONTAL_PADDING = 20;

type ReceiptGridProps = {
  items: Receipt[];
  emptyText: string;
  onEndReached: () => void;
  onPressItem: (item: Receipt) => void;
};

function ReceiptGrid({ items, emptyText, onEndReached, onPressItem }: ReceiptGridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const tileSize = useMemo(
    () =>
      (windowWidth - HORIZONTAL_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) /
      GRID_COLUMNS,
    [windowWidth],
  );

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
            <Thumbnail imageUri={source.uri} imageHeaders={source.headers} size={tileSize} />
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
