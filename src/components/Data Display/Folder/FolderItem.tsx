import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
  BACKGROUND_PRIMARY,
  BASIC_0,
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FILL_SECONDARY_BOLD,
  FOLDER_BACKGROUND,
  FOLDER_FRONT,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';
import Svg, { Path } from 'react-native-svg';

export const FOLDER_GRID_COLUMNS = 3;
export const FOLDER_GRID_COLUMN_GAP = 16;
const GRID_SCREEN_HORIZONTAL_PADDING = 20;
function getGridItemWidth(windowWidth: number): number {
  return (
    (windowWidth -
      GRID_SCREEN_HORIZONTAL_PADDING * 2 -
      FOLDER_GRID_COLUMN_GAP * (FOLDER_GRID_COLUMNS - 1)) /
    FOLDER_GRID_COLUMNS
  );
}

type FolderItemKind = 'folder' | 'ledger';
type FolderItemLayout = 'grid' | 'list';

type FolderItemProps = {
  kind: FolderItemKind;
  name: string;
  subtitle: string;
  layout?: FolderItemLayout;
  selected?: boolean;
  hasItems?: boolean;
  onPress?: () => void;
};

const TabShape = ({ fill }: { fill: string }) => (
  <Svg
    width="65"
    height="51"
    viewBox="0 0 65 51"
    style={graphicStyles.tabSvg}
  >
    <Path
      d="M0,4 C0,1.79 1.79,0 4,0 L22.5,0 C26.5,0 25.87,5 28.87,5 L61,5 C63.21,5 65,6.79 65,9 V47 C65,49.21 63.21,51 61,51 H4 C1.79,51 0,49.21 0,47 Z"
      fill={fill}
    />
  </Svg>
);

function FolderGraphic({ hasItems }: { hasItems: boolean }) {
  return (
    <View style={graphicStyles.folder}>
      <TabShape fill={FOLDER_BACKGROUND} />
      {hasItems && <View style={graphicStyles.ledgerPeek} />}
      <View style={graphicStyles.folderBody} />
    </View>
  );
}

function LedgerGraphic() {
  return (
    <View style={graphicStyles.ledger}>
      <View style={graphicStyles.ledgerLine} />
      <View style={graphicStyles.ledgerLine} />
      <View style={graphicStyles.ledgerLine} />
    </View>
  );
}

function FolderItem({
  kind,
  name,
  subtitle,
  layout = 'grid',
  selected = false,
  hasItems = true,
  onPress,
}: FolderItemProps) {
  const { width: windowWidth } = useWindowDimensions();
  const gridItemWidth = useMemo(() => getGridItemWidth(windowWidth), [windowWidth]);

  return (
    <Pressable
      style={[
        styles.container,
        layout === 'list' ? styles.listLayout : [styles.gridLayout, { width: gridItemWidth }],
        selected && styles.selected,
      ]}
      onPress={onPress}
    >
      {layout === 'list' ? (
        <View style={styles.iconSlot}>
          {kind === 'folder' ? (
            <FolderGraphic hasItems={hasItems} />
          ) : (
            <LedgerGraphic />
          )}
        </View>
      ) : kind === 'folder' ? (
        <FolderGraphic hasItems={hasItems} />
      ) : (
        <LedgerGraphic />
      )}
      <View
        style={
          layout === 'list' ? styles.listTextColumn : styles.gridTextColumn
        }
      >
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const graphicStyles = StyleSheet.create({
  folder: {
    width: 65,
    height: 51,
    position: 'relative',
  },
  
  tabSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  folderBodyBackGround: {
    position: 'absolute',
    top: 3,
    left: 10,
    right: 0,
    height: 12,
    backgroundColor: FILL_SECONDARY_BOLD,
    borderTopRightRadius: 3,
  },
  ledgerPeek: {
    position: 'absolute',
    top: 8,
    width: 62,
    left: 1.5,
    right: 0,
    height: 5,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 1,
  },
  folderBody: {
    position: 'absolute',
    top: 10,
    height: 41,
    width: 65,  
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: FOLDER_FRONT,
    borderRadius: 3,
  },
  
  ledger: {
    width: 60,
    height: 50,
    justifyContent: 'center',
    gap: 12,
    backgroundColor: BASIC_0,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  ledgerLine: {
    height: 1,
    borderRadius: 1,
    backgroundColor: BORDER_NEUTRAL_NORMAL,
  },
  ledgerLineShort: {
    width: '70%',
  },
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
  },
  gridLayout: {
    alignItems: 'center',
  },
  listLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconSlot: {
    width: 65,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: BACKGROUND_PRIMARY,
  },
  gridTextColumn: {
    alignItems: 'center',
    marginTop: 8,
  },
  listTextColumn: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default FolderItem;
