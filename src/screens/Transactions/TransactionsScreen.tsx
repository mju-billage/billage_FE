import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
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
import Divider from '../../components/Data Display/Divider/Divider';
import CountRow from '../../components/Data Display/Lists/CountRow';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import FloatingActionButton, { FAB_SIZE } from '../../components/Input/Button/FAB';
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
  toUserErrorMessage,
} from '../../constants/apiErrorMessages';
import {
  FILTER_PERIOD_1MONTH,
  FILTER_PERIOD_3MONTH,
  FILTER_PERIOD_6MONTH,
  FILTER_PERIOD_CUSTOM,
  FILTER_SORT_LATEST,
  FILTER_SORT_OLDEST,
  FILTER_TYPE_ALL,
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
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  SNACKBAR_LEDGER_OPTIONS_LOAD_FAILED,
  SNACKBAR_LOAD_MORE_FAILED,
} from '../../constants/commonText';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';

const FILTER_ICON = require('../../assets/icons/system/Filter.png');
const SEARCH_ICON = require('../../assets/icons/system/Search.png');

const SNACKBAR_FAB_GAP = 12;

type TransactionsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Transactions'>,
  NativeStackNavigationProp<RootStackParamList>
>;
type TransactionsScreenRouteProp = RouteProp<MainTabParamList, 'Transactions'>;

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
  for (const id of filter.ledgerIds) {
    const option = ledgerOptions.find(item => item.id === id);
    if (option) {
      chips.push({ key: `ledger-${id}`, label: option.name });
    }
  }
  return chips;
}

const FILTER_PERIOD_LABEL_BY_VALUE: Record<EntryListFilterValue['period'], string> = {
  '1month': FILTER_PERIOD_1MONTH,
  '3month': FILTER_PERIOD_3MONTH,
  '6month': FILTER_PERIOD_6MONTH,
  custom: FILTER_PERIOD_CUSTOM,
};

const FILTER_TYPE_LABEL_BY_VALUE: Record<EntryListFilterValue['type'], string> = {
  all: FILTER_TYPE_ALL,
  income: FILTER_TYPE_INCOME,
  expense: FILTER_TYPE_EXPENSE,
};

const FILTER_SORT_LABEL_BY_VALUE: Record<EntryListFilterValue['sort'], string> = {
  latest: FILTER_SORT_LATEST,
  oldest: FILTER_SORT_OLDEST,
};

function getFilterSummary(filter: EntryListFilterValue): string {
  return [
    FILTER_PERIOD_LABEL_BY_VALUE[filter.period],
    FILTER_TYPE_LABEL_BY_VALUE[filter.type],
    FILTER_SORT_LABEL_BY_VALUE[filter.sort],
  ].join(' · ');
}

function TransactionsScreen() {
  const navigation = useNavigation<TransactionsScreenNavigationProp>();
  const route = useRoute<TransactionsScreenRouteProp>();
  const [tab, setTab] = useState<TransactionsTab>('all');
  const [filter, setFilter] = useState<EntryListFilterValue>(
    DEFAULT_ENTRY_LIST_FILTER,
  );
  const [ledgerOptions, setLedgerOptions] = useState<LedgerOption[]>([]);
  const [summary, setSummary] = useState<EntryGroupSummary>(EMPTY_SUMMARY);
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const loadMoreFailedRef = useRef(false);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), 1600);
  };

  useEffect(() => {
    if (route.params?.snackbarMessage) {
      showSnackbar(route.params.snackbarMessage);
      navigation.setParams({ snackbarMessage: undefined });
    }
  }, [route.params?.snackbarMessage, navigation]);

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
      return getApiErrorMessage(error.code, error.message);
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
      setTotalElements(firstPage.totalElements);
      loadMoreFailedRef.current = false;
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
    } catch (error) {
      showSnackbar(toUserErrorMessage(error, SNACKBAR_LEDGER_OPTIONS_LOAD_FAILED));
    }
  }, []);

  const loadMoreEntries = useCallback(async () => {
    if (loadMoreFailedRef.current || isLoadingMore || !hasMore) {
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
    } catch (error) {
      loadMoreFailedRef.current = true;
      showSnackbar(toUserErrorMessage(error, SNACKBAR_LOAD_MORE_FAILED));
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
  const isFilterActive =
    filter.period !== DEFAULT_ENTRY_LIST_FILTER.period ||
    filter.type !== DEFAULT_ENTRY_LIST_FILTER.type ||
    filter.sort !== DEFAULT_ENTRY_LIST_FILTER.sort ||
    filter.ledgerIds.length > 0;
  const filterSummary = getFilterSummary(filter);

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
    <ScreenContainer
      background="primary"
      edges={['top']}
      aboveTabBar
      snackbarOffset={FAB_SIZE + SNACKBAR_FAB_GAP}
      snackbar={snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined}
    >
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
            <View style={[styles.emptyState, { paddingTop: listTopInset + 60 }]}>
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
            <Tabs items={TABS} value={tab} onChange={setTab} showIcon={false} fullWidth />

            <View style={styles.filterSection}>
              <View style={styles.actionRow}>
                <View style={styles.iconRow}>
                  <View style={styles.filterGroup}>
                    {isFilterActive && (
                      <Pressable onPress={() => setFilterSheetVisible(true)}>
                        <Text style={styles.filterSummaryText} numberOfLines={1}>
                          {filterSummary}
                        </Text>
                      </Pressable>
                    )}
                    <IconButton
                      icon={FILTER_ICON}
                      iconSize={20}
                      iconColor={FOREGROUND_NEUTRAL_NORMAL}
                      onPress={() => setFilterSheetVisible(true)}
                    />
                  </View>
                  <IconButton
                    icon={SEARCH_ICON}
                    iconSize={20}
                    iconColor={FOREGROUND_NEUTRAL_NORMAL}
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
            </View>

            {loadState === 'ready' && (
              <>
                <CountRow text={`${totalElements}${TRANSACTIONS_COUNT_SUFFIX}`} />
                <Divider />
              </>
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
    backgroundColor: BACKGROUND_SECONDARY,
  },
  filterSection: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: -8,
  },
  iconRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: -8,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterSummaryText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginLeft: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  listContent: {
    paddingBottom: BOTTOM_NAVIGATION_HEIGHT + 96,
  },
  sectionHeader: {
    ...TYPOGRAPHY.caption,
    color: FOREGROUND_NEUTRAL_NORMAL,
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
    paddingTop: 60,
  },
  emptyText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
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
