import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type {
  CompositeNavigationProp,
  RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FolderTabParamList } from './FolderTabNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import IconButton from '../../components/Input/Button/IconButton';
import SearchField from '../../components/Input/Search/SearchField';
import FolderItem from '../../components/Data Display/Folder/FolderItem';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderMoreMenu from './FolderMoreMenu';
import NewItemSheet from './NewItemSheet';
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import {
  addFolderNode,
  getChildNodes,
  renameNode,
  unlinkFolder,
  type FolderTreeNode,
} from '../../types/folder';
import {
  BACKUP_CONFIRM_LABEL,
  BACKUP_DIALOG_DESCRIPTION,
  BACKUP_DIALOG_TITLE,
  BACKUP_TITLE_PLACEHOLDER,
  FOLDER_EMPTY_SUBTITLE,
  FOLDER_EMPTY_TITLE,
  FOLDER_MENU_BACKUP,
  FOLDER_MENU_BUDGET_LIST,
  FOLDER_MENU_RENAME,
  FOLDER_MENU_SELECT_MOVE,
  FOLDER_MENU_UNLINK,
  FOLDER_MENU_VIEW_TOGGLE,
  FOLDER_SCREEN_TITLE,
  FOLDER_SEARCH_EMPTY_SUBTITLE,
  FOLDER_SEARCH_EMPTY_TITLE,
  FOLDER_SEARCH_PLACEHOLDER,
  NEW_FOLDER_CREATE_LABEL,
  NEW_FOLDER_DIALOG_TITLE,
  NEW_FOLDER_NAME_PLACEHOLDER,
  RENAME_CONFIRM_LABEL,
  RENAME_FOLDER_DIALOG_TITLE,
  RENAME_NAME_PLACEHOLDER,
  SNACKBAR_BACKUP_DONE_DESCRIPTION,
  SNACKBAR_BACKUP_DONE_TITLE,
  SNACKBAR_FOLDER_CREATED_SUFFIX,
  SNACKBAR_FOLDER_RENAMED,
  SNACKBAR_FOLDER_UNLINKED_SUFFIX,
  UNLINK_CONFIRM_LABEL,
  UNLINK_FOLDER_DIALOG_DESCRIPTION,
  UNLINK_FOLDER_DIALOG_TITLE,
  VIEW_TOGGLE_GRID_LABEL,
  VIEW_TOGGLE_LIST_LABEL,
} from '../../constants/folderScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';

const MENU_ICON = require('../../assets/icons/action/MenuHorizontal.png');
const PLUS_ICON = require('../../assets/icons/action/Plus.png');

const GRID_COLUMNS = 3;
const SNACKBAR_AUTO_HIDE_MS = 1600;

type FolderScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<FolderTabParamList, 'FolderList'>,
  NativeStackNavigationProp<RootStackParamList>
>;
type FolderScreenRouteProp = RouteProp<FolderTabParamList, 'FolderList'>;

type ActiveDialog = 'newFolder' | 'rename' | 'unlink' | 'backup' | null;
type MenuMode = 'main' | 'viewToggle';

