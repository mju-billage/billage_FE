/** @screen FDR-2-PAGE-02-0 전체 예산 설정 목록 */
/** @screen FDR-3-SHEET-01-0 장부 예산 입력 (아래 BottomSheet+TextField, FDR-3-SHEET-02-0과 동일 구현) */
/** @screen FDR-3-SHEET-02-0 예산 설정 (같은 BottomSheet — IA상 두 ID가 같은 시트를 가리키는 것으로 판단) */
/**
 * `GET /groups/{groupId}/ledgers`(평평한 전체 목록, 최상위 장부 포함)를
 * `ledgerService.getAllLedgersInGroup()`가 쓴다.
 */
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import SelectionListItem from '../../components/Data Display/Lists/SelectionListItem';
import ScreenContainer from '../../components/Layout/ScreenContainer';
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
  SNACKBAR_BUDGET_SAVED,
} from '../../constants/folderScreenText';
import { LEDGER_BUDGET_MAX } from '../../constants/ledgerScreenText';
import {
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
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

// 시안(폴더_메뉴_예산설정.png No.2): 예산 미설정 장부는 "0원"으로 노출(별도
// 안내 문구 아님).
function getBudgetValue(ledger: LedgerSummary): string {
  return `${(ledger.budget ?? 0).toLocaleString()}원`;
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
      // 시안 No.2 [상태]: "최신 생성된 장부순으로 리스트업" — 서버 응답 순서를
      // 신뢰하지 않고 createdAt 내림차순으로 직접 정렬한다.
      const sorted = [...result].sort((a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
      );
      setLedgers(sorted);
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

  // 시안(폴더_메뉴_예산설정.png)이 옅은 블루.
  return (
    <ScreenContainer
      background="primary"
      snackbar={
        snackbarVisible ? (
          <Snackbar visible title={SNACKBAR_BUDGET_SAVED} />
        ) : undefined
      }
    >
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
              <SelectionListItem
                type="picker"
                title={item.name}
                value={getBudgetValue(item)}
                onPress={() => handlePressLedger(item)}
              />
            )}
          />
        ))}

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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
});

export default FolderBudgetListScreen;
