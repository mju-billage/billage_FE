import { useCallback, useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { truncateWithEllipsis } from '../../utils/truncateWithEllipsis';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import AmountCard from '../../components/Data Display/Card/AmountCard';
import BudgetCard from '../../components/Data Display/Card/BudgetCard';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import CarouselIndicator from '../../components/Navigation/Carousel Indicator/CarouselIndicator';
import Button from '../../components/Input/Button/Button';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import LedgerBudgetSheet from '../../components/Feedback/Dialogs/LedgerBudgetSheet';
import { setPendingSnackbar } from '../../utils/pendingSnackbar';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderMoreMenu from './FolderMoreMenu';
import LedgerFilterSheet, {
  DEFAULT_LEDGER_FILTER,
  getLedgerFilterDateRange,
  toEntryFilterQuery,
  type LedgerFilterValue,
} from './LedgerFilterSheet';
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import type { LedgerDetail } from '../../types/ledger';
import { groupEntriesByDate, type EntrySummary } from '../../types/entry';
import { getActiveGroup } from '../../types/group';
import { formatDateHeader } from '../../utils/dateHeader';
import * as ledgerService from '../../services/ledgerService';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import * as entryService from '../../services/entryService';
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
  LEDGER_DELETE_CONFIRM_LABEL,
  LEDGER_DELETE_DIALOG_DESCRIPTION,
  LEDGER_DELETE_DIALOG_TITLE,
  LEDGER_DETAIL_LOADING,
  LEDGER_DETAIL_RETRY_LABEL,
  LEDGER_COUNT_SUFFIX,
  LEDGER_ENTRIES_LOADING_MORE,
  LEDGER_LIST_EMPTY_SUBTITLE,
  LEDGER_LIST_EMPTY_TITLE,
  LEDGER_MENU_BUDGET,
  LEDGER_MENU_DELETE,
  LEDGER_MENU_RENAME,
  LEDGER_NAME_MAX_LENGTH,
  LEDGER_RENAME_CONFIRM_LABEL,
  LEDGER_RENAME_DIALOG_DESCRIPTION,
  LEDGER_RENAME_DIALOG_TITLE,
  LEDGER_RENAME_PLACEHOLDER,
  SNACKBAR_LEDGER_DELETED_SUFFIX,
  SNACKBAR_LEDGER_RENAMED,
} from '../../constants/ledgerScreenText';
import { SNACKBAR_BUDGET_SAVED } from '../../constants/folderScreenText';
import {
  BACKGROUND_PRIMARY,
  BACKGROUND_SECONDARY,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  SNACKBAR_LOAD_MORE_FAILED,
} from '../../constants/commonText';

const SEARCH_ICON = require('../../assets/icons/system/Search.png');
const FILTER_ICON = require('../../assets/icons/system/Filter.png');
const MENU_ICON = require('../../assets/icons/action/MenuHorizontal.png');

type LedgerDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LedgerDetail'
>;
type LedgerDetailRouteProp = RouteProp<RootStackParamList, 'LedgerDetail'>;

type ActiveDialog = 'rename' | 'budget' | 'delete' | null;
type LoadState = 'loading' | 'error' | 'ready';

const FILTER_PERIOD_LABEL_BY_VALUE: Record<Exclude<LedgerFilterValue['period'], 'all'>, string> = {
  '1month': FILTER_PERIOD_1MONTH,
  '3month': FILTER_PERIOD_3MONTH,
  '6month': FILTER_PERIOD_6MONTH,
  custom: FILTER_PERIOD_CUSTOM,
};

function getFilterSummary(filter: LedgerFilterValue): string {
  const typeLabel =
    filter.type === 'income'
      ? FILTER_TYPE_INCOME
      : filter.type === 'expense'
      ? FILTER_TYPE_EXPENSE
      : FILTER_TYPE_ALL;
  const sortLabel = filter.sort === 'oldest' ? FILTER_SORT_OLDEST : FILTER_SORT_LATEST;
  const parts =
    filter.period === 'all'
      ? [typeLabel, sortLabel]
      : [FILTER_PERIOD_LABEL_BY_VALUE[filter.period], typeLabel, sortLabel];
  return parts.join(' · ');
}

