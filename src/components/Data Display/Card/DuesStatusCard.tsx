import { Image, StyleSheet, Text, View } from 'react-native';
import Badge from '../Badge/Badge';
import Divider from '../Divider/Divider';
import CardBase from './CardBase';
import { formatWon } from '../../../utils/currency';
import {
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const MEMBER_ICON = require('../../../assets/icons/user/Member.png');
const MONEY_ICON = require('../../../assets/icons/content/Money.png');

type DuesStatusCardProps = {
  title: string;
  dDayLabel: string;
  /** D-day 배지 색상. 회비 상세(DUE-2-PAGE-03-0류)는 상태에 따라 다른 색이 필요하다
   * (진행 중=위험도별 색, 마감/예정=중립) — 기본값은 기존 호출부 동작을 유지한다. */
  badgeStatus?: 'positive' | 'warning' | 'destructive' | 'neutral';
  paidMemberCount: number;
  totalMemberCount: number;
  paidAmount: number;
  totalAmount: number;
  periodStart: string;
  periodEnd: string;
  ledgerName: string;
  duesAmount: number;
};

/** 회비 납부 현황(인원/금액)과 납부 기간/장부 정보를 함께 보여주는 점선 카드. */
function DuesStatusCard({
  title,
  dDayLabel,
  badgeStatus = 'positive',
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
    <CardBase variant="dashed">
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Badge label={dDayLabel} status={badgeStatus} />
      </View>

      <View style={styles.statusSection}>
        <View style={styles.summaryItem}>
          <Image source={MEMBER_ICON} style={styles.icon} />
          <Text style={styles.summaryDenominator}>
            <Text style={styles.summaryHighlight}>{paidMemberCount}</Text> /{' '}
            {totalMemberCount}명
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Image source={MONEY_ICON} style={styles.icon} />
          <Text style={styles.summaryDenominator}>
            <Text style={styles.summaryHighlight}>
              {paidAmount.toLocaleString()}
            </Text>{' '}
            / {formatWon(totalAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.periodColumn}>
        <Text style={styles.fieldLabel}>납부 기간</Text>
        <Text style={styles.fieldValue}>
          {periodStart} ~ {periodEnd}
        </Text>
      </View>

      <View style={styles.twoColumnRow}>
        <View style={styles.twoColumn}>
          <Text style={styles.fieldLabel}>장부</Text>
          <Text style={styles.fieldValue}>{ledgerName}</Text>
        </View>
        <View style={styles.columnDividerWrapper}>
          <Divider orientation="vertical" />
        </View>
        <View style={styles.twoColumn}>
          <Text style={styles.fieldLabel}>회비 금액</Text>
          <Text style={styles.fieldValue}>{formatWon(duesAmount)}</Text>
        </View>
      </View>
    </CardBase>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_PRIMARY,
  },
  statusSection: {
    gap: 8,
    marginBottom: 28,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  summaryDenominator: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  summaryHighlight: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_SECONDARY,
  },
  periodColumn: {
    gap: 4,
    marginBottom: 16,
  },
  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  twoColumn: {
    flex: 1,
    gap: 4,
  },
  columnDividerWrapper: {
    marginHorizontal: 16,
  },
  fieldLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  fieldValue: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_PRIMARY,
  },
});

export default DuesStatusCard;
