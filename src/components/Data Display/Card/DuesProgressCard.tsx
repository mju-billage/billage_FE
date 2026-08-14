import { Image, StyleSheet, Text, View } from 'react-native';
import Badge from '../Badge/Badge';
import ProgressBar from '../../Feedback/Progress Bar/ProgressBar';
import type { DuesProgress } from '../../../types/dashboard';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../../constants/colors';

const MEMBER_ICON = require('../../../assets/icons/user/Member.png');
const CARD_WIDTH = 280;

type DuesProgressCardState = 'active' | 'upcoming' | 'ended';

type DuesProgressCardProps = (
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
    }
) & { state?: DuesProgressCardState };

/**
 * 회비 모금 진행 현황 카드. 대시보드용(dashboard)과 수납관리용(paymentManagement) 두 레이아웃을 지원한다.
 * `state='upcoming'`이면 D-day 배지 대신 시작일을 텍스트로, `state='ended'`면 회색 카드로 종료를 표시한다.
 */
function DuesProgressCard(props: DuesProgressCardProps) {
  const state = props.state ?? 'active';
  if (props.type === 'paymentManagement') {
    return <PaymentManagementCard {...props} state={state} />;
  }
  return <DashboardCard progress={props.progress} state={state} />;
}

function DateBadge({
  label,
  state,
  activeStatus,
}: {
  label: string;
  state: DuesProgressCardState;
  activeStatus: 'positive' | 'neutral';
}) {
  if (state === 'upcoming') {
    return <Text style={styles.upcomingDate}>{label}</Text>;
  }
  return (
    <Badge label={label} status={state === 'ended' ? 'neutral' : activeStatus} />
  );
}

function DashboardCard({
  progress,
  state,
}: {
  progress: DuesProgress;
  state: DuesProgressCardState;
}) {
  const ended = state === 'ended';
  return (
    <View style={[styles.card, ended && styles.cardEnded]}>
      <View style={styles.badgeRowStart}>
        <DateBadge label={progress.dDayLabel} state={state} activeStatus="positive" />
        <Text style={[styles.groupName, ended && styles.textEnded]}>
          {progress.groupName}
        </Text>
      </View>
      <Text style={[styles.description, ended && styles.textEnded]}>
        {progress.description}
      </Text>
      <Text style={[styles.highlightDescription, ended && styles.textEnded]}>
        {progress.highlightDescription}
      </Text>
      <View style={styles.progressFooter}>
        <Image
          source={MEMBER_ICON}
          style={[styles.memberIcon, ended && styles.iconEnded]}
        />
        <Text style={[styles.memberCountText, ended && styles.textEnded]}>
          {progress.paidMemberCount}/{progress.totalMemberCount}
        </Text>
      </View>
      <ProgressBar progress={progress.progressRatio} muted={ended} />
    </View>
  );
}

type PaymentManagementCardProps = Extract<
  DuesProgressCardProps,
  { type: 'paymentManagement' }
> & { state: DuesProgressCardState };

function PaymentManagementCard({
  title,
  dateBadgeLabel,
  paidMemberCount,
  totalMemberCount,
  paidAmount,
  totalAmount,
  progressRatio,
  state,
}: PaymentManagementCardProps) {
  const ended = state === 'ended';
  return (
    <View style={[styles.card, ended && styles.cardEnded]}>
      <View style={styles.badgeRow}>
        <Text style={[styles.groupName, ended && styles.textEnded]}>
          {title}
        </Text>
        <DateBadge label={dateBadgeLabel} state={state} activeStatus="neutral" />
      </View>
      <View style={styles.paymentSummaryRow}>
        <View style={styles.paymentSummaryColumn}>
          <Image
            source={MEMBER_ICON}
            style={[styles.memberIcon, ended && styles.iconEnded]}
          />
          <Text style={[styles.paymentSummaryText, ended && styles.textEnded]}>
            {paidMemberCount}/{totalMemberCount}명
          </Text>
        </View>
        <Text style={[styles.paymentSummaryAmount, ended && styles.textEnded]}>
          {paidAmount.toLocaleString()}원 / {totalAmount.toLocaleString()}원
        </Text>
      </View>
      <ProgressBar progress={progressRatio} muted={ended} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    padding: 16,
  },
  cardEnded: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderRadius: 16,
  },
  textEnded: {
    color: FOREGROUND_DISABLED,
  },
  iconEnded: {
    tintColor: FOREGROUND_DISABLED,
  },
  upcomingDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  badgeRowStart: {
    flexDirection: 'row',
    alignItems: 'center',
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
  paymentSummaryAmount: {
    fontSize: 14,
    fontWeight: 'normal',
  },
});

export default DuesProgressCard;
