import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Badge from '../Badge/Badge';
import { CALENDAR_APPROVAL_BADGE_LABEL } from '../../../constants/calendarScreenText';
import { formatWon } from '../../../utils/currency';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const RECEIPT_ICON = require('../../../assets/icons/content/Report.png');

type TransactionListItemProps = {
  /** 왼쪽 위 작은 라벨. 캘린더에서는 장부명, 장부 상세/검색에서는 날짜로 쓰인다. */
  label: string;
  itemName: string;
  amount: number;
  hasReceipt?: boolean;
  isPendingApproval?: boolean;
  onPress?: () => void;
};

/** 거래 내역 한 줄. 위 슬롯엔 승인요청 뱃지 또는 영수증 아이콘 중 하나만 나온다.
 * 눌린 상태는 웹에서는 호버로 대신 보여준다. */
function TransactionListItem({
  label,
  itemName,
  amount,
  hasReceipt = false,
  isPendingApproval = false,
  onPress,
}: TransactionListItemProps) {
  const [hovered, setHovered] = useState(false);
  const isIncome = amount > 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        (pressed || hovered) && styles.containerActive,
      ]}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <View style={styles.leftColumn}>
        <Text style={styles.groupName}>{label}</Text>
        <Text style={styles.itemName}>{itemName}</Text>
      </View>
      <View style={styles.rightColumn}>
        {isPendingApproval ? (
          <View>
            <Badge label={CALENDAR_APPROVAL_BADGE_LABEL} status="warning" />
          </View>
        ) : hasReceipt ? (
          <Image source={RECEIPT_ICON} style={styles.receiptIcon} />
        ) : null}
        <Text style={[styles.amount, isIncome && styles.amountIncome]}>
          {formatWon(amount)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: -12,
  },
  containerActive: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  leftColumn: {
    gap: 4,
  },
  groupName: {
    ...TYPOGRAPHY.caption,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  itemName: {
    ...TYPOGRAPHY.subtitle3,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  receiptIcon: {
    width: 18,
    height: 18,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  amount: {
    ...TYPOGRAPHY.subtitle3,
  },
  amountIncome: {
    color: FOREGROUND_SECONDARY,
  },
});

export default TransactionListItem;
