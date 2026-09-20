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
  /** 왼쪽 위 작은 라벨. 캘린더·내역 목록에서는 장부명, 장부 검색에서는 날짜로 쓰인다. 없으면 안 그린다
   * (장부 상세는 날짜 그룹 헤더가 날짜를 대신해서 라벨이 없다). */
  label?: string; 
  itemName: string;
  amount: number;
  hasReceipt?: boolean;
  isPendingApproval?: boolean;
  onPress?: () => void;
};

/** 거래 내역 두 줄. 윗줄: 장부명(왼) · 상태 슬롯(오른). 아랫줄: 내역명(왼) · 금액(오른), 둘 다 볼드.
 * 상태 슬롯은 승인요청 뱃지 > 영수증 아이콘 > 납부관리 아이콘(기본) 우선순위로 하나만 나온다.
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
  // 호출부가 지출을 -item.amount로 넘기므로 0원 지출은 -0이 된다 — `(-0).toLocaleString()`은
  // "-0"이라 Math.abs로 부호를 걷어낸다(0원은 수입/지출 모두 부호 없이 `0원`).

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
  // 라벨이 없어도(장부 상세) 배지/아이콘은 오른쪽 끝에 둔다.
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
  // Bold는 Regular와 같은 Family + fontWeight(typography.ts 머리 주석). subtitle3는 Semi-bold Family라
  // fontWeight만 올리면 굵어지지 않아 Regular Family(body3)로 바꿔 쓴다.
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
