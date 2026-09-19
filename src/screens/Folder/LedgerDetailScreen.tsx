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
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

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

/** 장부 상세: 수입/지출·예산 카드 캐러셀 + 거래 내역 목록 (검색/메뉴). */
function LedgerDetailScreen() {
  const navigation = useNavigation<LedgerDetailNavigationProp>();
  const route = useRoute<LedgerDetailRouteProp>();
  const ledgerId = route.params.ledgerId;
  const { width: windowWidth } = useWindowDimensions();

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
  // 필터 값은 서버 조회 조건이다(`toEntryFilterQuery`). 화면이 포커스될 때마다 도는 `load()`가
  // 필터가 바뀔 때는 다시 돌면 안 돼서(전체 로딩 화면으로 돌아감) 최신 값을 ref로도 들고 있는다.
  const [filter, setFilter] = useState<LedgerFilterValue>(DEFAULT_LEDGER_FILTER);
  const filterRef = useRef<LedgerFilterValue>(DEFAULT_LEDGER_FILTER);
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
        entryService.getEntries(ledgerId, { ...toEntryFilterQuery(filterRef.current), page: 0 }),
      ]);
      setLedger(detail);
      setEntries(firstPage.items);
      setEntryTotal(firstPage.totalElements);
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
        ...toEntryFilterQuery(filter),
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
  }, [ledgerId, entryPage, isLoadingMore, hasMoreEntries, filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const showSnackbar = (message: string) => {
    setSnackbar(message);
    setTimeout(() => setSnackbar(null), SNACKBAR_AUTO_HIDE_MS);
  };

  /** 필터 적용: 카드·앱바는 그대로 두고 내역 목록만 새 조건으로 첫 페이지부터 다시 받는다. */
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
    } catch (error) {
      // 조회에 실패하면 목록은 그대로이므로 필터 값도 이전으로 되돌린다.
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

  // 시안: 날짜 그룹 헤더(`4월 16일 목요일`) 아래에 그날 내역 행들. 서버가 발생일 순으로 내려주므로
  // 받은 순서 그대로 같은 날짜끼리 묶는다.
  const sections = groupEntriesByDate(entries).map(group => ({
    title: formatDateHeader(group.date),
    data: group.items,
  }));

  // 캐러셀 스냅 결함 수정(2026-09-18): 이전엔 카드 폭(CARD_WIDTH = 화면폭-48)과
  // 스크롤뷰 자체의 paddingLeft(24, 우측엔 없음)가 서로 안 맞아 2페이지부터
  // 어긋났다(snapToInterval이 이 좌측 인셋을 계산에 안 넣었음, 첫 페이지는
  // 우연히 괜찮아 보였을 뿐). 각 슬라이드를 화면 폭 그대로(windowWidth) 채우고
  // 카드 여백은 슬라이드 안쪽 padding으로 옮겨서, pagingEnabled 기본 동작(뷰포트
  // 폭 단위 스냅)만으로 항상 정확히 맞게 했다 — snapToInterval도 더 이상 필요 없다.
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
      snackbar={snackbar ? <Snackbar visible title={snackbar} /> : undefined}
    >
      <AppBar
        title={ledger.name}
        onBackPress={() => navigation.goBack()}
        rightIcons={[{ icon: MENU_ICON, onPress: () => setMoreMenuVisible(true) }]}
      />

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

      <View style={styles.toolRow}>
        <Pressable
          onPress={() => setFilterSheetVisible(true)}
          hitSlop={8}
          accessibilityLabel="필터"
        >
          <Image source={FILTER_ICON} style={styles.toolIcon} />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('LedgerSearch', { ledgerId })}
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

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{LEDGER_LIST_EMPTY_TITLE}</Text>
          <Text style={styles.emptySubtitle}>{LEDGER_LIST_EMPTY_SUBTITLE}</Text>
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
              <Text style={styles.loadingMoreText}>{LEDGER_ENTRIES_LOADING_MORE}</Text>
            ) : null
          }
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
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
          )}
        />
      )}

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
  // 슬라이드 하나 = 화면 폭 전체(JSX에서 width: windowWidth로 덮어씀) — 카드
  // 여백은 스크롤뷰가 아니라 이 안쪽 padding으로 준다(캐러셀 스냅 결함 수정,
  // 2026-09-18).
  cardSlide: {
    paddingHorizontal: 24,
  },
  indicatorRow: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  // 시안: 카드 아래 한 줄 — 좌측 필터, 우측 검색.
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  toolIcon: {
    width: 24,
    height: 24,
  },
  countText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  // 12px+Bold 조합은 정식 스타일에 없어 body3+bold를 예외로 채택(내역 메인과 같은 헤더).
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
});

export default LedgerDetailScreen;
