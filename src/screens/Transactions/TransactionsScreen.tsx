import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import IconButton from '../../components/Input/Button/IconButton';
import Button from '../../components/Input/Button/Button';
import Tabs from '../../components/Navigation/Tabs/Tabs';
import type { TabItem } from '../../components/Navigation/Tabs/Tabs';
import AmountCard from '../../components/Data Display/Card/AmountCard';
import Chip from '../../components/Data Display/Chips/Chip';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import FloatingActionButton from '../../components/Input/Button/FAB';
import { BOTTOM_NAVIGATION_HEIGHT } from '../../components/Navigation/Bottom Navigation/BottomNavigation';
import TransactionFilterSheet from './TransactionFilterSheet';
import type { EntryGroupSummary, EntrySummary } from '../../types/entry';
import {
  DEFAULT_ENTRY_LIST_FILTER,
  getEntryListFilterDateRange,
  groupEntriesByDate,
  type EntryListFilterValue,
} from '../../types/entry';
import { getActiveGroup } from '../../types/group';
import * as entryService from '../../services/entryService';
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
  FILTER_TYPE_EXPENSE,
  FILTER_TYPE_INCOME,
  LEDGER_ENTRIES_LOADING_MORE,
} from '../../constants/ledgerScreenText';
import { formatDateHeader } from '../../utils/dateHeader';
import {
  TRANSACTIONS_COUNT_SUFFIX,
  TRANSACTIONS_EMPTY,
  TRANSACTIONS_LOADING,
  TRANSACTIONS_RETRY_LABEL,
  TRANSACTIONS_TAB_ALL,
  TRANSACTIONS_TAB_PENDING,
  TRANSACTIONS_TITLE,
} from '../../constants/transactionScreenText';
import {
  BACKGROUND_PRIMARY,
  BACKGROUND_SECONDARY,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const FILTER_ICON = require('../../assets/icons/system/Filter.png');
const SEARCH_ICON = require('../../assets/icons/system/Search.png');

type TransactionsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Transactions'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const EMPTY_SUMMARY: EntryGroupSummary = { totalIncome: 0, totalExpense: 0, balance: 0 };

type TransactionsTab = 'all' | 'pending';
type LoadState = 'loading' | 'error' | 'ready';
type LedgerOption = { id: string; name: string };

const TABS: TabItem<TransactionsTab>[] = [
  { label: TRANSACTIONS_TAB_ALL, value: 'all' },
  { label: TRANSACTIONS_TAB_PENDING, value: 'pending' },
];

type FilterChipInfo = { key: string; label: string };

function getFilterChips(
  filter: EntryListFilterValue,
  ledgerOptions: LedgerOption[],
): FilterChipInfo[] {
  const chips: FilterChipInfo[] = [];
  if (filter.type === 'income') {
    chips.push({ key: 'type', label: FILTER_TYPE_INCOME });
  } else if (filter.type === 'expense') {
    chips.push({ key: 'type', label: FILTER_TYPE_EXPENSE });
  }
  for (const id of filter.ledgerIds) {
    const option = ledgerOptions.find(item => item.id === id);
    if (option) {
      chips.push({ key: `ledger-${id}`, label: option.name });
    }
  }
  return chips;
}

function TransactionsScreen() {
  const navigation = useNavigation<TransactionsScreenNavigationProp>();
  const [tab, setTab] = useState<TransactionsTab>('all');
  const [filter, setFilter] = useState<EntryListFilterValue>(
    DEFAULT_ENTRY_LIST_FILTER,
  );
  const [ledgerOptions, setLedgerOptions] = useState<LedgerOption[]>([]);
  const [summary, setSummary] = useState<EntryGroupSummary>(EMPTY_SUMMARY);
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [cardBlockHeight, setCardBlockHeight] = useState(0);
  const [controlsHeight, setControlsHeight] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const buildParams = useCallback(
    (pageToLoad: number): entryService.GroupEntryListParams => {
      const range = getEntryListFilterDateRange(filter);
      return {
        ledgerIds: filter.ledgerIds.length > 0 ? filter.ledgerIds : undefined,
        type:
          filter.type === 'income'
            ? 'INCOME'
            : filter.type === 'expense'
            ? 'EXPENSE'
            : undefined,
        status: tab === 'pending' ? 'PENDING' : undefined,
        from: range.from,
        to: range.to,
        sort: filter.sort === 'latest' ? 'occurredOn,desc' : 'occurredOn,asc',
        page: pageToLoad,
      };
    },
    [filter, tab],
  );

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
      const firstPage = await entryService.getGroupEntries(
        group.id,
        buildParams(0),
      );
      setSummary(firstPage.summary);
      setEntries(firstPage.items);
      setPage(firstPage.page);
      setHasMore(!firstPage.last);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [buildParams]);

  const loadLedgerOptions = useCallback(async () => {
    let group = getActiveGroup();
    if (!group) {
      await groupService.getMyGroups();
      group = getActiveGroup();
    }
    if (!group) {
      return;
    }
    try {
      const ledgers = await ledgerService.getAllLedgersInGroup(group.id);
      setLedgerOptions(ledgers.map(l => ({ id: l.id, name: l.name })));
    } catch {
    }
  }, []);

  const loadMoreEntries = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = await entryService.getGroupEntries(
        group.id,
        buildParams(page + 1),
      );
      setEntries(current => [...current, ...nextPage.items]);
      setPage(nextPage.page);
      setHasMore(!nextPage.last);
    } catch {
    } finally {
      setIsLoadingMore(false);
    }
  }, [buildParams, page, isLoadingMore, hasMore]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useFocusEffect(
    useCallback(() => {
      loadLedgerOptions();
    }, [loadLedgerOptions]),
  );

  const sections = groupEntriesByDate(entries).map(group => ({
    title: formatDateHeader(group.date),
    data: group.items,
  }));

  const filterChips = getFilterChips(filter, ledgerOptions);

  const showList = loadState === 'ready' && entries.length > 0;
  const listTopInset = cardBlockHeight + controlsHeight;
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, Math.max(cardBlockHeight, 1)],
    outputRange: [0, -cardBlockHeight],
    extrapolate: 'clamp',
  });
  const handleScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      }),
    [scrollY],
  );

  useEffect(() => {
    if (!showList) {
      scrollY.setValue(0);
    }
  }, [showList, scrollY]);

  const handlePressTransaction = (entry: EntrySummary) => {
    navigation.navigate('TransactionDetail', { transactionId: entry.id });
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
    <ScreenContainer background="primary" edges={['top']}>
      <AppBar type="titleOnly" title={TRANSACTIONS_TITLE} />

      <View style={styles.body}>
        <View style={styles.listArea}>
          {loadState === 'loading' && (
            <View style={[styles.stateContainer, { paddingTop: listTopInset + 40 }]}>
              <Text style={styles.stateText}>{TRANSACTIONS_LOADING}</Text>
            </View>
          )}

          {loadState === 'error' && (
            <View style={[styles.stateContainer, { paddingTop: listTopInset + 40 }]}>
              <Text style={styles.stateText}>{loadErrorMessage}</Text>
              <Button
                label={TRANSACTIONS_RETRY_LABEL}
                onPress={load}
                hierarchy="secondary"
                style={{ alignSelf: 'center' }}
              />
            </View>
          )}

          {loadState === 'ready' && entries.length === 0 && (
            <View style={[styles.emptyState, { paddingTop: listTopInset + 80 }]}>
              <Text style={styles.emptyText}>{TRANSACTIONS_EMPTY}</Text>
            </View>
          )}

          {showList && (
            <Animated.SectionList
              sections={sections}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onEndReachedThreshold={0.4}
              onEndReached={loadMoreEntries}
              ListHeaderComponent={<View style={{ height: listTopInset }} />}
              ListFooterComponent={
                isLoadingMore ? (
                  <View style={styles.loadingMoreRow}>
                    <ActivityIndicator size="small" />
                    <Text style={styles.loadingMoreText}>
                      {LEDGER_ENTRIES_LOADING_MORE}
                    </Text>
                  </View>
                ) : null
              }
              renderSectionHeader={({ section }) => (
                <Text style={styles.sectionHeader}>{section.title}</Text>
              )}
              renderItem={({ item }) => (
                <TransactionListItem
                  label={item.ledgerName}
                  itemName={item.title}
                  amount={item.type === 'INCOME' ? item.amount : -item.amount}
                  hasReceipt={item.receiptCount > 0}
                  isPendingApproval={item.approvalStatus === 'PENDING'}
                  onPress={() => handlePressTransaction(item)}
                />
              )}
            />
          )}
        </View>

        <Animated.View
          style={[styles.collapsingHeader, { transform: [{ translateY: headerTranslateY }] }]}
        >
          <View
            style={styles.summarySection}
            onLayout={event => setCardBlockHeight(event.nativeEvent.layout.height)}
          >
            <AmountCard
              type="incomeExpense"
              income={summary.totalIncome}
              expense={summary.totalExpense}
            />
          </View>

          <View
            style={styles.controls}
            onLayout={event => setControlsHeight(event.nativeEvent.layout.height)}
          >
            <View style={styles.tabsBleed}>
              <Tabs items={TABS} value={tab} onChange={setTab} showIcon={false} fullWidth />
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

            {loadState === 'ready' && (
              <Text style={styles.countText}>
                {entries.length}
                {TRANSACTIONS_COUNT_SUFFIX}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>

      <FloatingActionButton
        onPress={() => navigation.navigate('TransactionRegister', {})}
      />

      <TransactionFilterSheet
        visible={filterSheetVisible}
        value={filter}
        ledgerOptions={ledgerOptions}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setFilter}
        onPressCreateNewLedger={() =>
          navigation.navigate('LedgerCreate', { parentId: null })
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    overflow: 'hidden',
  },
  listArea: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: BACKGROUND_SECONDARY,
  },
  collapsingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  summarySection: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  controls: {
    paddingHorizontal: 20,
    backgroundColor: BACKGROUND_SECONDARY,
  },
  tabsBleed: {
    marginHorizontal: -20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  iconRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    paddingBottom: BOTTOM_NAVIGATION_HEIGHT + 96,
  },
  sectionHeader: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 12,
    marginBottom: 6,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 40,
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
  },
  loadingMoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingMoreText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default TransactionsScreen;
