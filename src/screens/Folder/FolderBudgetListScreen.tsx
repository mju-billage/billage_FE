/** @screen FDR-2-PAGE-02-0 전체 예산 설정 목록 */
/** @screen FDR-3-SHEET-01-0 장부 예산 입력 (아래 BottomSheet+TextField, FDR-3-SHEET-02-0과 동일 구현) */
/** @screen FDR-3-SHEET-02-0 예산 설정 (같은 BottomSheet — IA상 두 ID가 같은 시트를 가리키는 것으로 판단) */
/**
 * "모임 전체 장부 목록" API가 없어(docs/api-gaps.md (A), 3-A에서 실측 확인)
 * `ledgerService.getAllLedgersInGroup()`가 폴더 트리 조회 1콜 + 폴더 개수만큼 장부
 * 목록 조회를 병렬로 묶는다 — 이 화면이 유일하게 그 N+1 비용을 그대로 치른다.
 * 최상위(폴더 없음) 장부는 조회 API 자체가 없어 이 목록에서 빠진다.
 */
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderItem from '../../components/Data Display/Folder/FolderItem';
import type { LedgerSummary } from '../../types/ledger';
import { getActiveGroup } from '../../types/group';
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
  BUDGET_LIST_EMPTY_SUBTITLE,
  BUDGET_LIST_EMPTY_TITLE,
  BUDGET_LIST_LOADING,
  BUDGET_LIST_RETRY_LABEL,
  BUDGET_LIST_TITLE,
  BUDGET_SAVE_LABEL,
  BUDGET_SHEET_PLACEHOLDER,
  LEDGER_ITEM_BUDGET_UNSET,
  SNACKBAR_BUDGET_SAVED,
} from '../../constants/folderScreenText';
import { LEDGER_BUDGET_MAX } from '../../constants/ledgerScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SNACKBAR_AUTO_HIDE_MS = 1600;

/** 숫자만 남기고 999,999,999(Ledger.txt 예산 상한)를 넘지 않게 자른다. */
function clampBudgetInput(text: string): string {
  const digitsOnly = text.replace(/[^0-9]/g, '');
  if (!digitsOnly) {
    return '';
  }
  return Number(digitsOnly) > LEDGER_BUDGET_MAX
    ? String(LEDGER_BUDGET_MAX)
    : digitsOnly;
}

type FolderBudgetListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FolderBudgetList'
>;
type LoadState = 'loading' | 'error' | 'ready';

function getBudgetSubtitle(ledger: LedgerSummary): string {
  return ledger.budget != null
    ? `예산 ${ledger.budget.toLocaleString()}원`
    : LEDGER_ITEM_BUDGET_UNSET;
}

/** 폴더 탭 최상위 ⋮ 메뉴의 "전체 예산 설정": 모임 전체 장부를 나열한다(읽기 전용). */
function FolderBudgetListScreen() {
  const navigation = useNavigation<FolderBudgetListNavigationProp>();

  const [ledgers, setLedgers] = useState<LedgerSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [editingLedger, setEditingLedger] = useState<LedgerSummary | null>(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetError, setBudgetError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

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
        // [치명1] 로그인 직후 첫 포커스처럼 모임 캐시가 아직 없는 순간 대비 —
        // "다시 시도"가 실제로 동작하도록 여기서 한 번 더 직접 불러온다.
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const result = await ledgerService.getAllLedgersInGroup(group.id);
      setLedgers(result);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handlePressLedger = (ledger: LedgerSummary) => {
    setEditingLedger(ledger);
    setBudgetInput(ledger.budget != null ? String(ledger.budget) : '');
    setBudgetError(undefined);
  };

  const handleSave = async () => {
    if (!editingLedger || !budgetInput.trim() || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await ledgerService.updateLedgerBudget(editingLedger.id, Number(budgetInput.trim()));
      setEditingLedger(null);
      load();
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), SNACKBAR_AUTO_HIDE_MS);
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldError = error.fieldErrors.find(fe => fe.field === 'budget');
        setBudgetError(fieldError?.reason ?? getApiErrorMessage(error.code));
      } else {
        setBudgetError(toErrorMessage(error));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar title={BUDGET_LIST_TITLE} onBackPress={() => navigation.goBack()} />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{BUDGET_LIST_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{loadErrorMessage}</Text>
          <Button label={BUDGET_LIST_RETRY_LABEL} onPress={load} hierarchy="secondary" style={{ alignSelf: 'center' }} />
        </View>
      )}

      {loadState === 'ready' &&
        (ledgers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{BUDGET_LIST_EMPTY_TITLE}</Text>
            <Text style={styles.emptySubtitle}>{BUDGET_LIST_EMPTY_SUBTITLE}</Text>
          </View>
        ) : (
          <FlatList
            data={ledgers}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <FolderItem
                kind="ledger"
                name={item.name}
                subtitle={getBudgetSubtitle(item)}
                layout="list"
                onPress={() => handlePressLedger(item)}
              />
            )}
          />
        ))}

      {snackbarVisible && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={SNACKBAR_BUDGET_SAVED} />
        </View>
      )}

      <BottomSheet
        visible={editingLedger !== null}
        onClose={() => setEditingLedger(null)}
      >
        <Text style={styles.sheetTitle}>{editingLedger?.name}</Text>
        <TextField
          value={budgetInput}
          onChangeText={text => {
            setBudgetInput(clampBudgetInput(text));
            setBudgetError(undefined);
          }}
          placeholder={BUDGET_SHEET_PLACEHOLDER}
          keyboardType="number-pad"
          error={budgetError}
        />
        <Button
          label={BUDGET_SAVE_LABEL}
          disabled={!budgetInput.trim() || isSaving}
          onPress={handleSave}
          fullWidth
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
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
    paddingHorizontal: 24,
  },
  emptyTitle: {
    ...TYPOGRAPHY.subtitle3,
  },
  emptySubtitle: {
    marginTop: 6,
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  sheetTitle: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 16,
  },
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default FolderBudgetListScreen;
