import { Image, StyleSheet, Text, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FEEDBACK_NEGATIVE_BOLD,
  FEEDBACK_NEGATIVE_SUBTLE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../constants/colors';

const MEMBER_ICON = require('../../assets/icons/user/Member.png');
const MONEY_ICON = require('../../assets/icons/content/Money.png');

type DuesStatusCardProps = {
  title: string;
  dDayLabel: string;
  paidMemberCount: number;
  totalMemberCount: number;
  paidAmount: number;
  totalAmount: number;
  periodStart: string;
  periodEnd: string;
  ledgerName: string;
  duesAmount: number;
};

/** 회비가 모이기까지의 현황과 납부 기간/장부 정보를 함께 보여주는 점선 카드. */
function DuesStatusCard({
  title,
  dDayLabel,
  paidMemberCount,
  totalMemberCount,
  paidAmount,
  totalAmount,
  periodStart,
  periodEnd,
  ledgerName,
  duesAmount,
}: DuesStatusCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.dDayBadge}>
          <Text style={styles.dDayBadgeText}>{dDayLabel}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Image source={MEMBER_ICON} style={styles.icon} />
          <Text style={styles.summaryText}>
            {paidMemberCount}/{totalMemberCount}명
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Image source={MONEY_ICON} style={styles.icon} />
          <Text style={styles.summaryTextBlue}>
            {paidAmount.toLocaleString()}/{totalAmount.toLocaleString()}원
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>납부 기간</Text>
        <Text style={styles.fieldValue}>
          {periodStart} ~ {periodEnd}
        </Text>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>장부</Text>
        <Text style={styles.fieldValue}>{ledgerName}</Text>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>회비 금액</Text>
        <Text style={styles.fieldValue}>{duesAmount.toLocaleString()}원</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 12,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  dDayBadge: {
    backgroundColor: FEEDBACK_NEGATIVE_SUBTLE,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dDayBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    width: 14,
    height: 14,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  summaryText: {
    fontSize: 13,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  summaryTextBlue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: FOREGROUND_SECONDARY,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_NEUTRAL_NORMAL,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  fieldLabel: {
    fontSize: 13,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default DuesStatusCard;
