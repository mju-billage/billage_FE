import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/BackButton';
import IconButton from '../../components/Button/IconButton';
import Thumbnail from '../../components/DataDisplay/Thumbnail';
import Dialog from '../../components/Feedback/Dialog';
import { deleteTransaction, getTransactionById } from '../../types/folder';
import {
  TRANSACTION_DATE_LABEL_EXPENSE,
  TRANSACTION_DATE_LABEL_INCOME,
  TRANSACTION_DELETE_CONFIRM_DESCRIPTION,
  TRANSACTION_DELETE_CONFIRM_LABEL,
  TRANSACTION_DELETE_CONFIRM_TITLE,
  TRANSACTION_DETAIL_TITLE,
  TRANSACTION_ITEM_NAME_LABEL,
  TRANSACTION_LEDGER_LABEL,
  TRANSACTION_MANAGER_LABEL,
  TRANSACTION_MEMO_LABEL,
  TRANSACTION_MEMO_PLACEHOLDER,
  TRANSACTION_RECEIPT_AMOUNT_LABEL,
  TRANSACTION_RECEIPT_DETAIL_LABEL,
  TRANSACTION_RECEIPT_ITEM_NAME_LABEL,
  TRANSACTION_RECEIPT_LABEL,
  TRANSACTION_RECEIPT_QUANTITY_LABEL,
  TRANSACTION_RECEIPT_TOTAL_LABEL,
} from '../../constants/ledgerScreenText';
import {
  BORDER_NEUTRAL_NORMAL,
  FEEDBACK_POSITIVE_BOLD,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';

const EDIT_ICON = require('../../assets/icons/action/Edit.png');
const DELETE_ICON = require('../../assets/icons/action/Close.png');

type TransactionDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionDetail'
>;
type TransactionDetailRouteProp = RouteProp<
  RootStackParamList,
  'TransactionDetail'
>;

/** 상세 내역 조회 전용 화면. 수정 아이콘은 노출만 하고(내역 추가/수정 기능이 앱에 아직 없음), 삭제만 동작한다. */
function TransactionDetailScreen() {
  const navigation = useNavigation<TransactionDetailNavigationProp>();
  const route = useRoute<TransactionDetailRouteProp>();
  const transaction = getTransactionById(route.params.transactionId);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  if (!transaction) {
    return null;
  }

  const isIncome = transaction.amount > 0;
  const receiptTotal = transaction.receiptLineItems?.reduce(
    (sum, line) => sum + line.amount,
    0,
  );

  const handleConfirmDelete = () => {
    deleteTransaction(transaction.id);
    setDeleteDialogVisible(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.title}>{TRANSACTION_DETAIL_TITLE}</Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon={EDIT_ICON}
            onPress={() => {}}
            accessibilityLabel="edit"
          />
          <IconButton
            icon={DELETE_ICON}
            onPress={() => setDeleteDialogVisible(true)}
            accessibilityLabel="delete"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.amount, isIncome && styles.amountPositive]}>
          {isIncome ? '+' : ''}
          {transaction.amount.toLocaleString()}원
        </Text>

        <Field
          label={
            isIncome
              ? TRANSACTION_DATE_LABEL_INCOME
              : TRANSACTION_DATE_LABEL_EXPENSE
          }
          value={transaction.date}
        />
        <Field
          label={TRANSACTION_ITEM_NAME_LABEL}
          value={transaction.itemName}
        />
        <Field label={TRANSACTION_MANAGER_LABEL} value={transaction.manager} />
        <Field
          label={TRANSACTION_LEDGER_LABEL}
          value={transaction.ledgerName}
        />
        <Field
          label={TRANSACTION_MEMO_LABEL}
          value={transaction.memo || TRANSACTION_MEMO_PLACEHOLDER}
        />

        {transaction.receiptImages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{TRANSACTION_RECEIPT_LABEL}</Text>
            <View style={styles.thumbnailRow}>
              {transaction.receiptImages.map(image => (
                <Thumbnail key={image} />
              ))}
            </View>
          </View>
        )}

        {transaction.receiptLineItems && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {TRANSACTION_RECEIPT_DETAIL_LABEL}
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderCell,
                    styles.tableNameCell,
                  ]}
                >
                  {TRANSACTION_RECEIPT_ITEM_NAME_LABEL}
                </Text>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                  {TRANSACTION_RECEIPT_QUANTITY_LABEL}
                </Text>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                  {TRANSACTION_RECEIPT_AMOUNT_LABEL}
                </Text>
              </View>
              {transaction.receiptLineItems.map(line => (
                <View key={line.name} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableNameCell]}>
                    {line.name}
                  </Text>
                  <Text style={styles.tableCell}>{line.quantity}</Text>
                  <Text style={styles.tableCell}>
                    {line.amount.toLocaleString()}원
                  </Text>
                </View>
              ))}
              <View style={styles.tableTotalRow}>
                <Text style={styles.tableTotalLabel}>
                  {TRANSACTION_RECEIPT_TOTAL_LABEL}
                </Text>
                <Text style={styles.tableTotalValue}>
                  {(receiptTotal ?? 0).toLocaleString()}원
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <Dialog
        visible={deleteDialogVisible}
        title={TRANSACTION_DELETE_CONFIRM_TITLE}
        description={TRANSACTION_DELETE_CONFIRM_DESCRIPTION}
        confirmLabel={TRANSACTION_DELETE_CONFIRM_LABEL}
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
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
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  amountPositive: {
    color: FEEDBACK_POSITIVE_BOLD,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER_NEUTRAL_NORMAL,
  },
  fieldLabel: {
    fontSize: 14,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: 'bold',
    flexShrink: 1,
    textAlign: 'right',
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  thumbnailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: FILL_NEUTRAL_NORMAL,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER_NEUTRAL_NORMAL,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  tableNameCell: {
    flex: 1.5,
    textAlign: 'left',
  },
  tableTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER_NEUTRAL_NORMAL,
  },
  tableTotalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  tableTotalValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default TransactionDetailScreen;
