import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Thumbnail from '../../components/Data Display/Image Placeholder/Thumbnail';
import type { Receipt } from '../../types/receipt';
import { buildAuthenticatedImageSource } from '../../utils/authenticatedImage';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

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
