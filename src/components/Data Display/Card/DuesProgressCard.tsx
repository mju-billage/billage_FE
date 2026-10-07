import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Badge from '../Badge/Badge';
import ProgressBar from '../../Feedback/Progress Bar/ProgressBar';
import { formatWon } from '../../../utils/currency';
import type { DuesProgress } from '../../../types/dashboard';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
  BASIC_0,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const MEMBER_ICON = require('../../../assets/icons/user/Member.png');
const CARD_WIDTH = 280;

type DuesProgressCardState = 'active' | 'upcoming' | 'ended';

type DateBadgeStatus = 'positive' | 'warning' | 'destructive' | 'neutral';

type DuesProgressCardProps = (
  | { type: 'dashboard'; progress: DuesProgress }
  | {
      type: 'paymentManagement';
      title: string;
      dateBadgeLabel: string;
      dateBadgeStatus?: DateBadgeStatus;
      paidMemberCount: number;
      totalMemberCount: number;
      paidAmount: number;
      totalAmount: number;
      progressRatio: number;
    }
) & {
  state?: DuesProgressCardState;
  onPress?: () => void;
  fullWidth?: boolean;
};

function DuesProgressCard(props: DuesProgressCardProps) {
  const state = props.state ?? 'active';
  const inner =
    props.type === 'paymentManagement' ? (
      <PaymentManagementCard {...props} state={state} />
    ) : (
      <DashboardCard progress={props.progress} state={state} />
    );

  if (!props.onPress) {
    return inner;
  }
  return <Pressable onPress={props.onPress}>{inner}</Pressable>;
}

function DateBadge({
  label,
  state,
  activeStatus,
}: {
  label: string;
  state: DuesProgressCardState;
  activeStatus: DateBadgeStatus;
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
        <DateBadge label={progress.dDayLabel} state={state} activeStatus="destructive" />
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
      <ProgressBar
        progress={progress.progressRatio}
        muted={ended}
        trackColor={BORDER_NEUTRAL_NORMAL}
      />
    </View>
  );
}

type PaymentManagementCardProps = Extract<
  DuesProgressCardProps,
  { type: 'paymentManagement' }
> & { state: DuesProgressCardState; fullWidth?: boolean };

function PaymentManagementCard({
  title,
  dateBadgeLabel,
  dateBadgeStatus = 'neutral',
  paidMemberCount,
  totalMemberCount,
  paidAmount,
  totalAmount,
  progressRatio,
  state,
  fullWidth = false,
}: PaymentManagementCardProps) {
  const ended = state === 'ended';
  return (
    <View style={[styles.card, fullWidth && styles.cardFullWidth, ended && styles.cardEnded]}>
      <View style={styles.badgeRow}>
        <Text style={[styles.groupName, ended && styles.textEnded]}>
          {title}
        </Text>
        <DateBadge label={dateBadgeLabel} state={state} activeStatus={dateBadgeStatus} />
      </View>
      <View style={styles.paymentSummaryRow}>
        <View style={styles.paymentSummaryColumn}>
          <Text style={[styles.paymentSummaryText, ended && styles.textEnded]}>
            {paidMemberCount}/{totalMemberCount}명
          </Text>
        </View>
        <Text style={[styles.paymentSummaryAmount, ended && styles.textEnded]}>
          {formatWon(paidAmount)} / {formatWon(totalAmount)}
        </Text>
      </View>
      <ProgressBar
        progress={progressRatio}
        muted={ended}
        trackColor={BORDER_NEUTRAL_NORMAL}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BASIC_0,
    borderRadius: 8,
    width: CARD_WIDTH,
    padding: 16,
  },
  cardFullWidth: {
    width: '100%',
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
    ...TYPOGRAPHY.body3,
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
    ...TYPOGRAPHY.subtitle3,
  },
  description: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  highlightDescription: {
    ...TYPOGRAPHY.h2,
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
    ...TYPOGRAPHY.body3,
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
    ...TYPOGRAPHY.subtitle3,
  },
  paymentSummaryAmount: {
    ...TYPOGRAPHY.body2,
  },
});

export default DuesProgressCard;