function LedgerDetailScreen() {
  const navigation = useNavigation<LedgerDetailNavigationProp>();
  const route = useRoute<LedgerDetailRouteProp>();
  const ledgerId = route.params.ledgerId;
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [ledger, setLedger] = useState<LedgerDetail | null>(null);
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [entryTotal, setEntryTotal] = useState(0);
  const [entryPage, setEntryPage] = useState(0);
  const [hasMoreEntries, setHasMoreEntries] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [cardIndex, setCardIndex] = useState(0);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [dialogInputValue, setDialogInputValue] = useState('');
  const [dialogError, setDialogError] = useState<string | undefined>();
  const { isLocked: isSubmittingDialog, run } = useSubmitLock();
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [filter, setFilter] = useState<LedgerFilterValue>(DEFAULT_LEDGER_FILTER);
  const filterRef = useRef<LedgerFilterValue>(DEFAULT_LEDGER_FILTER);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  /** 기간 필터용 모임 id 캐시(7-6) — `getActiveGroup()` 으로 한 번 구하면 화면에 머무는 동안 재사용한다. */
  const groupIdRef = useRef<string | null>(null);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    if (error instanceof Error && error.message === NO_ACTIVE_GROUP_MESSAGE) {
      return NO_ACTIVE_GROUP_MESSAGE;
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  /**
   * 장부별 내역 목록(`getEntries`)은 `from`/`to` 를 받지 않는다. 기간 필터가 걸리면
   * 모임 전체 목록(`getGroupEntries`)을 `ledgerIds=[이 장부]` 로 불러 우회한다(기본안 B,
   * 7-6). 서버가 장부별 목록에서 from/to 를 지원하면 이 분기만 걷어내면 된다 —
   * docs/pending/backend.md 참조.
   */
  const fetchEntriesPage = useCallback(
    async (
      filterValue: LedgerFilterValue,
      page: number,
    ): Promise<entryService.EntryListPage> => {
      if (filterValue.period === 'all') {
        return entryService.getEntries(ledgerId, {
          ...toEntryFilterQuery(filterValue),
          page,
        });
      }
      if (!groupIdRef.current) {
        let group = getActiveGroup();
        if (!group) {
          await groupService.getMyGroups();
          group = getActiveGroup();
        }
        groupIdRef.current = group ? group.id : null;
      }
      if (!groupIdRef.current) {
        throw new Error(NO_ACTIVE_GROUP_MESSAGE);
      }
      const range = getLedgerFilterDateRange(filterValue);
      const groupPage = await entryService.getGroupEntries(groupIdRef.current, {
        ledgerIds: [ledgerId],
        from: range.from,
        to: range.to,
        ...toEntryFilterQuery(filterValue),
        page,
      });
      return {
        items: groupPage.items,
        page: groupPage.page,
        totalPages: groupPage.totalPages,
        totalElements: groupPage.totalElements,
        last: groupPage.last,
      };
    },
    [ledgerId],
  );

  const fieldOrGeneralError = (error: unknown, field: string): string => {
    if (error instanceof ApiError) {
      const fieldError = error.fieldErrors.find(fe => fe.field === field);
      return fieldError?.reason ?? getApiErrorMessage(error.code, error.message);
    }
    return toErrorMessage(error);
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [detail, firstPage] = await Promise.all([
        ledgerService.getLedgerDetail(ledgerId),
        fetchEntriesPage(filterRef.current, 0),
      ]);
      setLedger(detail);
      setEntries(firstPage.items);
      setEntryTotal(firstPage.totalElements);
      setEntryPage(firstPage.page);
      setHasMoreEntries(!firstPage.last);
      loadMoreFailedRef.current = false;
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [ledgerId, fetchEntriesPage]);

  const loadMoreEntries = useCallback(async () => {
    if (loadMoreFailedRef.current || isLoadingMore || !hasMoreEntries) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = await fetchEntriesPage(filter, entryPage + 1);
      setEntries(current => [...current, ...nextPage.items]);
      setEntryPage(nextPage.page);
      setHasMoreEntries(!nextPage.last);
    } catch (error) {
      loadMoreFailedRef.current = true;
      showSnackbar(toUserErrorMessage(error, SNACKBAR_LOAD_MORE_FAILED));
    } finally {
      setIsLoadingMore(false);
    }
  }, [entryPage, isLoadingMore, hasMoreEntries, filter, fetchEntriesPage]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const loadMoreFailedRef = useRef(false);

  const showSnackbar = (message: string) => {
    setSnackbar(message);
  };

  const handleApplyFilter = async (next: LedgerFilterValue) => {
    const previous = filterRef.current;
    filterRef.current = next;
    setFilter(next);
    try {
      const firstPage = await fetchEntriesPage(next, 0);
      setEntries(firstPage.items);
      setEntryTotal(firstPage.totalElements);
      setEntryPage(firstPage.page);
      setHasMoreEntries(!firstPage.last);
      loadMoreFailedRef.current = false;
    } catch (error) {
      filterRef.current = previous;
      setFilter(previous);
      showSnackbar(toErrorMessage(error));
    }
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setDialogInputValue('');
    setDialogError(undefined);
  };

  const menuItems: MenuItem[] = [
    { key: 'budget', label: LEDGER_MENU_BUDGET },
    { key: 'rename', label: LEDGER_MENU_RENAME },
    { key: 'delete', label: LEDGER_MENU_DELETE },
  ];

  const handleSelectMenu = (key: string) => {
    setMoreMenuVisible(false);
    if (!ledger) {
      return;
    }
    if (key === 'budget') {
      setDialogInputValue(ledger.budget ? String(ledger.budget) : '');
      setActiveDialog('budget');
    } else if (key === 'rename') {
      setDialogInputValue(ledger.name);
      setActiveDialog('rename');
    } else if (key === 'delete') {
      setActiveDialog('delete');
    }
  };

  const handleConfirmDialog = () => {
    if (!ledger) {
      return;
    }
    if (activeDialog === 'rename') {
      const trimmed = dialogInputValue.trim();
      if (!trimmed) {
        return;
      }
      run(async () => {
        try {
          await ledgerService.updateLedger(ledgerId, { name: trimmed });
          closeDialog();
          showSnackbar(SNACKBAR_LEDGER_RENAMED);
          load();
          return true;
        } catch (error) {
          setDialogError(fieldOrGeneralError(error, 'name'));
          return false;
        }
      });
    } else if (activeDialog === 'delete') {
      const name = ledger.name;
      run(async () => {
        try {
          await ledgerService.deleteLedger(ledgerId);
          closeDialog();
          setPendingSnackbar(`'${name}'${SNACKBAR_LEDGER_DELETED_SUFFIX}`);
          navigation.goBack();
          return true;
        } catch (error) {
          closeDialog();
          showSnackbar(toErrorMessage(error));
          return false;
        }
      }, { keepLockedOnSuccess: true });
    }
  };

  const handleSaveBudget = () => {
    const parsed = Number(dialogInputValue.trim());
    if (!dialogInputValue.trim() || Number.isNaN(parsed)) {
      return;
    }
    run(async () => {
      try {
        await ledgerService.updateLedgerBudget(ledgerId, parsed);
        closeDialog();
        showSnackbar(SNACKBAR_BUDGET_SAVED);
        load();
        return true;
      } catch (error) {
        setDialogError(fieldOrGeneralError(error, 'budget'));
        return false;
      }
    });
  };

  const dialogConfig = getDialogConfig(activeDialog);
  const isFilterActive =
    filter.period !== DEFAULT_LEDGER_FILTER.period ||
    filter.type !== DEFAULT_LEDGER_FILTER.type ||
    filter.sort !== DEFAULT_LEDGER_FILTER.sort;
  const filterSummary = getFilterSummary(filter);

  const sections = groupEntriesByDate(entries).map(group => ({
    title: formatDateHeader(group.date),
    data: group.items,
  }));

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    setCardIndex(index);
  };

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <ScreenContainer background="primary">
        <AppBar title="" onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'loading' ? LEDGER_DETAIL_LOADING : loadErrorMessage}
          </Text>
          {loadState === 'error' && (
            <Button label={LEDGER_DETAIL_RETRY_LABEL} onPress={load} hierarchy="secondary" style={{ alignSelf: 'center' }} />
          )}
        </View>
      </ScreenContainer>
    );
  }

  if (!ledger) {
    return null;
  }

  return (
    <ScreenContainer
      background="primary"
      edges={['top']}
      snackbar={
        <Snackbar
          visible={snackbar != null}
          title={snackbar ?? ''}
          onClose={() => setSnackbar(null)}
        />
      }
    >
      <AppBar
        title={truncateWithEllipsis(ledger.name)}
        onBackPress={() => navigation.goBack()}
        rightIcons={[{ icon: MENU_ICON, onPress: () => setMoreMenuVisible(true) }]}
      />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: 24 + insets.bottom }]}
        stickySectionHeadersEnabled={false}
        onEndReachedThreshold={0.4}
        onEndReached={loadMoreEntries}
        ListHeaderComponent={
          <>
            <View style={styles.cardBlock}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScrollEnd}
                style={styles.carousel}
                decelerationRate="fast"
              >
                <View style={[styles.cardSlide, { width: windowWidth }]}>
                  <AmountCard
                    type="incomeExpense"
                    income={ledger.totalIncome}
                    expense={ledger.totalExpense}
                  />
                </View>
                <View style={[styles.cardSlide, { width: windowWidth }]}>
                  {ledger.budget != null ? (
                    <BudgetCard
                      remainingBudget={ledger.remainingBudget ?? ledger.budget - ledger.totalExpense}
                      expense={ledger.totalExpense}
                      budget={ledger.budget}
                    />
                  ) : (
                    <BudgetCard state="empty" />
                  )}
                </View>
              </ScrollView>
              <View style={styles.indicatorRow}>
                <CarouselIndicator count={2} selectedIndex={cardIndex} />
              </View>
            </View>

            <View style={styles.listHeader}>
              <View style={styles.toolRow}>
                <View style={styles.filterGroup}>
                  {isFilterActive && (
                    <Pressable onPress={() => setFilterSheetVisible(true)}>
                      <Text style={styles.filterSummaryText} numberOfLines={1}>
                        {filterSummary}
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => setFilterSheetVisible(true)}
                    hitSlop={8}
                    accessibilityLabel="필터"
                  >
                    <Image source={FILTER_ICON} style={styles.toolIcon} />
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => navigation.navigate('LedgerSearch', { ledgerId, ledgerName: ledger.name })}
                  hitSlop={8}
                  accessibilityLabel="검색"
                >
                  <Image source={SEARCH_ICON} style={styles.toolIcon} />
                </Pressable>
              </View>

              <Text style={styles.countText}>
                {entryTotal}
                {LEDGER_COUNT_SUFFIX}
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{LEDGER_LIST_EMPTY_TITLE}</Text>
            <Text style={styles.emptySubtitle}>{LEDGER_LIST_EMPTY_SUBTITLE}</Text>
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <Text style={styles.loadingMoreText}>{LEDGER_ENTRIES_LOADING_MORE}</Text>
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <TransactionListItem
              itemName={item.title}
              amount={item.type === 'INCOME' ? item.amount : -item.amount}
              hasReceipt={item.receiptCount > 0}
              isPendingApproval={item.approvalStatus === 'PENDING'}
              onPress={() =>
                navigation.navigate('TransactionDetail', {
                  transactionId: item.id,
                })
              }
            />
          </View>
        )}
      />

      <LedgerFilterSheet
        visible={filterSheetVisible}
        value={filter}
        onClose={() => setFilterSheetVisible(false)}
        onApply={handleApplyFilter}
      />

      <FolderMoreMenu
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        items={menuItems}
        onSelect={handleSelectMenu}
      />

      <Dialog
        visible={activeDialog === 'rename' || activeDialog === 'delete'}
        title={dialogConfig.title}
        description={dialogConfig.description}
        showTextField={dialogConfig.showTextField}
        textFieldValue={dialogInputValue}
        onChangeTextField={text => {
          setDialogInputValue(text.slice(0, LEDGER_NAME_MAX_LENGTH));
          setDialogError(undefined);
        }}
        textFieldPlaceholder={dialogConfig.placeholder}
        textFieldMaxLength={activeDialog === 'rename' ? LEDGER_NAME_MAX_LENGTH : undefined}
        autoFocusTextField={activeDialog === 'rename'}
        textFieldError={dialogError}
        confirmLabel={dialogConfig.confirmLabel}
        destructive={activeDialog === 'delete'}
        confirmDisabled={isSubmittingDialog}
        onCancel={closeDialog}
        onConfirm={handleConfirmDialog}
      />

      <LedgerBudgetSheet
        visible={activeDialog === 'budget'}
        ledgerName={ledger.name}
        value={dialogInputValue}
        error={dialogError}
        isSaving={isSubmittingDialog}
        onChangeValue={(next, error) => {
          setDialogInputValue(next);
          setDialogError(error);
        }}
        onSave={handleSaveBudget}
        onClose={closeDialog}
      />
    </ScreenContainer>
  );
}

