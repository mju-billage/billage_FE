/** @screen FDR-2-PAGE-01-0 이동 대상 선택 */
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import FolderItem from '../../components/Data Display/Folder/FolderItem';
import { getActiveGroup } from '../../types/group';
import { getChildFolders, mergeFolderListItems } from '../../utils/folderTree';
import type { FolderListItem } from '../../utils/folderTree';
import * as folderService from '../../services/folderService';
import * as ledgerService from '../../services/ledgerService';
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  FOLDER_EMPTY_SUBTITLE,
  LEDGER_ITEM_BUDGET_UNSET,
  SELECT_MOVE_CONFIRM_LABEL,
  SELECT_MOVE_CONFIRM_SUFFIX,
  SELECT_MOVE_EMPTY_TITLE,
  SELECT_MOVE_LOADING,
  SELECT_MOVE_RETRY_LABEL,
  SELECT_MOVE_TITLE,
} from '../../constants/folderScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

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
  return item.budget != null
    ? `예산 ${item.budget.toLocaleString()}원`
    : LEDGER_ITEM_BUDGET_UNSET;
}

/** 폴더 최상위/하위에서 "선택 이동"으로 진입: 이동시킬 폴더/장부를 다중 선택한다. */
function FolderSelectMoveScreen() {
  const navigation = useNavigation<FolderSelectMoveNavigationProp>();
  const route = useRoute<FolderSelectMoveRouteProp>();
  const folderId = route.params.folderId;

  const [items, setItems] = useState<FolderListItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [selected, setSelected] = useState<{ id: string; kind: 'folder' | 'ledger'; name: string }[]>([]);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      let group = getActiveGroup();
      if (!group) {
        // [치명1] 같은 취약점 — "다시 시도"가 실제로 동작하도록 여기서 한 번
        // 더 직접 불러온다.
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      // 2026-09-13: FolderScreen과 같은 회귀가 여기도 있었다 — 최상위(folderId
      // null)에서 장부 조회를 빈 배열로 하드코딩해 최상위 장부를 이동 대상으로
      // 고를 수 없었다. 모임 전체 장부를 받아 최상위분만 걸러 쓴다.
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

  return (
    <ScreenContainer background="secondary">
      <AppBar title={SELECT_MOVE_TITLE} onBackPress={() => navigation.goBack()} />

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
                data={items}
                keyExtractor={item => `${item.kind}-${item.id}`}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <FolderItem
                    kind={item.kind}
                    name={item.name}
                    subtitle={getItemSubtitle(item)}
                    layout="list"
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 24,
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
