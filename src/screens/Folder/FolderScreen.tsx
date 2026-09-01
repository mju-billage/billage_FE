/** @screen FDR-1-PAGE-01-0 폴더 메인 (그리드/리스트 뷰, isRoot=true) */
/** @screen FDR-2-PAGE-04-0 폴더 상세 (그리드/리스트 뷰, isRoot=false — 같은 화면 재사용) */
/** @screen FDR-2-MODAL-01-0 새 폴더 생성 (activeDialog='newFolder') */
/** @screen FDR-3-MODAL-01-0 폴더 이름 변경 (activeDialog='rename') */
/** @screen FDR-3-MODAL-02-0 폴더 해제 (activeDialog='unlink') */
/** @screen FDR-3-MODAL-05-0 새 폴더 생성 (FDR-2-MODAL-01-0과 동일 activeDialog='newFolder' — IA상 ID 중복으로 보임) */
/** @screen FDR-3-SNACKBAR-01-0 새 폴더 생성_완료 (SNACKBAR_FOLDER_CREATED_SUFFIX) */
/** @screen FDR-4-SNACKBAR-01-0 이동 완료 / 폴더 해제_완료 (여기는 폴더 해제_완료 절반. 이동 완료는
 * FolderMoveDestinationScreen.tsx) */
/** @screen FDR-4-SNACKBAR-03-0 이름 변경_완료 (activeDialog='rename' 확인 시 SNACKBAR_FOLDER_RENAMED) */
/**
 * 3-B(API 연동, 쓰기) 메모 — 0-1 폴더 해제 판단: 최상위 폴더를 해제하면 그 직속
 * 장부가 `folderId: null`이 되는데, 최상위 장부 조회 API가 없어(docs/api-gaps.md
 * (C)) 다시 찾을 방법이 없다. 최상위가 아닌 폴더는 해제해도 내부 항목이 상위
 * 폴더(조회 가능한 폴더)로 승격되므로 안전하다 — 그래서 "최상위 + 직속 장부 있음"
 * 조합만 막는다(`isUnlinkUnsafe`). 백업(archive) 기능은 서버 상태가 "시작 전"이라
 * (`api-gaps.md` (B) 미준비) 이번에도 실제 API를 안 붙이고 로컬 스낵바 스텁을 유지한다.
 */
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import AppBar from '../../components/Navigation/App bar/AppBar';
import IconButton from '../../components/Input/Button/IconButton';
import SearchField from '../../components/Input/Search/SearchField';
import FolderItem from '../../components/Data Display/Folder/FolderItem';
import Button from '../../components/Input/Button/Button';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderMoreMenu from './FolderMoreMenu';
import NewItemSheet from './NewItemSheet';
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import { getActiveGroup } from '../../types/group';
import { getChildFolders, findFolderNode, mergeFolderListItems } from '../../utils/folderTree';
import type { FolderListItem } from '../../utils/folderTree';
import type { FolderNode } from '../../types/folderTree';
import * as folderService from '../../services/folderService';
import * as ledgerService from '../../services/ledgerService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  BACKUP_CONFIRM_LABEL,
  BACKUP_DIALOG_DESCRIPTION,
  BACKUP_DIALOG_TITLE,
  BACKUP_TITLE_PLACEHOLDER,
  FOLDER_EMPTY_SUBTITLE,
  FOLDER_EMPTY_TITLE,
  FOLDER_LOADING,
  FOLDER_MENU_BACKUP,
  FOLDER_MENU_BUDGET_LIST,
  FOLDER_MENU_RENAME,
  FOLDER_MENU_SELECT_MOVE,
  FOLDER_MENU_UNLINK,
  FOLDER_MENU_VIEW_TOGGLE,
  FOLDER_NAME_MAX_LENGTH,
  FOLDER_RETRY_LABEL,
  FOLDER_SCREEN_TITLE,
  FOLDER_SEARCH_EMPTY_SUBTITLE,
  FOLDER_SEARCH_EMPTY_TITLE,
  FOLDER_SEARCH_PLACEHOLDER,
  LEDGER_ITEM_BUDGET_UNSET,
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
  UNLINK_BLOCKED_CONFIRM_LABEL,
  UNLINK_BLOCKED_DIALOG_DESCRIPTION,
  UNLINK_BLOCKED_DIALOG_TITLE,
  UNLINK_CONFIRM_LABEL,
  UNLINK_FOLDER_DIALOG_DESCRIPTION,
  UNLINK_FOLDER_DIALOG_TITLE,
  VIEW_TOGGLE_GRID_LABEL,
  VIEW_TOGGLE_LIST_LABEL,
} from '../../constants/folderScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const MENU_ICON = require('../../assets/icons/action/MenuHorizontal.png');
const PLUS_ICON = require('../../assets/icons/action/Plus.png');

