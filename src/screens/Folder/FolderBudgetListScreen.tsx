import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import TextField from '../../components/Input/Text Field/TextField';
import Button from '../../components/Input/Button/Button';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderItem from '../../components/Data Display/Folder/FolderItem';
import {
  getAllLedgerNodes,
  setLedgerBudget,
  type LedgerNode,
} from '../../types/folder';
import {
  BUDGET_LIST_EMPTY_SUBTITLE,
  BUDGET_LIST_EMPTY_TITLE,
  BUDGET_LIST_TITLE,
  BUDGET_SAVE_LABEL,
  BUDGET_SHEET_PLACEHOLDER,
  SNACKBAR_BUDGET_SAVED,
} from '../../constants/folderScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type FolderBudgetListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FolderBudgetList'
>;

function getBudgetSubtitle(ledger: LedgerNode): string {
  return ledger.budget != null
    ? `예산 ${ledger.budget.toLocaleString()}원`
    : '예산 미설정';
}

/** 폴더 탭 최상위 ⋮ 메뉴의 "전체 예산 설정": 트리 전체 장부를 나열하고 예산을 설정한다. */
function FolderBudgetListScreen() {
  const navigation = useNavigation<FolderBudgetListNavigationProp>();

  const [ledgers, setLedgers] = useState<LedgerNode[]>(() =>
    getAllLedgerNodes(),
  );
  const [editingLedger, setEditingLedger] = useState<LedgerNode | null>(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const refresh = useCallback(() => {
    setLedgers(getAllLedgerNodes());
  }, []);

  useFocusEffect(refresh);

  const handlePressLedger = (ledger: LedgerNode) => {
    setEditingLedger(ledger);
    setBudgetInput(ledger.budget != null ? String(ledger.budget) : '');
  };

  const handleSave = () => {
    if (!editingLedger || !budgetInput.trim()) {
      return;
    }
    setLedgerBudget(editingLedger.id, Number(budgetInput.trim()));
    setEditingLedger(null);
    refresh();
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), SNACKBAR_AUTO_HIDE_MS);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>{BUDGET_LIST_TITLE}</Text>
      </View>

      {ledgers.length === 0 ? (
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
      )}

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
          onChangeText={text => setBudgetInput(text.replace(/[^0-9]/g, ''))}
          placeholder={BUDGET_SHEET_PLACEHOLDER}
          keyboardType="number-pad"
        />
        <Button
          label={BUDGET_SAVE_LABEL}
          disabled={!budgetInput.trim()}
          onPress={handleSave}
          fullWidth
        />
      </BottomSheet>
    </View>
  );
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
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
