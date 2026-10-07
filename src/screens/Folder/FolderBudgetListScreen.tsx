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

function getBudgetValue(ledger: LedgerSummary): string {
  return `${(ledger.budget ?? 0).toLocaleString()}원`;
}

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
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const result = await ledgerService.getAllLedgersInGroup(group.id);
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
