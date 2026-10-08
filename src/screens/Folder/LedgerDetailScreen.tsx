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
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderMoreMenu from './FolderMoreMenu';
import LedgerFilterSheet, {
  DEFAULT_LEDGER_FILTER,
  toEntryFilterQuery,
  type LedgerFilterValue,
} from './LedgerFilterSheet';
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import type { LedgerDetail } from '../../types/ledger';
import { groupEntriesByDate, type EntrySummary } from '../../types/entry';
import { formatDateHeader } from '../../utils/dateHeader';
import * as ledgerService from '../../services/ledgerService';
import * as entryService from '../../services/entryService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
  toUserErrorMessage,
} from '../../constants/apiErrorMessages';
import {
  LEDGER_BUDGET_DIALOG_TITLE,
  LEDGER_BUDGET_MAX,
  LEDGER_BUDGET_PLACEHOLDER,
  LEDGER_BUDGET_SAVE_LABEL,
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
  SNACKBAR_LEDGER_RENAMED_PREFIX,
  SNACKBAR_LEDGER_RENAMED_SUFFIX,
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

const SNACKBAR_AUTO_HIDE_MS = 1600;

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
  const [isSubmittingDialog, setIsSubmittingDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [filter, setFilter] = useState<LedgerFilterValue>(DEFAULT_LEDGER_FILTER);
  const filterRef = useRef<LedgerFilterValue>(DEFAULT_LEDGER_FILTER);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

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
        entryService.getEntries(ledgerId, { ...toEntryFilterQuery(filterRef.current), page: 0 }),
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
  }, [ledgerId]);

  const loadMoreEntries = useCallback(async () => {
    if (loadMoreFailedRef.current || isLoadingMore || !hasMoreEntries) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = await entryService.getEntries(ledgerId, {
        ...toEntryFilterQuery(filter),
        page: entryPage + 1,
      });
      setEntries(current => [...current, ...nextPage.items]);
      setEntryPage(nextPage.page);
      setHasMoreEntries(!nextPage.last);
    } catch (error) {
      loadMoreFailedRef.current = true;
      showSnackbar(toUserErrorMessage(error, SNACKBAR_LOAD_MORE_FAILED));
    } finally {
      setIsLoadingMore(false);
    }
  }, [ledgerId, entryPage, isLoadingMore, hasMoreEntries, filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const loadMoreFailedRef = useRef(false);

  const showSnackbar = (message: string) => {
    setSnackbar(message);
    setTimeout(() => setSnackbar(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const handleApplyFilter = async (next: LedgerFilterValue) => {
    const previous = filterRef.current;
    filterRef.current = next;
    setFilter(next);
    try {
      const firstPage = await entryService.getEntries(ledgerId, {
        ...toEntryFilterQuery(next),
        page: 0,
      });
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

  const handleConfirmDialog = async () => {
    if (isSubmittingDialog || !ledger) {
      return;
    }
    if (activeDialog === 'rename') {
      const trimmed = dialogInputValue.trim();
      if (!trimmed) {
        return;
      }
      setIsSubmittingDialog(true);
      try {
        await ledgerService.updateLedger(ledgerId, { name: trimmed });
        closeDialog();
        showSnackbar(
          `${SNACKBAR_LEDGER_RENAMED_PREFIX}${trimmed}${SNACKBAR_LEDGER_RENAMED_SUFFIX}`,
        );
        load();
      } catch (error) {
        setDialogError(fieldOrGeneralError(error, 'name'));
      } finally {
        setIsSubmittingDialog(false);
      }
    } else if (activeDialog === 'budget') {
      const parsed = Number(dialogInputValue.trim());
      if (!dialogInputValue.trim() || Number.isNaN(parsed)) {
        return;
      }
      setIsSubmittingDialog(true);
      try {
        await ledgerService.updateLedgerBudget(ledgerId, parsed);
        closeDialog();
        showSnackbar(SNACKBAR_BUDGET_SAVED);
        load();
      } catch (error) {
        setDialogError(fieldOrGeneralError(error, 'budget'));
      } finally {
        setIsSubmittingDialog(false);
      }
    } else if (activeDialog === 'delete') {
      const name = ledger.name;
      setIsSubmittingDialog(true);
      try {
        await ledgerService.deleteLedger(ledgerId);
        closeDialog();
        showSnackbar(`'${name}'${SNACKBAR_LEDGER_DELETED_SUFFIX}`);
        setTimeout(() => navigation.goBack(), SNACKBAR_AUTO_HIDE_MS);
      } catch (error) {
        closeDialog();
        showSnackbar(toErrorMessage(error));
      } finally {
        setIsSubmittingDialog(false);
      }
    }
  };

  const dialogConfig = getDialogConfig(activeDialog);

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
      snackbar={snackbar ? <Snackbar visible title={snackbar} /> : undefined}
    >
      <AppBar
        title={ledger.name}
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
                <Pressable
                  onPress={() => setFilterSheetVisible(true)}
                  hitSlop={8}
                  accessibilityLabel="필터"
                >
                  <Image source={FILTER_ICON} style={styles.toolIcon} />
                </Pressable>
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
        visible={activeDialog !== null}
        title={dialogConfig.title}
        description={dialogConfig.description}
        showTextField={dialogConfig.showTextField}
        textFieldValue={dialogInputValue}
        onChangeTextField={text => {
          const next =
            activeDialog === 'rename'
              ? text.slice(0, LEDGER_NAME_MAX_LENGTH)
              : clampBudgetInput(text);
          setDialogInputValue(next);
          setDialogError(undefined);
        }}
        textFieldPlaceholder={dialogConfig.placeholder}
        textFieldKeyboardType={activeDialog === 'budget' ? 'number-pad' : undefined}
        autoFocusTextField={activeDialog === 'rename'}
        textFieldError={dialogError}
        confirmLabel={dialogConfig.confirmLabel}
        destructive={activeDialog === 'delete'}
        confirmDisabled={isSubmittingDialog}
        onCancel={closeDialog}
        onConfirm={handleConfirmDialog}
      />
    </ScreenContainer>
  );
}

function clampBudgetInput(text: string): string {
  const digitsOnly = text.replace(/[^0-9]/g, '');
  if (!digitsOnly) {
    return '';
  }
  const parsed = Number(digitsOnly);
  return parsed > LEDGER_BUDGET_MAX ? String(LEDGER_BUDGET_MAX) : digitsOnly;
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
    case 'budget':
      return {
        title: LEDGER_BUDGET_DIALOG_TITLE,
        description: undefined,
        showTextField: true,
        placeholder: LEDGER_BUDGET_PLACEHOLDER,
        confirmLabel: LEDGER_BUDGET_SAVE_LABEL,
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
