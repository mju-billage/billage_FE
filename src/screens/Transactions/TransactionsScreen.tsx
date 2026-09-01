/** @screen DTB-1-PAGE-01-0 내역 메인 */
/** @screen ADD-2-SNACKBAR-01-0 내역 추가 완료 (design-verification.md는 TransactionRegisterScreen.tsx로 추정했으나
 * 실제로는 여기서 addedTransactionId 파라미터를 받아 표시함) */
import { useCallback, useEffect, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import IconButton from '../../components/Input/Button/IconButton';
import Tabs from '../../components/Navigation/Tabs/Tabs';
import type { TabItem } from '../../components/Navigation/Tabs/Tabs';
import AmountCard from '../../components/Data Display/Card/AmountCard';
import Chip from '../../components/Data Display/Chips/Chip';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import FloatingActionButton from '../../components/Input/Button/FAB';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import TransactionFilterSheet from './TransactionFilterSheet';
import {
  applyTransactionFilter,
  DEFAULT_TRANSACTION_FILTER,
  getTransactionLedgerOptions,
  groupTransactionsByDate,
  type Transaction,
  type TransactionFilterValue,
} from '../../types/transaction';
import {
  FILTER_TYPE_EXPENSE,
  FILTER_TYPE_INCOME,
} from '../../constants/ledgerScreenText';
import { CALENDAR_WEEKDAY_LABELS } from '../../constants/calendarScreenText';
import {
  SNACKBAR_TRANSACTION_ADDED,
  TRANSACTIONS_COUNT_SUFFIX,
  TRANSACTIONS_EMPTY,
  TRANSACTIONS_TAB_ALL,
  TRANSACTIONS_TAB_PENDING,
  TRANSACTIONS_TITLE,
} from '../../constants/transactionScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const FILTER_ICON = require('../../assets/icons/system/Filter.png');
const SEARCH_ICON = require('../../assets/icons/system/Search.png');

type TransactionsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Transactions'>,
  NativeStackNavigationProp<RootStackParamList>
>;
type TransactionsScreenRouteProp = RouteProp<MainTabParamList, 'Transactions'>;

const SNACKBAR_AUTO_HIDE_MS = 1600;

type TransactionsTab = 'all' | 'pending';

const TABS: TabItem<TransactionsTab>[] = [
  { label: TRANSACTIONS_TAB_ALL, value: 'all' },
  { label: TRANSACTIONS_TAB_PENDING, value: 'pending' },
];

/** 'YYYY.MM.DD' -> 'M월 D일 요일'. */
function formatDateHeader(date: string): string {
  const [year, month, day] = date.split('.').map(Number);
  const jsDate = new Date(year, month - 1, day);
  return `${month}월 ${day}일 ${CALENDAR_WEEKDAY_LABELS[jsDate.getDay()]}요일`;
}

type FilterChipInfo = { key: string; label: string };

function getFilterChips(filter: TransactionFilterValue): FilterChipInfo[] {
  const chips: FilterChipInfo[] = [];
  if (filter.type === 'income') {
    chips.push({ key: 'type', label: FILTER_TYPE_INCOME });
  } else if (filter.type === 'expense') {
    chips.push({ key: 'type', label: FILTER_TYPE_EXPENSE });
  }
  const ledgerOptions = getTransactionLedgerOptions();
  for (const id of filter.ledgerIds) {
    const option = ledgerOptions.find(item => item.id === id);
    if (option) {
      chips.push({ key: `ledger-${id}`, label: option.name });
    }
  }
  return chips;
}

/** 내역 메인 화면: 전체 내역/승인요청 탭, 요약 카드, 날짜별 거래 목록을 보여준다. */
function TransactionsScreen() {
  const navigation = useNavigation<TransactionsScreenNavigationProp>();
  const route = useRoute<TransactionsScreenRouteProp>();
  const [tab, setTab] = useState<TransactionsTab>('all');
  const [filter, setFilter] = useState<TransactionFilterValue>(
    DEFAULT_TRANSACTION_FILTER,
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const refresh = useCallback(() => {
    setTransactions(applyTransactionFilter(filter));
  }, [filter]);

  useFocusEffect(refresh);

  useEffect(() => {
    if (route.params?.addedTransactionId) {
      setSnackbarVisible(true);
      navigation.setParams({ addedTransactionId: undefined });
    }
  }, [route.params?.addedTransactionId, navigation]);

  useEffect(() => {
    if (!snackbarVisible) {
      return;
    }
    const timer = setTimeout(
      () => setSnackbarVisible(false),
      SNACKBAR_AUTO_HIDE_MS,
    );
    return () => clearTimeout(timer);
  }, [snackbarVisible]);

  const visibleTransactions =
    tab === 'pending'
      ? transactions.filter(tx => tx.isPendingApproval)
      : transactions;

  const income = transactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const sections = groupTransactionsByDate(visibleTransactions).map(
    group => ({
      title: formatDateHeader(group.date),
      data: group.items,
    }),
  );

  const filterChips = getFilterChips(filter);

  const handlePressTransaction = (transaction: Transaction) => {
    navigation.navigate('TransactionDetail', {
      transactionId: transaction.id,
    });
  };

  const removeFilterChip = (key: string) => {
    if (key === 'type') {
      setFilter({ ...filter, type: 'all' });
    } else if (key.startsWith('ledger-')) {
      const ledgerId = key.slice('ledger-'.length);
      setFilter({
        ...filter,
        ledgerIds: filter.ledgerIds.filter(id => id !== ledgerId),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar type="titleOnly" title={TRANSACTIONS_TITLE} />

      <View style={styles.body}>
        <AmountCard type="incomeExpense" income={income} expense={expense} />

        <View style={styles.tabRow}>
          <Tabs items={TABS} value={tab} onChange={setTab} showIcon={false} />
        </View>

        <View style={styles.actionRow}>
          <View style={styles.iconRow}>
            <IconButton
              icon={FILTER_ICON}
              onPress={() => setFilterSheetVisible(true)}
            />
            <IconButton
              icon={SEARCH_ICON}
              onPress={() => navigation.navigate('TransactionSearch')}
            />
          </View>
        </View>

        {filterChips.length > 0 && (
          <View style={styles.chipRow}>
            {filterChips.map(chip => (
              <Chip
                key={chip.key}
                label={chip.label}
                onRemove={() => removeFilterChip(chip.key)}
              />
            ))}
          </View>
        )}

        <Text style={styles.countText}>
          {visibleTransactions.length}
          {TRANSACTIONS_COUNT_SUFFIX}
        </Text>

        {visibleTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{TRANSACTIONS_EMPTY}</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <TransactionListItem
                label={item.ledgerName}
                itemName={item.itemName}
                amount={item.amount}
                hasReceipt={item.hasReceipt}
                isPendingApproval={item.isPendingApproval}
                onPress={() => handlePressTransaction(item)}
              />
            )}
          />
        )}
      </View>

      {snackbarVisible && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={SNACKBAR_TRANSACTION_ADDED} />
        </View>
      )}

      <FloatingActionButton
        onPress={() => navigation.navigate('TransactionRegister', {})}
      />

      <TransactionFilterSheet
        visible={filterSheetVisible}
        value={filter}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setFilter}
        onPressCreateNewLedger={() =>
          navigation.navigate('LedgerCreate', { parentId: null })
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  tabRow: {
    marginTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  countText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 96,
  },
  // 12px+Bold 조합은 정식 스타일에 없어 body3+bold를 예외로 채택.
  sectionHeader: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle3,
  },
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default TransactionsScreen;
