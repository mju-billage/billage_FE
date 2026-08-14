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
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import IconButton from '../../components/Input/Button/IconButton';
import AmountCard from '../../components/Data Display/Card/AmountCard';
import BudgetCard from '../../components/Data Display/Card/BudgetCard';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import CarouselIndicator from '../../components/Navigation/Carousel Indicator/CarouselIndicator';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderMoreMenu from './FolderMoreMenu';
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import {
  getNodeById,
  getTransactionsByLedgerId,
  renameNode,
  setLedgerBudget,
  deleteLedgerNode,
  type LedgerNode,
  type LedgerTransaction,
} from '../../types/folder';
import {
  LEDGER_BUDGET_DIALOG_TITLE,
  LEDGER_BUDGET_PLACEHOLDER,
  LEDGER_BUDGET_SAVE_LABEL,
  LEDGER_DELETE_CONFIRM_LABEL,
  LEDGER_DELETE_DIALOG_DESCRIPTION,
  LEDGER_DELETE_DIALOG_TITLE,
  LEDGER_LIST_EMPTY_SUBTITLE,
  LEDGER_LIST_EMPTY_TITLE,
  LEDGER_MENU_BUDGET,
  LEDGER_MENU_DELETE,
  LEDGER_MENU_RENAME,
  LEDGER_RENAME_CONFIRM_LABEL,
  LEDGER_RENAME_DIALOG_TITLE,
  LEDGER_RENAME_PLACEHOLDER,
  LEDGER_NAME_MAX_LENGTH,
  SNACKBAR_LEDGER_DELETED_SUFFIX,
  SNACKBAR_LEDGER_RENAMED_PREFIX,
  SNACKBAR_LEDGER_RENAMED_SUFFIX,
} from '../../constants/ledgerScreenText';
import { SNACKBAR_BUDGET_SAVED } from '../../constants/folderScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';

const SEARCH_ICON = require('../../assets/icons/system/Search.png');
const MENU_ICON = require('../../assets/icons/action/MenuHorizontal.png');

const SNACKBAR_AUTO_HIDE_MS = 1600;
const CARD_WIDTH = Dimensions.get('window').width - 48;

type LedgerDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LedgerDetail'
>;
type LedgerDetailRouteProp = RouteProp<RootStackParamList, 'LedgerDetail'>;

type ActiveDialog = 'rename' | 'budget' | 'delete' | null;

/** 장부 상세: 수입/지출·예산 카드 캐러셀 + 거래 내역 목록 (검색/필터/메뉴). */
function LedgerDetailScreen() {
  const navigation = useNavigation<LedgerDetailNavigationProp>();
  const route = useRoute<LedgerDetailRouteProp>();
  const ledgerId = route.params.ledgerId;

  const [ledger, setLedger] = useState<LedgerNode | null>(
    () => (getNodeById(ledgerId) as LedgerNode) ?? null,
  );
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(() =>
    getTransactionsByLedgerId(ledgerId),
  );
  const [cardIndex, setCardIndex] = useState(0);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [dialogInputValue, setDialogInputValue] = useState('');
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLedger((getNodeById(ledgerId) as LedgerNode) ?? null);
    setTransactions(getTransactionsByLedgerId(ledgerId));
  }, [ledgerId]);

  useFocusEffect(refresh);

  if (!ledger) {
    return null;
  }

  const income = transactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const showSnackbar = (message: string) => {
    setSnackbar(message);
    setTimeout(() => setSnackbar(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setDialogInputValue('');
  };

  const menuItems: MenuItem[] = [
    { key: 'budget', label: LEDGER_MENU_BUDGET },
    { key: 'rename', label: LEDGER_MENU_RENAME },
    { key: 'delete', label: LEDGER_MENU_DELETE },
  ];

  const handleSelectMenu = (key: string) => {
    setMoreMenuVisible(false);
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
    if (activeDialog === 'rename') {
      const trimmed = dialogInputValue.trim();
      if (!trimmed) {
        return;
      }
      renameNode(ledgerId, trimmed);
      refresh();
      showSnackbar(
        `${SNACKBAR_LEDGER_RENAMED_PREFIX}${trimmed}${SNACKBAR_LEDGER_RENAMED_SUFFIX}`,
      );
      closeDialog();
    } else if (activeDialog === 'budget') {
      const parsed = Number(dialogInputValue.trim());
      if (!dialogInputValue.trim() || Number.isNaN(parsed)) {
        return;
      }
      setLedgerBudget(ledgerId, parsed);
      refresh();
      showSnackbar(SNACKBAR_BUDGET_SAVED);
      closeDialog();
    } else if (activeDialog === 'delete') {
      const name = ledger.name;
      deleteLedgerNode(ledgerId);
      showSnackbar(`'${name}'${SNACKBAR_LEDGER_DELETED_SUFFIX}`);
      closeDialog();
      setTimeout(() => navigation.goBack(), SNACKBAR_AUTO_HIDE_MS);
    }
  };

  const dialogConfig = getDialogConfig(activeDialog);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
    setCardIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.title} numberOfLines={1}>
            {ledger.name}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon={SEARCH_ICON}
            onPress={() => navigation.navigate('LedgerSearch', { ledgerId })}
          />
          <IconButton
            icon={MENU_ICON}
            onPress={() => setMoreMenuVisible(true)}
          />
        </View>
      </View>

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
          <AmountCard type="incomeExpense" income={income} expense={expense} />
        </View>
        <View style={styles.cardSlide}>
          {ledger.budget ? (
            <BudgetCard
              remainingBudget={ledger.budget - expense}
              expense={expense}
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

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{LEDGER_LIST_EMPTY_TITLE}</Text>
          <Text style={styles.emptySubtitle}>{LEDGER_LIST_EMPTY_SUBTITLE}</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TransactionListItem
              label={item.date}
              itemName={item.itemName}
              amount={item.amount}
              hasReceipt={item.receiptImages.length > 0}
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
        onChangeTextField={text =>
          setDialogInputValue(
            activeDialog === 'rename'
              ? text.slice(0, LEDGER_NAME_MAX_LENGTH)
              : text.replace(/[^0-9]/g, ''),
          )
        }
        textFieldPlaceholder={dialogConfig.placeholder}
        textFieldKeyboardType={
          activeDialog === 'budget' ? 'number-pad' : undefined
        }
        confirmLabel={dialogConfig.confirmLabel}
        onCancel={closeDialog}
        onConfirm={handleConfirmDialog}
      />
    </View>
  );
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
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  carousel: {
    flexGrow: 0,
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
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default LedgerDetailScreen;
