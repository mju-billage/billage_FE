import { useState, useSyncExternalStore } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import { setPendingSnackbar } from '../../utils/pendingSnackbar';
import FolderItem, {
  FOLDER_GRID_COLUMNS,
  FOLDER_GRID_COLUMN_GAP,
} from '../../components/Data Display/Folder/FolderItem';
import FolderMoreMenu from './FolderMoreMenu';
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import { getActiveGroup } from '../../types/group';
import { getCachedFolderTree } from '../../types/folderTree';
import { findFolderNode, getChildFolders } from '../../utils/folderTree';
import * as folderService from '../../services/folderService';
import { ApiError } from '../../services/apiClient';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import {
  getFolderViewMode,
  setFolderViewMode,
  subscribeFolderViewMode,
} from '../../utils/folderViewMode';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  FOLDER_NAME_MAX_LENGTH,
  MOVE_DESTINATION_CONFIRM_LABEL,
  MOVE_DESTINATION_MOVING_LABEL,
  MOVE_DESTINATION_NO_SUBFOLDER,
  MOVE_DESTINATION_ROOT_TITLE,
  MOVE_DESTINATION_TITLE,
  NEW_FOLDER_CREATE_LABEL,
  NEW_FOLDER_DIALOG_TITLE,
  NEW_FOLDER_NAME_PLACEHOLDER,
  SNACKBAR_FOLDER_CREATED_SUFFIX,
  SNACKBAR_FOLDER_MOVED_PREFIX,
  SNACKBAR_FOLDER_MOVED_SUFFIX,
  VIEW_TOGGLE_GRID_LABEL,
  VIEW_TOGGLE_LIST_LABEL,
} from '../../constants/folderScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const FOLDER_ADD_ICON = require('../../assets/icons/content/Folder Add.png');
const MENU_ICON = require('../../assets/icons/action/MenuHorizontal.png');
const GRID_ICON = require('../../assets/icons/system/Grid.png');
const LIST_ICON = require('../../assets/icons/system/List.png');

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
  const [, setRefreshTick] = useState(0);
  const viewMode = useSyncExternalStore(subscribeFolderViewMode, getFolderViewMode);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [newFolderDialogVisible, setNewFolderDialogVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderError, setNewFolderError] = useState<string | undefined>();
  const { isLocked, run } = useSubmitLock();

  const group = getActiveGroup();
  const tree = group ? getCachedFolderTree(group.id) : [];

  const currentNode = destinationFolderId
    ? findFolderNode(tree, destinationFolderId)
    : null;
  const title = currentNode ? currentNode.name : MOVE_DESTINATION_TITLE;
  const snackbarTargetName = currentNode
    ? currentNode.name
    : MOVE_DESTINATION_ROOT_TITLE;
  const isSameAsSource = destinationFolderId === sourceFolderId;

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
      return getApiErrorMessage(error.code, error.message);
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
      setPendingSnackbar(
        `${SNACKBAR_FOLDER_MOVED_PREFIX}${snackbarTargetName}${SNACKBAR_FOLDER_MOVED_SUFFIX}`,
      );
      navigation.popToTop();
    } catch (error) {
      setSnackbarMessage(toErrorMessage(error));
    } finally {
      setIsMoving(false);
    }
  };

  const viewMenuItems: MenuItem[] = [
    { key: 'grid', label: VIEW_TOGGLE_GRID_LABEL, icon: GRID_ICON },
    { key: 'list', label: VIEW_TOGGLE_LIST_LABEL, icon: LIST_ICON },
  ];

  const handleSelectMoreMenu = (key: string) => {
    if (key === 'grid') {
      setFolderViewMode('grid');
    } else if (key === 'list') {
      setFolderViewMode('list');
    }
    setMoreMenuVisible(false);
  };

  const closeNewFolderDialog = () => {
    setNewFolderDialogVisible(false);
    setNewFolderName('');
    setNewFolderError(undefined);
  };

  const handleCreateFolder = () => {
    const trimmed = newFolderName.trim();
    if (!trimmed || !group) {
      return;
    }
    run(async () => {
      try {
        await folderService.createFolder(group.id, trimmed, destinationFolderId);
        await folderService.getFolderTree(group.id);
        closeNewFolderDialog();
        setSnackbarMessage(`'${trimmed}'${SNACKBAR_FOLDER_CREATED_SUFFIX}`);
        setRefreshTick(tick => tick + 1);
        return true;
      } catch (error) {
        if (error instanceof ApiError) {
          const fieldError = error.fieldErrors.find(fe => fe.field === 'name');
          setNewFolderError(fieldError?.reason ?? getApiErrorMessage(error.code, error.message));
        } else {
          setNewFolderError(toErrorMessage(error));
        }
        return false;
      }
    });
  };

  return (
    <ScreenContainer
      background="secondary"
      snackbar={
        <Snackbar
          visible={snackbarMessage != null}
          title={snackbarMessage ?? ''}
          onClose={() => setSnackbarMessage(null)}
        />
      }
      // 푸터 위아래 16 + 버튼 48 → 스낵바는 버튼 윗변보다 20 위
      snackbarOffset={64}
    >
      <AppBar
        title={title}
        onBackPress={() => navigation.goBack()}
        rightIcons={[
          { icon: FOLDER_ADD_ICON, onPress: () => setNewFolderDialogVisible(true) },
          { icon: MENU_ICON, onPress: () => setMoreMenuVisible(true) },
        ]}
      />

      <View style={styles.body}>
        {subfolders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {MOVE_DESTINATION_NO_SUBFOLDER}
            </Text>
          </View>
        ) : (
          <FlatList
            key={viewMode}
            data={subfolders}
            keyExtractor={item => item.id}
            numColumns={viewMode === 'grid' ? FOLDER_GRID_COLUMNS : 1}
            columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <FolderItem
                kind="folder"
                name={item.name}
                subtitle={`${item.children.length + item.ledgerCount}개의 항목`}
                layout={viewMode}
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
            disabled={isMoving || isSameAsSource}
            fullWidth
          />
        </View>
      </View>

      <FolderMoreMenu
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        items={viewMenuItems}
        showIcon
        onSelect={handleSelectMoreMenu}
      />

      <Dialog
        visible={newFolderDialogVisible}
        title={NEW_FOLDER_DIALOG_TITLE}
        showTextField
        textFieldValue={newFolderName}
        onChangeTextField={text => {
          setNewFolderName(text);
          setNewFolderError(undefined);
        }}
        textFieldPlaceholder={NEW_FOLDER_NAME_PLACEHOLDER}
        textFieldMaxLength={FOLDER_NAME_MAX_LENGTH}
        autoFocusTextField
        textFieldError={newFolderError}
        confirmLabel={NEW_FOLDER_CREATE_LABEL}
        confirmDisabled={isLocked}
        onCancel={closeNewFolderDialog}
        onConfirm={handleCreateFolder}
      />
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
  gridRow: {
    justifyContent: 'flex-start',
    gap: FOLDER_GRID_COLUMN_GAP,
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
