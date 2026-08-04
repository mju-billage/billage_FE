import { Image, StyleSheet, Text, View } from 'react-native';
import Badge from './Badge';
import ProgressBar from '../Feedback/ProgressBar';
import type { DuesProgress } from '../../types/dashboard';
import {
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';

const MEMBER_ICON = require('../../assets/icons/user/Member.png');
const CARD_WIDTH = 280;

type DuesProgressCardProps =
  | { type: 'dashboard'; progress: DuesProgress }
  | {
      type: 'paymentManagement';
      title: string;
      dateBadgeLabel: string;
      paidMemberCount: number;
      totalMemberCount: number;
      paidAmount: number;
      totalAmount: number;
      progressRatio: number;
    };

/** 회비 모금 진행 현황 카드. 대시보드용(dashboard)과 수납관리용(paymentManagement) 두 레이아웃을 지원한다. */
function DuesProgressCard(props: DuesProgressCardProps) {
  if (props.type === 'paymentManagement') {
    return <PaymentManagementCard {...props} />;
  }
  return <DashboardCard progress={props.progress} />;
}

function DashboardCard({ progress }: { progress: DuesProgress }) {
  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <Badge label={progress.dDayLabel} status="destructive" />
        <Text style={styles.groupName}>{progress.groupName}</Text>
      </View>
      <Text style={styles.description}>{progress.description}</Text>
      <Text style={styles.highlightDescription}>
        {progress.highlightDescription}
      </Text>
      <View style={styles.progressFooter}>
        <Image source={MEMBER_ICON} style={styles.memberIcon} />
        <Text style={styles.memberCountText}>
          {progress.paidMemberCount}/{progress.totalMemberCount}
        </Text>
      </View>
      <ProgressBar progress={progress.progressRatio} />
    </View>
  );
}

type PaymentManagementCardProps = Extract<
  DuesProgressCardProps,
  { type: 'paymentManagement' }
>;

function PaymentManagementCard({
  title,
  dateBadgeLabel,
  paidMemberCount,
  totalMemberCount,
  paidAmount,
  totalAmount,
  progressRatio,
}: PaymentManagementCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <Text style={styles.groupName}>{title}</Text>
        <Badge label={dateBadgeLabel} status="neutral" />
      </View>
      <View style={styles.paymentSummaryRow}>
        <View style={styles.paymentSummaryColumn}>
          <Image source={MEMBER_ICON} style={styles.memberIcon} />
          <Text style={styles.paymentSummaryText}>
            {paidMemberCount}/{totalMemberCount}명
          </Text>
        </View>
        <Text style={styles.paymentSummaryText}>
          {paidAmount.toLocaleString()}원 / {totalAmount.toLocaleString()}원
        </Text>
      </View>
      <ProgressBar progress={progressRatio} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 16,
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  groupName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 13,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  highlightDescription: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 12,
  },
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginBottom: 8,
  },
  memberIcon: {
    width: 14,
    height: 14,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  memberCountText: {
    fontSize: 12,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentSummaryColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentSummaryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DuesProgressCard;