/** 폴더 메인/하위 폴더 공용 화면. params가 없으면 폴더 탭 최상위, 있으면 해당 폴더 내부다. */
function FolderScreen() {
  const navigation = useNavigation<FolderScreenNavigationProp>();
  const route = useRoute<FolderScreenRouteProp>();
  const folderId = route.params?.folderId ?? null;
  const folderName = route.params?.folderName;
  const isRoot = folderId === null;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [children, setChildren] = useState<FolderTreeNode[]>(() =>
    getChildNodes(folderId),
  );
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [menuMode, setMenuMode] = useState<MenuMode>('main');
  const [newItemSheetVisible, setNewItemSheetVisible] = useState(false);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [dialogInputValue, setDialogInputValue] = useState('');
  const [snackbar, setSnackbar] = useState<{
    title: string;
    description?: string;
  } | null>(null);

  const refreshChildren = useCallback(() => {
    setChildren(getChildNodes(folderId));
  }, [folderId]);

  useFocusEffect(refreshChildren);

  const filteredChildren = searchQuery.trim()
    ? children.filter(node =>
        node.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : children;

  const showSnackbar = (title: string, description?: string) => {
    setSnackbar({ title, description });
    setTimeout(() => setSnackbar(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const closeMoreMenu = () => {
    setMoreMenuVisible(false);
    setMenuMode('main');
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setDialogInputValue('');
  };

  const handlePressItem = (node: FolderTreeNode) => {
    if (node.kind === 'folder') {
      navigation.push('FolderList', {
        folderId: node.id,
        folderName: node.name,
      });
    } else {
      navigation.navigate('LedgerDetail', { ledgerId: node.id });
    }
  };

  const mainMenuItems: MenuItem[] = isRoot
    ? [
        { key: 'selectMove', label: FOLDER_MENU_SELECT_MOVE },
        { key: 'viewToggle', label: FOLDER_MENU_VIEW_TOGGLE },
        { key: 'budgetList', label: FOLDER_MENU_BUDGET_LIST },
        { key: 'backup', label: FOLDER_MENU_BACKUP },
      ]
    : [
        { key: 'selectMove', label: FOLDER_MENU_SELECT_MOVE },
        { key: 'rename', label: FOLDER_MENU_RENAME },
        { key: 'viewToggle', label: FOLDER_MENU_VIEW_TOGGLE },
        { key: 'unlink', label: FOLDER_MENU_UNLINK },
      ];

  const viewToggleMenuItems: MenuItem[] = [
    { key: 'grid', label: VIEW_TOGGLE_GRID_LABEL },
    { key: 'list', label: VIEW_TOGGLE_LIST_LABEL },
  ];

  const handleSelectMenu = (key: string) => {
    switch (key) {
      case 'selectMove':
        closeMoreMenu();
        navigation.navigate('FolderSelectMove', { folderId });
        break;
      case 'rename':
        closeMoreMenu();
        setDialogInputValue(folderName ?? '');
        setActiveDialog('rename');
        break;
      case 'viewToggle':
        setMenuMode('viewToggle');
        break;
      case 'grid':
        setViewMode('grid');
        closeMoreMenu();
        break;
      case 'list':
        setViewMode('list');
        closeMoreMenu();
        break;
      case 'unlink':
        closeMoreMenu();
        setActiveDialog('unlink');
        break;
      case 'budgetList':
        closeMoreMenu();
        navigation.navigate('FolderBudgetList');
        break;
      case 'backup':
        closeMoreMenu();
        setDialogInputValue('');
        setActiveDialog('backup');
        break;
      default:
        break;
    }
  };

  const handleConfirmDialog = () => {
    const trimmed = dialogInputValue.trim();
    if (activeDialog === 'newFolder') {
      if (!trimmed) {
        return;
      }
      addFolderNode(folderId, trimmed);
      refreshChildren();
      showSnackbar(`'${trimmed}'${SNACKBAR_FOLDER_CREATED_SUFFIX}`);
      closeDialog();
    } else if (activeDialog === 'rename') {
      if (!trimmed || !folderId) {
        return;
      }
      renameNode(folderId, trimmed);
      showSnackbar(SNACKBAR_FOLDER_RENAMED);
      closeDialog();
      navigation.setParams({ folderId, folderName: trimmed });
    } else if (activeDialog === 'unlink') {
      if (!folderId) {
        return;
      }
      const name = folderName ?? '';
      unlinkFolder(folderId);
      showSnackbar(`'${name}'${SNACKBAR_FOLDER_UNLINKED_SUFFIX}`);
      closeDialog();
      setTimeout(() => navigation.goBack(), SNACKBAR_AUTO_HIDE_MS);
    } else if (activeDialog === 'backup') {
      closeDialog();
      showSnackbar(
        SNACKBAR_BACKUP_DONE_TITLE,
        SNACKBAR_BACKUP_DONE_DESCRIPTION,
      );
    }
  };

  const dialogConfig = getDialogConfig(activeDialog);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {!isRoot && (
            <View style={styles.backButtonWrapper}>
              <BackButton onPress={() => navigation.goBack()} />
            </View>
          )}
          <Text style={styles.title} numberOfLines={1}>
            {isRoot ? FOLDER_SCREEN_TITLE : folderName}
          </Text>
        </View>
        <IconButton icon={MENU_ICON} onPress={() => setMoreMenuVisible(true)} />
      </View>

      <View style={styles.searchWrapper}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={FOLDER_SEARCH_PLACEHOLDER}
        />
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countText}>{filteredChildren.length} 건</Text>
        <IconButton
          icon={PLUS_ICON}
          onPress={() => setNewItemSheetVisible(true)}
        />
      </View>

      {filteredChildren.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {searchQuery.trim()
              ? FOLDER_SEARCH_EMPTY_TITLE
              : FOLDER_EMPTY_TITLE}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery.trim()
              ? FOLDER_SEARCH_EMPTY_SUBTITLE
              : FOLDER_EMPTY_SUBTITLE}
          </Text>
        </View>
      ) : (
        <FlatList
          key={viewMode}
          data={filteredChildren}
          keyExtractor={node => node.id}
          numColumns={viewMode === 'grid' ? GRID_COLUMNS : 1}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <FolderItem
              kind={item.kind}
              name={item.name}
              subtitle={getItemSubtitle(item)}
              layout={viewMode}
              hasItems={
                item.kind === 'folder'
                  ? getChildNodes(item.id).length > 0
                  : undefined
              }
              onPress={() => handlePressItem(item)}
            />
          )}
        />
      )}

      {snackbar && (
        <View style={styles.snackbarWrapper}>
          <Snackbar
            visible
            title={snackbar.title}
            description={snackbar.description}
          />
        </View>
      )}

      <NewItemSheet
        visible={newItemSheetVisible}
        onClose={() => setNewItemSheetVisible(false)}
        onPressNewLedger={() => {
          setNewItemSheetVisible(false);
          navigation.navigate('LedgerCreate', { parentId: folderId });
        }}
        onPressNewFolder={() => {
          setNewItemSheetVisible(false);
          setDialogInputValue('');
          setActiveDialog('newFolder');
        }}
      />

      <FolderMoreMenu
        visible={moreMenuVisible}
        onClose={closeMoreMenu}
        items={menuMode === 'main' ? mainMenuItems : viewToggleMenuItems}
        onSelect={handleSelectMenu}
      />

      <Dialog
        visible={activeDialog !== null}
        title={dialogConfig.title}
        description={dialogConfig.description}
        showTextField={dialogConfig.showTextField}
        textFieldValue={dialogInputValue}
        onChangeTextField={setDialogInputValue}
        textFieldPlaceholder={dialogConfig.placeholder}
        confirmLabel={dialogConfig.confirmLabel}
        onCancel={closeDialog}
        onConfirm={handleConfirmDialog}
      />
    </View>
  );
}