const GRID_COLUMNS = 3;
const SNACKBAR_AUTO_HIDE_MS = 1600;

type FolderScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<FolderTabParamList, 'FolderList'>,
  NativeStackNavigationProp<RootStackParamList>
>;
type FolderScreenRouteProp = RouteProp<FolderTabParamList, 'FolderList'>;

type ActiveDialog =
  | 'newFolder'
  | 'rename'
  | 'unlink'
  | 'unlinkBlocked'
  | 'backup'
  | null;
type MenuMode = 'main' | 'viewToggle';
type LoadState = 'loading' | 'error' | 'ready';

/** 폴더 메인/하위 폴더 공용 화면. params가 없으면 폴더 탭 최상위, 있으면 해당 폴더 내부다. */
function FolderScreen() {
  const navigation = useNavigation<FolderScreenNavigationProp>();
  const route = useRoute<FolderScreenRouteProp>();
  const folderId = route.params?.folderId ?? null;
  const folderName = route.params?.folderName;
  const isRoot = folderId === null;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [tree, setTree] = useState<FolderNode[]>([]);
  const [items, setItems] = useState<FolderListItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [menuMode, setMenuMode] = useState<MenuMode>('main');
  const [newItemSheetVisible, setNewItemSheetVisible] = useState(false);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [dialogInputValue, setDialogInputValue] = useState('');
  const [dialogError, setDialogError] = useState<string | undefined>();
  const [isSubmittingDialog, setIsSubmittingDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    title: string;
    description?: string;
  } | null>(null);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const loadItems = useCallback(async () => {
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    setLoadState('loading');
    try {
      // 폴더 트리는 모임 전체를 한 번에 내려주므로 화면 깊이와 무관하게 호출 1번.
      // 장부는 현재 폴더 직속분만 별도 조회(최상위엔 그 조회 API 자체가 없다 —
      // docs/api-gaps.md (C) "최상위 영역 장부 조회").
      const [nextTree, ledgers] = await Promise.all([
        folderService.getFolderTree(group.id),
        folderId ? ledgerService.getLedgersInFolder(folderId) : Promise.resolve([]),
      ]);
      setTree(nextTree);
      const childFolders = getChildFolders(nextTree, folderId);
      setItems(mergeFolderListItems(childFolders, ledgers));
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [folderId]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems]),
  );

  const filteredItems = searchQuery.trim()
    ? items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : items;

  const closeMoreMenu = () => {
    setMoreMenuVisible(false);
    setMenuMode('main');
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setDialogInputValue('');
    setDialogError(undefined);
  };

  const showSnackbar = (title: string, description?: string) => {
    setSnackbar({ title, description });
    setTimeout(() => setSnackbar(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const handlePressItem = (item: FolderListItem) => {
    if (item.kind === 'folder') {
      navigation.push('FolderList', { folderId: item.id, folderName: item.name });
    } else {
      navigation.navigate('LedgerDetail', { ledgerId: item.id });
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

  /** 0-1: 최상위 폴더(자신의 parentId가 null) + 직속 장부가 있으면 해제 후 그 장부를
   * 다시 찾을 방법이 없다 — 현재 폴더 화면에서 이미 불러온 tree/items로만 판단한다
   * (추가 API 호출 없음). */
  const currentFolderNode = folderId ? findFolderNode(tree, folderId) : undefined;
  const currentFolderLedgerCount = items.filter(item => item.kind === 'ledger').length;
  const isUnlinkUnsafe =
    currentFolderNode?.parentId === null && currentFolderLedgerCount > 0;

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
        setActiveDialog(isUnlinkUnsafe ? 'unlinkBlocked' : 'unlink');
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

  const handleConfirmDialog = async () => {
    if (isSubmittingDialog) {
      return;
    }
    const group = getActiveGroup();

    if (activeDialog === 'newFolder') {
      const trimmed = dialogInputValue.trim();
      if (!trimmed || !group) {
        return;
      }
      setIsSubmittingDialog(true);
      try {
        await folderService.createFolder(group.id, trimmed, folderId);
        closeDialog();
        showSnackbar(`'${trimmed}'${SNACKBAR_FOLDER_CREATED_SUFFIX}`);
        loadItems();
      } catch (error) {
        setDialogError(fieldOrGeneralError(error, 'name'));
      } finally {
        setIsSubmittingDialog(false);
      }
    } else if (activeDialog === 'rename') {
      const trimmed = dialogInputValue.trim();
      if (!trimmed || !folderId) {
        return;
      }
      setIsSubmittingDialog(true);
      try {
        await folderService.updateFolder(folderId, { name: trimmed });
        closeDialog();
        showSnackbar(SNACKBAR_FOLDER_RENAMED);
        navigation.setParams({ folderId, folderName: trimmed });
        loadItems();
      } catch (error) {
        setDialogError(fieldOrGeneralError(error, 'name'));
      } finally {
        setIsSubmittingDialog(false);
      }
    } else if (activeDialog === 'unlink') {
      if (!folderId) {
        return;
      }
      const name = folderName ?? '';
      setIsSubmittingDialog(true);
      try {
        await folderService.deleteFolder(folderId);
        closeDialog();
        showSnackbar(`'${name}'${SNACKBAR_FOLDER_UNLINKED_SUFFIX}`);
        setTimeout(() => navigation.goBack(), SNACKBAR_AUTO_HIDE_MS);
      } catch (error) {
        closeDialog();
        showSnackbar(toErrorMessage(error));
      } finally {
        setIsSubmittingDialog(false);
      }
    } else if (activeDialog === 'unlinkBlocked') {
      closeDialog();
    } else if (activeDialog === 'backup') {
      closeDialog();
      showSnackbar(SNACKBAR_BACKUP_DONE_TITLE, SNACKBAR_BACKUP_DONE_DESCRIPTION);
    }
  };

  const fieldOrGeneralError = (error: unknown, field: string): string => {
    if (error instanceof ApiError) {
      const fieldError = error.fieldErrors.find(fe => fe.field === field);
      return fieldError?.reason ?? getApiErrorMessage(error.code);
    }
    return toErrorMessage(error);
  };

  const dialogConfig = getDialogConfig(activeDialog);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        type={isRoot ? 'titleOnly' : 'sub'}
        title={isRoot ? FOLDER_SCREEN_TITLE : folderName ?? ''}
        onBackPress={() => navigation.goBack()}
        rightIcons={[
          { icon: MENU_ICON, onPress: () => setMoreMenuVisible(true) },
        ]}
      />

      <View style={styles.body}>
        <View style={styles.searchWrapper}>
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={FOLDER_SEARCH_PLACEHOLDER}
          />
        </View>

        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{FOLDER_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button label={FOLDER_RETRY_LABEL} onPress={loadItems} hierarchy="secondary" />
          </View>
        )}

        {loadState === 'ready' && (
          <>
            <View style={styles.countRow}>
              <Text style={styles.countText}>{filteredItems.length} 건</Text>
              <IconButton
                icon={PLUS_ICON}
                onPress={() => setNewItemSheetVisible(true)}
              />
            </View>

            {filteredItems.length === 0 ? (
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
                data={filteredItems}
                keyExtractor={item => item.id}
                numColumns={viewMode === 'grid' ? GRID_COLUMNS : 1}
                columnWrapperStyle={
                  viewMode === 'grid' ? styles.gridRow : undefined
                }
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <FolderItem
                    kind={item.kind}
                    name={item.name}
                    subtitle={getItemSubtitle(item)}
                    layout={viewMode}
                    hasItems={
                      item.kind === 'folder' ? item.itemCount > 0 : undefined
                    }
                    onPress={() => handlePressItem(item)}
                  />
                )}
              />
            )}
          </>
        )}
      </View>

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
        showLedgerOption={!isRoot}
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
        onChangeTextField={text => {
          setDialogInputValue(text);
          setDialogError(undefined);
        }}
        textFieldPlaceholder={dialogConfig.placeholder}
        textFieldMaxLength={dialogConfig.showTextField ? FOLDER_NAME_MAX_LENGTH : undefined}
        textFieldError={dialogError}
        confirmLabel={dialogConfig.confirmLabel}
        singleButton={activeDialog === 'unlinkBlocked'}
        destructive={activeDialog === 'unlink'}
        confirmDisabled={isSubmittingDialog}
        onCancel={closeDialog}
        onConfirm={handleConfirmDialog}
      />
    </SafeAreaView>
  );
}

function getItemSubtitle(item: FolderListItem): string {
  if (item.kind === 'folder') {
    return `${item.itemCount}개의 항목`;
  }
  return item.budget != null
    ? `예산 ${item.budget.toLocaleString()}원`
    : LEDGER_ITEM_BUDGET_UNSET;
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
    case 'unlinkBlocked':
      return {
        title: UNLINK_BLOCKED_DIALOG_TITLE,
        description: UNLINK_BLOCKED_DIALOG_DESCRIPTION,
        showTextField: false,
        placeholder: undefined,
        confirmLabel: UNLINK_BLOCKED_CONFIRM_LABEL,
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
  },
  body: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 24,
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
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  listContent: {
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
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
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default FolderScreen;
