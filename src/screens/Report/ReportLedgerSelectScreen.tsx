/** @screen ETC-5-PAGE-01-0 장부별 보고서 생성_장부 선택 */
/**
 * "장부" 선택하기에서 여는 폴더 트리 브라우저. `GET .../folder-items`
 * (`folderService.getFolderItems()`)로 폴더+장부를 한 그리드에 섞어 받는다
 * — 폴더를 누르면 그 폴더 안으로 뎁스인(FOLDER), 장부를 누르면 다중 선택
 * 토글(LEDGER)이라 `FolderSelectMoveScreen`(이동 대상 선택 — 거긴 폴더도
 * "선택" 대상이라 뎁스인이 없다)과는 인터랙션이 다르다.
 *
 * ⚠️ 뒤로가기 동작은 명세 표(No.1 액션)가 "선택된 내역을 파기하고 이전
 * 화면으로 복귀"라고만 적어 다단계 폴더 안에서의 동작이 명시돼 있지 않다
 * (시안 캡처에도 하위 폴더 진입 상태가 없다). 폴더 한 단계 들어간 뒤 뒤로
 * 가기를 누르면 화면 전체를 나가버리는 게 아니라 **한 단계만 위로
 * 올라가는 쪽으로 판단했다**(표준 폴더 탐색기 UX, `FolderScreen` 브레드크럼
 * 방식과 동일) — "선택 파기"는 최상위에서 뒤로가기를 눌러 화면 자체를
 * 나갈 때만 적용된다(그때는 확정 버튼을 안 눌렀으니 선택이 그냥 전달 안
 * 되는 것으로 자연히 파기됨). 판단 근거는 7-D 보고 참고.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import SearchField from '../../components/Input/Search/SearchField';
import FolderItem, {
  FOLDER_GRID_COLUMNS,
  FOLDER_GRID_COLUMN_GAP,
} from '../../components/Data Display/Folder/FolderItem';
import { getActiveGroup } from '../../types/group';
import * as folderService from '../../services/folderService';
import type { FolderItemEntry } from '../../services/folderService';
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
import { formatDateDot } from '../../utils/dueDate';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  REPORT_LEDGER_SELECT_CONFIRM_SUFFIX,
  REPORT_LEDGER_SELECT_COUNT_SUFFIX,
  REPORT_LEDGER_SELECT_EMPTY,
  REPORT_LEDGER_SELECT_ITEM_COUNT_SUFFIX,
  REPORT_LEDGER_SELECT_LOADING,
  REPORT_LEDGER_SELECT_RETRY_LABEL,
  REPORT_LEDGER_SELECT_SEARCH_PLACEHOLDER,
  REPORT_LEDGER_SELECT_TITLE,
} from '../../constants/reportScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SEARCH_DEBOUNCE_MS = 300;

type LoadState = 'loading' | 'error' | 'ready';
type ReportLedgerSelectNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReportLedgerSelectRouteProp = RouteProp<RootStackParamList, 'ReportLedgerSelect'>;
type FolderStackEntry = { id: string; name: string };

function getItemSubtitle(item: FolderItemEntry): string {
  if (item.itemType === 'FOLDER') {
    return `${item.childCount ?? 0}${REPORT_LEDGER_SELECT_ITEM_COUNT_SUFFIX}`;
  }
  return formatDateDot(item.createdAt);
}

function ReportLedgerSelectScreen() {
  const navigation = useNavigation<ReportLedgerSelectNavigationProp>();
  const route = useRoute<ReportLedgerSelectRouteProp>();

  const [folderStack, setFolderStack] = useState<FolderStackEntry[]>([]);
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState<FolderItemEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [selected, setSelected] = useState<Map<string, string>>(
    () => new Map(route.params.selectedLedgers.map(l => [l.id, l.name])),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentFolderId = folderStack[folderStack.length - 1]?.id;

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async (folderId: string | undefined, searchKeyword: string) => {
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
      const result = await folderService.getFolderItems(group.id, {
        folderId,
        keyword: searchKeyword || undefined,
      });
      setItems(result.items);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(currentFolderId, keyword);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, currentFolderId]),
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      load(currentFolderId, keyword);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const handleBack = () => {
    if (folderStack.length > 0) {
      setFolderStack(current => current.slice(0, -1));
      setKeyword('');
    } else {
      navigation.goBack();
    }
  };

  const handlePressItem = (item: FolderItemEntry) => {
    if (item.itemType === 'FOLDER') {
      setFolderStack(current => [...current, { id: item.id, name: item.name }]);
      setKeyword('');
      return;
    }
    setSelected(current => {
      const next = new Map(current);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, item.name);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    navigation.popTo('ReportCreateByLedger', {
      selectedLedgers: Array.from(selected, ([id, name]) => ({ id, name })),
    });
  };

  return (
    <ScreenContainer background="secondary">
      <AppBar type="sub" title={REPORT_LEDGER_SELECT_TITLE} onBackPress={handleBack} />

      <View style={styles.body}>
        <SearchField
          value={keyword}
          onChangeText={setKeyword}
          placeholder={REPORT_LEDGER_SELECT_SEARCH_PLACEHOLDER}
          variant="outline"
        />

        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{REPORT_LEDGER_SELECT_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button
              label={REPORT_LEDGER_SELECT_RETRY_LABEL}
              onPress={() => load(currentFolderId, keyword)}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          </View>
        )}

        {loadState === 'ready' && (
          <>
            <Text style={styles.countText}>
              {items.length}
              {REPORT_LEDGER_SELECT_COUNT_SUFFIX}
            </Text>

            {items.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{REPORT_LEDGER_SELECT_EMPTY}</Text>
              </View>
            ) : (
              <FlatList
                data={items}
                keyExtractor={item => `${item.itemType}-${item.id}`}
                numColumns={FOLDER_GRID_COLUMNS}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <FolderItem
                    kind={item.itemType === 'FOLDER' ? 'folder' : 'ledger'}
                    name={item.name}
                    subtitle={getItemSubtitle(item)}
                    layout="grid"
                    hasItems={item.itemType === 'FOLDER' ? (item.childCount ?? 0) > 0 : undefined}
                    selected={item.itemType === 'LEDGER' && selected.has(item.id)}
                    onPress={() => handlePressItem(item)}
                  />
                )}
              />
            )}

            <View style={styles.footer}>
              <Button
                label={`${selected.size}${REPORT_LEDGER_SELECT_CONFIRM_SUFFIX}`}
                disabled={selected.size === 0}
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
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 8,
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
  emptyText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  countText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  listContent: {
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'flex-start',
    gap: FOLDER_GRID_COLUMN_GAP,
  },
  footer: {
    paddingVertical: 16,
  },
});

export default ReportLedgerSelectScreen;
