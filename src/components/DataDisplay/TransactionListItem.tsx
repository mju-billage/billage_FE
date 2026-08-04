import { Image, StyleSheet, Text, View } from 'react-native';
import type { CalendarTransaction } from '../../types/calendar';
import { CALENDAR_APPROVAL_BADGE_LABEL } from '../../constants/calendarScreenText';
import {
  FILL_NEUTRAL,
  NAVY,
  WARNING_BADGE_BG,
  WARNING_BADGE_TEXT,
} from '../../constants/colors';

const RECEIPT_ICON = require('../../assets/icons/content/Bill.png');

type TransactionListItemProps = {
  transaction: CalendarTransaction;
};

/** 캘린더에서 선택한 날짜의 거래 내역 한 줄. */
function TransactionListItem({ transaction }: TransactionListItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={styles.groupBadge}>
          <Text style={styles.groupBadgeText}>{transaction.groupName}</Text>
        </View>
        <Text style={styles.itemName}>{transaction.itemName}</Text>
      </View>
      <View style={styles.rightColumn}>
        {transaction.isPendingApproval && (
          <View style={styles.approvalBadge}>
            <Text style={styles.approvalBadgeText}>
              {CALENDAR_APPROVAL_BADGE_LABEL}
            </Text>
          </View>
        )}
        {transaction.hasReceipt && (
          <Image source={RECEIPT_ICON} style={styles.receiptIcon} />
        )}
        <Text style={styles.amount}>
          {transaction.amount > 0 ? '+' : ''}
          {transaction.amount.toLocaleString()}원
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  leftColumn: {
    gap: 4,
  },
  groupBadge: {
    alignSelf: 'flex-start',
    backgroundColor: FILL_NEUTRAL,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  groupBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#495057',
  },
  itemName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  approvalBadge: {
    backgroundColor: WARNING_BADGE_BG,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  approvalBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: WARNING_BADGE_TEXT,
  },
  receiptIcon: {
    width: 18,
    height: 18,
    tintColor: NAVY,
  },
  amount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default TransactionListItem;
