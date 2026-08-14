import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import Button from '../../components/Input/Button/Button';
import FolderItem from '../../components/Data Display/Folder/FolderItem';
import { getChildNodes, type FolderTreeNode } from '../../types/folder';
import {
  FOLDER_EMPTY_SUBTITLE,
  SELECT_MOVE_CONFIRM_LABEL,
  SELECT_MOVE_CONFIRM_SUFFIX,
  SELECT_MOVE_EMPTY_TITLE,
  SELECT_MOVE_TITLE,
} from '../../constants/folderScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';

type FolderSelectMoveNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FolderSelectMove'
>;
type FolderSelectMoveRouteProp = RouteProp<
  RootStackParamList,
  'FolderSelectMove'
>;

function getItemSubtitle(node: FolderTreeNode): string {
  if (node.kind === 'folder') {
    return `${getChildNodes(node.id).length}개의 항목`;
  }
  return node.createdAt;
}

/** 폴더 최상위/하위에서 "선택 이동"으로 진입: 이동시킬 폴더/장부를 다중 선택한다. */
function FolderSelectMoveScreen() {
  const navigation = useNavigation<FolderSelectMoveNavigationProp>();
  const route = useRoute<FolderSelectMoveRouteProp>();
  const folderId = route.params.folderId;

  const [items] = useState<FolderTreeNode[]>(() => getChildNodes(folderId));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id],
    );
  };

  const confirmLabel =
    selectedIds.length > 0
      ? `${selectedIds.length}${SELECT_MOVE_CONFIRM_SUFFIX}`
      : SELECT_MOVE_CONFIRM_LABEL;

  const handleConfirm = () => {
    navigation.navigate('FolderMoveDestination', {
      itemIds: selectedIds,
      sourceFolderId: folderId,
      destinationFolderId: null,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>{SELECT_MOVE_TITLE}</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{SELECT_MOVE_EMPTY_TITLE}</Text>
          <Text style={styles.emptySubtitle}>{FOLDER_EMPTY_SUBTITLE}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <FolderItem
              kind={item.kind}
              name={item.name}
              subtitle={getItemSubtitle(item)}
              layout="list"
              hasItems={
                item.kind === 'folder'
                  ? getChildNodes(item.id).length > 0
                  : undefined
              }
              selected={selectedIds.includes(item.id)}
              onPress={() => toggleSelect(item.id)}
            />
          )}
        />
      )}

      <View style={styles.footer}>
        <Button
          label={confirmLabel}
          disabled={selectedIds.length === 0}
          fullWidth
          onPress={handleConfirm}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  footer: {
    paddingVertical: 16,
  },
});

export default FolderSelectMoveScreen;
