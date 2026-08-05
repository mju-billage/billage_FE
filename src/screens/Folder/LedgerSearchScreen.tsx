import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/BackButton';
import SearchField from '../../components/Field/SearchField';
import TextButton from '../../components/Button/TextButton';
import {
  getTransactionsByLedgerId,
  type LedgerTransaction,
} from '../../types/folder';
import LedgerFilterSheet, {
  DEFAULT_LEDGER_FILTER,
  type LedgerFilterValue,
} from './LedgerFilterSheet';
import {
  LEDGER_SEARCH_EMPTY,
  LEDGER_SEARCH_PLACEHOLDER,
} from '../../constants/ledgerScreenText';
import {
  FEEDBACK_POSITIVE_BOLD,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';

const RECEIPT_ICON = require('../../assets/icons/content/Bill.png');
const FILTER_LABEL = '필터';
const PERIOD_MONTHS: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6 };

type LedgerSearchNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LedgerSearch'
>;
type LedgerSearchRouteProp = RouteProp<RootStackParamList, 'LedgerSearch'>;

function monthsAgoDateKey(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

function applyFilter(
  transactions: LedgerTransaction[],
  filter: LedgerFilterValue,
): LedgerTransaction[] {
  let result = transactions;

  if (filter.type !== 'all') {
    result = result.filter(tx =>
      filter.type === 'income' ? tx.amount > 0 : tx.amount < 0,
    );
  }

  if (filter.period !== 'all') {
    if (filter.period === 'custom') {
      if (filter.customStart) {
        result = result.filter(tx => tx.date >= filter.customStart!);
      }
      if (filter.customEnd) {
        result = result.filter(tx => tx.date <= filter.customEnd!);
      }
    } else {
      const cutoff = monthsAgoDateKey(PERIOD_MONTHS[filter.period]);
      result = result.filter(tx => tx.date >= cutoff);
    }
  }

  result = [...result].sort((a, b) =>
    filter.sort === 'latest'
      ? a.date < b.date
        ? 1
        : -1
      : a.date > b.date
      ? 1
      : -1,
  );

  return result;
}

/** 장부 상세에서 진입하는 내역 검색 화면: 이름 검색 + 필터 시트. */
function LedgerSearchScreen() {
  const navigation = useNavigation<LedgerSearchNavigationProp>();
  const route = useRoute<LedgerSearchRouteProp>();
  const ledgerId = route.params.ledgerId;

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LedgerFilterValue>(
    DEFAULT_LEDGER_FILTER,
  );
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const allTransactions = useMemo(
    () => getTransactionsByLedgerId(ledgerId),
    [ledgerId],
  );

  const results = useMemo(() => {
    const filtered = applyFilter(allTransactions, filter);
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return filtered;
    }
    return filtered.filter(
      tx =>
        tx.itemName.toLowerCase().includes(trimmed) ||
        tx.ledgerName.toLowerCase().includes(trimmed),
    );
  }, [allTransactions, filter, query]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.searchWrapper}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={LEDGER_SEARCH_PLACEHOLDER}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        <TextButton
          label={FILTER_LABEL}
          hierarchy="tertiary"
          onPress={() => setFilterSheetVisible(true)}
        />
      </View>

      {results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{LEDGER_SEARCH_EMPTY}</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.txRow}
              onPress={() =>
                navigation.navigate('TransactionDetail', {
                  transactionId: item.id,
                })
              }
            >
              <View style={styles.txLeft}>
                <Text style={styles.txDate}>{item.date}</Text>
                <Text style={styles.txName} numberOfLines={1}>
                  {item.itemName}
                </Text>
              </View>
              <View style={styles.txRight}>
                {item.receiptImages.length > 0 && (
                  <Image source={RECEIPT_ICON} style={styles.receiptIcon} />
                )}
                <Text
                  style={[
                    styles.txAmount,
                    item.amount > 0 && styles.txAmountPositive,
                  ]}
                >
                  {item.amount > 0 ? '+' : ''}
                  {item.amount.toLocaleString()}원
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      <LedgerFilterSheet
        visible={filterSheetVisible}
        value={filter}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setFilter}
      />
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
    marginBottom: 12,
  },
  searchWrapper: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txLeft: {
    flex: 1,
    gap: 4,
  },
  txDate: {
    fontSize: 12,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  txName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  txRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptIcon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  txAmountPositive: {
    color: FEEDBACK_POSITIVE_BOLD,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default LedgerSearchScreen;
