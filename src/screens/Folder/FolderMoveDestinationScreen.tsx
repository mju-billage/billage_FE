import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/BackButton';
import PrimaryButton from '../../components/Button/PrimaryButton';
import Snackbar from '../../components/Feedback/Snackbar';
import FolderItem from '../../components/DataDisplay/FolderItem';
import { getChildNodes, getNodeById, moveNodes } from '../../types/folder';
import {
  MOVE_DESTINATION_CONFIRM_LABEL,
  MOVE_DESTINATION_NO_SUBFOLDER,
  MOVE_DESTINATION_ROOT_TITLE,
  SNACKBAR_FOLDER_MOVED,
} from '../../constants/folderScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type FolderMoveDestinationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FolderMoveDestination'
>;
type FolderMoveDestinationRouteProp = RouteProp<
  RootStackParamList,
  'FolderMoveDestination'
>;

/** 이동 경로 선택: 폴더 트리를 재귀적으로 탐색하며 현재 위치를 이동 대상으로 확정한다. */
function FolderMoveDestinationScreen() {
  const navigation = useNavigation<FolderMoveDestinationNavigationProp>();
  const route = useRoute<FolderMoveDestinationRouteProp>();
  const { itemIds, sourceFolderId, destinationFolderId } = route.params;

  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const currentNode = destinationFolderId
    ? getNodeById(destinationFolderId)
    : null;
  const title = currentNode ? currentNode.name : MOVE_DESTINATION_ROOT_TITLE;

  const subfolders = getChildNodes(destinationFolderId).filter(
    node => node.kind === 'folder' && !itemIds.includes(node.id),
  );

  const handlePressFolder = (folderId: string) => {
    navigation.push('FolderMoveDestination', {
      itemIds,
      sourceFolderId,
      destinationFolderId: folderId,
    });
  };

  const handleConfirm = () => {
    moveNodes(itemIds, destinationFolderId);
    setSnackbarVisible(true);
    setTimeout(() => {
      navigation.popToTop();
    }, SNACKBAR_AUTO_HIDE_MS);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {subfolders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{MOVE_DESTINATION_NO_SUBFOLDER}</Text>
        </View>
      ) : (
        <FlatList
          data={subfolders}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <FolderItem
              kind={item.kind}
              name={item.name}
              subtitle={`${getChildNodes(item.id).length}개의 항목`}
              layout="list"
              onPress={() => handlePressFolder(item.id)}
            />
          )}
        />
      )}

      {snackbarVisible && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={SNACKBAR_FOLDER_MOVED} />
        </View>
      )}

      <View style={styles.footer}>
        <PrimaryButton
          label={MOVE_DESTINATION_CONFIRM_LABEL}
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
    flexShrink: 1,
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
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 88,
  },
  footer: {
    paddingVertical: 16,
  },
});

export default FolderMoveDestinationScreen;
