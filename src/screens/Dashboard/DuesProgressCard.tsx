import { StyleSheet, Text, View } from 'react-native';
import type { DuesProgress } from '../../types/dashboard';
import {
  ERROR_RED,
  FILL_NEUTRAL,
  LINK_BLUE,
  NEGATIVE_BADGE_BG,
} from '../../constants/colors';

const CARD_WIDTH = 280;

type DuesProgressCardProps = {
  progress: DuesProgress;
};

/** 회비 모금 진행 현황을 보여주는 가로 스크롤 카드. */
function DuesProgressCard({ progress }: DuesProgressCardProps) {
  const progressPercent: `${number}%` = `${Math.round(
    progress.progressRatio * 100,
  )}%`;

  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <View style={styles.dDayBadge}>
          <Text style={styles.dDayBadgeText}>{progress.dDayLabel}</Text>
        </View>
        <Text style={styles.groupName}>{progress.groupName}</Text>
      </View>
      <Text style={styles.description}>{progress.description}</Text>
      <Text style={styles.highlightDescription}>
        {progress.highlightDescription}
      </Text>
      <View style={styles.progressFooter}>
        <Text style={styles.memberCountText}>
          {progress.paidMemberCount}/{progress.totalMemberCount}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressPercent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dDayBadge: {
    backgroundColor: NEGATIVE_BADGE_BG,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dDayBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: ERROR_RED,
  },
  groupName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 13,
    color: '#868E96',
  },
  highlightDescription: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 12,
  },
  progressFooter: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  memberCountText: {
    fontSize: 12,
    color: '#868E96',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: FILL_NEUTRAL,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: LINK_BLUE,
  },
});

export default DuesProgressCard;
