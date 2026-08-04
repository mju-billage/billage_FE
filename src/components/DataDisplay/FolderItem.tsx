import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BACKGROUND_PRIMARY, LINK_BLUE } from '../../constants/colors';

const FOLDER_ICON = require('../../assets/icons/action/Folder.png');
const LEDGER_ICON = require('../../assets/icons/content/Bill.png');

type FolderItemKind = 'folder' | 'ledger';
type FolderItemLayout = 'grid' | 'list';

type FolderItemProps = {
  kind: FolderItemKind;
  name: string;
  subtitle: string;
  layout?: FolderItemLayout;
  selected?: boolean;
  onPress?: () => void;
};

/** 폴더/장부 항목. grid(세로형)/list(가로형) 레이아웃과 선택 상태를 지원한다. */
function FolderItem({
  kind,
  name,
  subtitle,
  layout = 'grid',
  selected = false,
  onPress,
}: FolderItemProps) {
  const icon = kind === 'folder' ? FOLDER_ICON : LEDGER_ICON;

  return (
    <Pressable
      style={[
        styles.container,
        layout === 'list' ? styles.listLayout : styles.gridLayout,
        selected && styles.selected,
      ]}
      onPress={onPress}
    >
      <Image source={icon} style={styles.icon} />
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
  },
  gridLayout: {
    alignItems: 'center',
    width: 100,
  },
  listLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selected: {
    backgroundColor: BACKGROUND_PRIMARY,
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: LINK_BLUE,
  },
  gridTextColumn: {
    alignItems: 'center',
    marginTop: 8,
  },
  listTextColumn: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#868E96',
  },
});

export default FolderItem;