function getItemSubtitle(node: FolderTreeNode): string {
  if (node.kind === 'folder') {
    return `${getChildNodes(node.id).length}개의 항목`;
  }
  return node.createdAt;
}

function getDialogConfig(activeDialog: ActiveDialog) {
  switch (activeDialog) {
    case 'newFolder':
      return {
        title: NEW_FOLDER_DIALOG_TITLE,
        description: undefined,
        showTextField: true,
        placeholder: NEW_FOLDER_NAME_PLACEHOLDER,
        confirmLabel: NEW_FOLDER_CREATE_LABEL,
      };
    case 'rename':
      return {
        title: RENAME_FOLDER_DIALOG_TITLE,
        description: undefined,
        showTextField: true,
        placeholder: RENAME_NAME_PLACEHOLDER,
        confirmLabel: RENAME_CONFIRM_LABEL,
      };
    case 'unlink':
      return {
        title: UNLINK_FOLDER_DIALOG_TITLE,
        description: UNLINK_FOLDER_DIALOG_DESCRIPTION,
        showTextField: false,
        placeholder: undefined,
        confirmLabel: UNLINK_CONFIRM_LABEL,
      };
    case 'backup':
      return {
        title: BACKUP_DIALOG_TITLE,
        description: BACKUP_DIALOG_DESCRIPTION,
        showTextField: true,
        placeholder: BACKUP_TITLE_PLACEHOLDER,
        confirmLabel: BACKUP_CONFIRM_LABEL,
      };
    default:
      return {
        title: '',
        description: undefined,
        showTextField: false,
        placeholder: undefined,
        confirmLabel: undefined,
      };
  }
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  backButtonWrapper: {
    marginRight: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  searchWrapper: {
    marginBottom: 16,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  countText: {
    fontSize: 14,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  listContent: {
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
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
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default FolderScreen;
