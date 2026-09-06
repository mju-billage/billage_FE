/** @screen FDR-2-PAGE-05-0 장부 상세 */
/** @screen FDR-3-MODAL-03-0 장부 이름 변경 (activeDialog='rename') */
/** @screen FDR-3-MODAL-04-0 장부 삭제 (activeDialog='delete') */
/** @screen FDR-4-SNACKBAR-02-0 장부 삭제_완료 (SNACKBAR_LEDGER_DELETED_SUFFIX) */
/**
 * 4-A(Entry API 연동) — 내역 목록을 실 서버로 교체했다. 페이지네이션은 무한
 * 스크롤(FlatList onEndReached)로 확정 — 이 화면 포함 어떤 화면도 "더보기" 버튼
 * 패턴을 쓴 적이 없고 디자인 시안에도 그런 버튼이 없어서, 기존 FlatList 관례를
 * 그대로 잇는 쪽을 표준으로 삼았다(docs/api-integration-plan.md "표준 패턴" 참고,
 * Dues·Report도 이 패턴을 따르면 된다).
 */
import { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
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
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import type { LedgerDetail } from '../../types/ledger';
import type { EntrySummary } from '../../types/entry';
import * as ledgerService from '../../services/ledgerService';
import * as entryService from '../../services/entryService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
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
  LEDGER_ENTRIES_LOADING_MORE,
  LEDGER_LIST_EMPTY_SUBTITLE,
  LEDGER_LIST_EMPTY_TITLE,
  LEDGER_MENU_BUDGET,
  LEDGER_MENU_DELETE,
  LEDGER_MENU_RENAME,
  LEDGER_NAME_MAX_LENGTH,
  LEDGER_RENAME_CONFIRM_LABEL,
  LEDGER_RENAME_DIALOG_TITLE,
  LEDGER_RENAME_PLACEHOLDER,
  SNACKBAR_LEDGER_DELETED_SUFFIX,
  SNACKBAR_LEDGER_RENAMED_PREFIX,
  SNACKBAR_LEDGER_RENAMED_SUFFIX,
} from '../../constants/ledgerScreenText';
import { SNACKBAR_BUDGET_SAVED } from '../../constants/folderScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SEARCH_ICON = require('../../assets/icons/system/Search.png');
const MENU_ICON = require('../../assets/icons/action/MenuHorizontal.png');
const CARD_WIDTH = Dimensions.get('window').width - 48;

type LedgerDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LedgerDetail'
>;
type LedgerDetailRouteProp = RouteProp<RootStackParamList, 'LedgerDetail'>;

type ActiveDialog = 'rename' | 'budget' | 'delete' | null;
type LoadState = 'loading' | 'error' | 'ready';

const SNACKBAR_AUTO_HIDE_MS = 1600;

/** 장부 상세: 수입/지출·예산 카드 캐러셀 + 거래 내역 목록 (검색/메뉴). */
function LedgerDetailScreen() {
  const navigation = useNavigation<LedgerDetailNavigationProp>();
  const route = useRoute<LedgerDetailRouteProp>();
  const ledgerId = route.params.ledgerId;

  const [ledger, setLedger] = useState<LedgerDetail | null>(null);
  const [entries, setEntries] = useState<EntrySummary[]>([]);
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

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const fieldOrGeneralError = (error: unknown, field: string): string => {
    if (error instanceof ApiError) {
      const fieldError = error.fieldErrors.find(fe => fe.field === field);
      return fieldError?.reason ?? getApiErrorMessage(error.code);
    }
    return toErrorMessage(error);
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [detail, firstPage] = await Promise.all([
        ledgerService.getLedgerDetail(ledgerId),
        entryService.getEntries(ledgerId, { page: 0 }),
      ]);
      setLedger(detail);
      setEntries(firstPage.items);
      setEntryPage(firstPage.page);
      setHasMoreEntries(!firstPage.last);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [ledgerId]);

  const loadMoreEntries = useCallback(async () => {
    if (isLoadingMore || !hasMoreEntries) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = await entryService.getEntries(ledgerId, {
        page: entryPage + 1,
      });
      setEntries(current => [...current, ...nextPage.items]);
      setEntryPage(nextPage.page);
      setHasMoreEntries(!nextPage.last);
    } catch {
      // 다음 페이지 실패는 조용히 무시한다 — 목록 끝에서 다시 스크롤하면 재시도된다.
    } finally {
      setIsLoadingMore(false);
    }
  }, [ledgerId, entryPage, isLoadingMore, hasMoreEntries]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const showSnackbar = (message: string) => {
    setSnackbar(message);
    setTimeout(() => setSnackbar(null), SNACKBAR_AUTO_HIDE_MS);
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

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
    setCardIndex(index);
  };

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <AppBar title="" onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'loading' ? LEDGER_DETAIL_LOADING : loadErrorMessage}
          </Text>
          {loadState === 'error' && (
            <Button label={LEDGER_DETAIL_RETRY_LABEL} onPress={load} hierarchy="secondary" style={{ alignSelf: 'center' }} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!ledger) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        title={ledger.name}
        onBackPress={() => navigation.goBack()}
        rightIcons={[
          {
            icon: SEARCH_ICON,
            onPress: () => navigation.navigate('LedgerSearch', { ledgerId }),
          },
          { icon: MENU_ICON, onPress: () => setMoreMenuVisible(true) },
        ]}
      />

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.carousel}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
      >
        <View style={styles.cardSlide}>
          <AmountCard
            type="incomeExpense"
            income={ledger.totalIncome}
            expense={ledger.totalExpense}
          />
        </View>
        <View style={styles.cardSlide}>
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

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{LEDGER_LIST_EMPTY_TITLE}</Text>
          <Text style={styles.emptySubtitle}>{LEDGER_LIST_EMPTY_SUBTITLE}</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.4}
          onEndReached={loadMoreEntries}
          ListFooterComponent={
            isLoadingMore ? (
              <Text style={styles.loadingMoreText}>{LEDGER_ENTRIES_LOADING_MORE}</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TransactionListItem
              label={item.occurredOn}
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
          )}
        />
      )}

      {snackbar && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={snackbar} />
        </View>
      )}

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
        textFieldError={dialogError}
        confirmLabel={dialogConfig.confirmLabel}
        destructive={activeDialog === 'delete'}
        confirmDisabled={isSubmittingDialog}
        onCancel={closeDialog}
        onConfirm={handleConfirmDialog}
      />
    </SafeAreaView>
  );
}

/** 숫자만 남기고 999,999,999(Ledger.txt 예산 상한)를 넘지 않게 자른다. */
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
        description: undefined,
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
  container: {
    flex: 1,
  },
  carousel: {
    flexGrow: 0,
    marginTop: 16,
    paddingLeft: 24,
  },
  cardSlide: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  indicatorRow: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 24,
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
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default LedgerDetailScreen;
