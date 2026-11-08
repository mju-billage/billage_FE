import { useCallback, useState, useSyncExternalStore } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderItem, {
  FOLDER_GRID_COLUMNS,
  FOLDER_GRID_COLUMN_GAP,
} from '../../components/Data Display/Folder/FolderItem';
import FolderMoreMenu from './FolderMoreMenu';
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import { getActiveGroup } from '../../types/group';
import { getChildFolders, mergeFolderListItems } from '../../utils/folderTree';
import { formatDateShort } from '../../utils/dueDate';
import type { FolderListItem } from '../../utils/folderTree';
import * as folderService from '../../services/folderService';
import * as ledgerService from '../../services/ledgerService';
import * as groupService from '../../services/groupService';
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
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  FOLDER_EMPTY_SUBTITLE,
  FOLDER_NAME_MAX_LENGTH,
  NEW_FOLDER_CREATE_LABEL,
  NEW_FOLDER_DIALOG_TITLE,
  NEW_FOLDER_NAME_PLACEHOLDER,
  SELECT_MOVE_CONFIRM_LABEL,
  SELECT_MOVE_CONFIRM_SUFFIX,
  SELECT_MOVE_EMPTY_TITLE,
  SELECT_MOVE_LOADING,
  SELECT_MOVE_RETRY_LABEL,
  SELECT_MOVE_TITLE,
  SNACKBAR_FOLDER_CREATED_SUFFIX,
  VIEW_TOGGLE_GRID_LABEL,
  VIEW_TOGGLE_LIST_LABEL,
} from '../../constants/folderScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const FOLDER_ADD_ICON = require('../../assets/icons/content/Folder Add.png');
const MENU_ICON = require('../../assets/icons/action/MenuHorizontal.png');
const GRID_ICON = require('../../assets/icons/system/Grid.png');
const LIST_ICON = require('../../assets/icons/system/List.png');

type FolderSelectMoveNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FolderSelectMove'
>;
type FolderSelectMoveRouteProp = RouteProp<RootStackParamList, 'FolderSelectMove'>;
type LoadState = 'loading' | 'error' | 'ready';

function getItemSubtitle(item: FolderListItem): string {
  if (item.kind === 'folder') {
    return `${item.itemCount}개의 항목`;
  }
  return formatDateShort(item.createdAt);
}

function FolderSelectMoveScreen() {
  const navigation = useNavigation<FolderSelectMoveNavigationProp>();
  const route = useRoute<FolderSelectMoveRouteProp>();
  const folderId = route.params.folderId;

  const [items, setItems] = useState<FolderListItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [selected, setSelected] = useState<{ id: string; kind: 'folder' | 'ledger'; name: string }[]>([]);
  const viewMode = useSyncExternalStore(subscribeFolderViewMode, getFolderViewMode);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [newFolderDialogVisible, setNewFolderDialogVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderError, setNewFolderError] = useState<string | undefined>();
  const { isLocked, run } = useSubmitLock();
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      let group = getActiveGroup();
      if (!group) {
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const [tree, allLedgers] = await Promise.all([
        folderService.getFolderTree(group.id),
        folderId
          ? ledgerService.getLedgersInFolder(folderId)
          : ledgerService.getAllLedgersInGroup(group.id),
      ]);
      const ledgers = folderId
        ? allLedgers
        : allLedgers.filter(ledger => ledger.folderId === null);
      const childFolders = getChildFolders(tree, folderId);
      setItems(mergeFolderListItems(childFolders, ledgers));
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [folderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggleSelect = (item: FolderListItem) => {
    setSelected(prev =>
      prev.some(sel => sel.id === item.id && sel.kind === item.kind)
        ? prev.filter(sel => !(sel.id === item.id && sel.kind === item.kind))
        : [...prev, { id: item.id, kind: item.kind, name: item.name }],
    );
  };

  const confirmLabel =
    selected.length > 0
      ? `${selected.length}${SELECT_MOVE_CONFIRM_SUFFIX}`
      : SELECT_MOVE_CONFIRM_LABEL;

  const handleConfirm = () => {
    navigation.navigate('FolderMoveDestination', {
      items: selected,
      sourceFolderId: folderId,
      destinationFolderId: null,
    });
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
    const group = getActiveGroup();
    if (!trimmed || !group) {
      return;
    }
    run(async () => {
      try {
        await folderService.createFolder(group.id, trimmed, folderId);
        closeNewFolderDialog();
        setSnackbar(`'${trimmed}'${SNACKBAR_FOLDER_CREATED_SUFFIX}`);
        load();
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
          visible={snackbar != null}
          title={snackbar ?? ''}
          onClose={() => setSnackbar(null)}
        />
      }
    >
      <AppBar
        title={SELECT_MOVE_TITLE}
        onBackPress={() => navigation.goBack()}
        rightIcons={[
          { icon: FOLDER_ADD_ICON, onPress: () => setNewFolderDialogVisible(true) },
          { icon: MENU_ICON, onPress: () => setMoreMenuVisible(true) },
        ]}
      />

      <View style={styles.body}>
        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{SELECT_MOVE_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button label={SELECT_MOVE_RETRY_LABEL} onPress={load} hierarchy="secondary" style={{ alignSelf: 'center' }} />
          </View>
        )}

        {loadState === 'ready' && (
          <>
            {items.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{SELECT_MOVE_EMPTY_TITLE}</Text>
                <Text style={styles.emptySubtitle}>{FOLDER_EMPTY_SUBTITLE}</Text>
              </View>
            ) : (
              <FlatList
                key={viewMode}
                data={items}
                keyExtractor={item => `${item.kind}-${item.id}`}
                numColumns={viewMode === 'grid' ? FOLDER_GRID_COLUMNS : 1}
                columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <FolderItem
                    kind={item.kind}
                    name={item.name}
                    subtitle={getItemSubtitle(item)}
                    layout={viewMode}
                    hasItems={item.kind === 'folder' ? item.itemCount > 0 : undefined}
                    selected={selected.some(sel => sel.id === item.id && sel.kind === item.kind)}
                    onPress={() => toggleSelect(item)}
                  />
                )}
              />
            )}

            <View style={styles.footer}>
              <Button
                label={confirmLabel}
                disabled={selected.length === 0}
                fullWidth
                onPress={handleConfirm}
              />
            </View>
          </>
        )}
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
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    ...TYPOGRAPHY.subtitle3,
  },
  emptySubtitle: {
    marginTop: 6,
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  footer: {
    paddingVertical: 16,
  },
});

export default FolderSelectMoveScreen;
