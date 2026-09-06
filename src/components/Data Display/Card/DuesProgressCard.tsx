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
      /** D-day 배지 색상('active' 상태에서만 적용) — 기본 'neutral'(기존 동작 유지).
       * DUE 목록(DUE-1-PAGE-01-0)의 마감 임박도별 색 구분에 쓴다. */
      dateBadgeStatus?: DateBadgeStatus;
      paidMemberCount: number;
      totalMemberCount: number;
      paidAmount: number;
      totalAmount: number;
      progressRatio: number;
    }
) & {
  state?: DuesProgressCardState;
  /** 카드 전체를 누를 수 있게 한다(예: DUE-1-PAGE-01-0 목록 → 상세 이동). */
  onPress?: () => void;
  /** true면 가로 캐러셀용 고정 폭(280) 대신 부모 너비에 맞춘다(세로 리스트용). */
  fullWidth?: boolean;
};

/**
 * 회비 모금 진행 현황 카드. 대시보드용(dashboard)과 수납관리용(paymentManagement) 두 레이아웃을 지원한다.
 * `state='upcoming'`이면 D-day 배지 대신 시작일을 텍스트로, `state='ended'`면 회색 카드로 종료를 표시한다.
 *
 * 검증 중 "진행률 바가 안 보인다"는 [결함]이 나왔다 — 카드가 흰 배경 위에 얹혀
 * ProgressBar 기본 트랙색(FILL_NEUTRAL_NORMAL, #F3F4F6)과 대비가 거의 없어서
 * 생긴 문제였다(로직/데이터는 정상 — progressRatio 계산과 채움 폭 자체는
 * 문제 없음). ProgressBar에 추가한 `trackColor`로 여기서만 더 진한
 * BORDER_NEUTRAL_NORMAL(#E5E7EB)을 준다 — 이 화면(DUE-1-PAGE-01-0) 시안은
 * 퍼센트 숫자 없이 바만(+인원/금액 텍스트) 보여주므로 `showLabel`은 그대로 둔다.
 */
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
          <Image
            source={MEMBER_ICON}
            style={[styles.memberIcon, ended && styles.iconEnded]}
          />
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