function getDialogConfig(activeDialog: ActiveDialog) {
  switch (activeDialog) {
    case 'rename':
      return {
        title: LEDGER_RENAME_DIALOG_TITLE,
        description: LEDGER_RENAME_DIALOG_DESCRIPTION,
        showTextField: true,
        placeholder: LEDGER_RENAME_PLACEHOLDER,
        confirmLabel: LEDGER_RENAME_CONFIRM_LABEL,
      };
    case 'delete':
      return {
        title: LEDGER_DELETE_DIALOG_TITLE,
        description: LEDGER_DELETE_DIALOG_DESCRIPTION,
        showTextField: false,
        placeholder: undefined,
        confirmLabel: LEDGER_DELETE_CONFIRM_LABEL,
      };
    default:
      return {
        title: '',
        description: undefined,
        showTextField: false,
        placeholder: undefined,
        confirmLabel: undefined,
      };
  }
}

const styles = StyleSheet.create({
  carousel: {
    flexGrow: 0,
    marginTop: 16,
  },
  cardSlide: {
    paddingHorizontal: 20,
  },
  indicatorRow: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterSummaryText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  toolIcon: {
    width: 24,
    height: 24,
  },
  countText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginBottom: 8,
  },
  listContent: {
    flexGrow: 1,
    backgroundColor: BACKGROUND_SECONDARY,
  },
  cardBlock: {
    backgroundColor: BACKGROUND_PRIMARY,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  itemWrapper: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 20,
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
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    ...TYPOGRAPHY.subtitle3,
  },
  emptySubtitle: {
    marginTop: 6,
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  loadingMoreText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default LedgerDetailScreen;
