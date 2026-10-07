import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Badge from '../Badge/Badge';
import { CALENDAR_APPROVAL_BADGE_LABEL } from '../../../constants/calendarScreenText';
import { formatExpense, formatWon } from '../../../utils/currency';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const RECEIPT_ICON = require('../../../assets/icons/content/Report.png');
const DUES_ICON = require('../../../assets/icons/content/Bill.png');

type TransactionListItemProps = {
  label?: string; 
  itemName: string;
  amount: number;
  hasReceipt?: boolean;
  isPendingApproval?: boolean;
  onPress?: () => void;
};

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
      <View style={styles.topRow}>
        {label ? <Text style={styles.groupName}>{label}</Text> : null}
        <View style={styles.statusSlot}>
          {isPendingApproval ? (
            <Badge label={CALENDAR_APPROVAL_BADGE_LABEL} status="warning" />
          ) : (
            <Image
              source={hasReceipt ? RECEIPT_ICON : DUES_ICON}
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.itemName}>{itemName}</Text>
        <Text style={[styles.amount, isIncome && styles.amountIncome]}>
          {amount < 0 ? formatExpense(-amount) : `${formatWon(Math.abs(amount))}원`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: -12,
  },
  containerActive: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupName: {
    ...TYPOGRAPHY.caption,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  statusSlot: {
    marginLeft: 'auto',
  },
  statusIcon: {
    width: 18,
    height: 18,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemName: {
    ...TYPOGRAPHY.subtitle3,
    flex: 1,
    fontFamily: TYPOGRAPHY.body3.fontFamily,
    fontWeight: 'bold',
  },
  amount: {
    ...TYPOGRAPHY.subtitle3,
    fontFamily: TYPOGRAPHY.body3.fontFamily,
    fontWeight: 'bold',
  },
  amountIncome: {
    color: FOREGROUND_SECONDARY,
  },
});

export default TransactionListItem;
