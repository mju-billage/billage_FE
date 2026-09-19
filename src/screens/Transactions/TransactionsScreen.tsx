/** @screen DTB-1-PAGE-01-0 내역 메인 */
/**
 * 4-B(모임 전체 내역 목록 API 연동): 목(`types/transaction.ts`, 4-B 정리로 삭제됨)을
 * 걷어내고 `entryService.getGroupEntries()`(Entry.txt §7)로 옮겼다.
 *
 * 4-B 정리(2026-09-05): 옛 `editMock`(DTB 목 데이터 수정) 경로가 완료 시
 * `navigation.navigate('Main', { screen: 'Transactions', params: { addedTransactionId } })`로
 * 이 화면에 신호를 보내 스낵바를 띄우던 게 있었는데, 그 경로 자체가 삭제되며
 * `addedTransactionId`를 만들어내는 곳이 사라졌다 — `route.params` 기반 스낵바
 * 블록과 `MainTabParamList`의 파라미터 타입을 함께 제거했다(`ADD-2-SNACKBAR-01-0`은
 * 이제 `TransactionRegisterScreen.tsx`에만 있다).
 *
 * 잔액 카드·건수·목록이 한 응답에 묶여 온다(명세가 "세 번 호출하지 않도록"이라고
 * 명시) — 필터를 바꿔도 `load()` 한 번만 다시 부른다. 페이지네이션은 4-A에서
 * 확정한 무한 스크롤(FlatList/SectionList `onEndReached`) 그대로 쓴다 — "더보기"
 * 버튼을 새로 만들지 않았다. 탭(전체/승인요청)·필터가 바뀌면 `load()`가 매번
 * `page=0`부터 다시 불러온다(`loadMoreEntries`만 페이지를 증가시킨다).
 *
 * 장부 목록(`ledgerOptions`)은 `load()`와 완전히 분리했다 — `loadLedgerOptions()`가
 * 별도 `useFocusEffect`로, 필터/탭과 무관하게 화면에 포커스될 때마다 한 번만
 * 불린다. 그래서 필터 칩을 눌러도 장부 목록은 다시 안 부르고, 대신 "장부 추가"로
 * `LedgerCreate`에 갔다가 돌아오는 포커스 복귀 시점엔 갱신된다 — 별도 이벤트
 * 연결 없이 포커스 재진입만으로 새 장부가 목록에 반영된다.
 */
import { useCallback, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
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
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
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

/** 내역 메인 화면: 전체 내역/승인요청 탭, 요약 카드, 날짜별 거래 목록을 보여준다. */
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

  // 필터/탭과 무관하게 포커스될 때마다 한 번만 불린다 — 필터 칩을 눌러도 다시
  // 부르지 않고, "장부 추가" 후 돌아왔을 때는 포커스 복귀로 갱신된다.
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
      // 필터 칩/시트 보조 데이터라 실패해도 조용히 넘어간다 — 메인 목록 조회
      // 쪽의 에러 상태·재시도가 화면 상태를 대표한다.
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
      // 다음 페이지 실패는 조용히 무시한다 — 목록 끝에서 다시 스크롤하면 재시도된다.
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
    <ScreenContainer background="primary">
      <AppBar type="titleOnly" title={TRANSACTIONS_TITLE} />

      <View style={styles.body}>
        <AmountCard
          type="incomeExpense"
          income={summary.totalIncome}
          expense={summary.totalExpense}
        />

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

        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{TRANSACTIONS_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button
              label={TRANSACTIONS_RETRY_LABEL}
              onPress={load}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          </View>
        )}

        {loadState === 'ready' && (
          <>
            <Text style={styles.countText}>
              {entries.length}
              {TRANSACTIONS_COUNT_SUFFIX}
            </Text>

            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{TRANSACTIONS_EMPTY}</Text>
              </View>
            ) : (
              <SectionList
                sections={sections}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onEndReachedThreshold={0.4}
                onEndReached={loadMoreEntries}
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
          </>
        )}
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
