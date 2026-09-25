import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderItem from '../../components/Data Display/Folder/FolderItem';
import { getActiveGroup } from '../../types/group';
import { getCachedFolderTree } from '../../types/folderTree';
import { findFolderNode, getChildFolders } from '../../utils/folderTree';
import * as folderService from '../../services/folderService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  MOVE_DESTINATION_CONFIRM_LABEL,
  MOVE_DESTINATION_MOVING_LABEL,
  MOVE_DESTINATION_NO_SUBFOLDER,
  MOVE_DESTINATION_ROOT_TITLE,
  SNACKBAR_FOLDER_MOVED,
} from '../../constants/folderScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type FolderMoveDestinationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FolderMoveDestination'
>;
type FolderMoveDestinationRouteProp = RouteProp<
  RootStackParamList,
  'FolderMoveDestination'
>;

function FolderMoveDestinationScreen() {
  const navigation = useNavigation<FolderMoveDestinationNavigationProp>();
  const route = useRoute<FolderMoveDestinationRouteProp>();
  const { items, sourceFolderId, destinationFolderId } = route.params;

  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const group = getActiveGroup();
  const tree = group ? getCachedFolderTree(group.id) : [];

  const currentNode = destinationFolderId
    ? findFolderNode(tree, destinationFolderId)
    : null;
  const title = currentNode ? currentNode.name : MOVE_DESTINATION_ROOT_TITLE;

  const selectedFolderIds = new Set(
    items.filter(item => item.kind === 'folder').map(item => item.id),
  );
  const subfolders = getChildFolders(tree, destinationFolderId).filter(
    folder => !selectedFolderIds.has(folder.id),
  );

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const handlePressFolder = (folderId: string) => {
    navigation.push('FolderMoveDestination', {
      items,
      sourceFolderId,
      destinationFolderId: folderId,
    });
  };

  const handleConfirm = async () => {
    if (isMoving || !group) {
      return;
    }
    setIsMoving(true);
    try {
      await folderService.moveFolderItems(group.id, {
        folderIds: items.filter(item => item.kind === 'folder').map(item => item.id),
        ledgerIds: items.filter(item => item.kind === 'ledger').map(item => item.id),
        targetFolderId: destinationFolderId,
      });
      setSnackbarMessage(SNACKBAR_FOLDER_MOVED);
      setTimeout(() => {
        navigation.popToTop();
      }, SNACKBAR_AUTO_HIDE_MS);
    } catch (error) {
      setSnackbarMessage(toErrorMessage(error));
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <ScreenContainer
      background="secondary"
      snackbar={snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined}
      snackbarOffset={68}
    >
      <AppBar title={title} onBackPress={() => navigation.goBack()} />

      <View style={styles.body}>
        {subfolders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {MOVE_DESTINATION_NO_SUBFOLDER}
            </Text>
          </View>
        ) : (
          <FlatList
            data={subfolders}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <FolderItem
                kind="folder"
                name={item.name}
                subtitle={`${item.children.length + item.ledgerCount}개의 항목`}
                layout="list"
                hasItems={item.children.length + item.ledgerCount > 0}
                onPress={() => handlePressFolder(item.id)}
              />
            )}
          />
        )}

        <View style={styles.footer}>
          <Button
            label={isMoving ? MOVE_DESTINATION_MOVING_LABEL : MOVE_DESTINATION_CONFIRM_LABEL}
            onPress={handleConfirm}
            disabled={isMoving}
            fullWidth
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
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
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  footer: {
    paddingVertical: 16,
  },
});

export default FolderMoveDestinationScreen;
