import { StyleSheet, Text, View } from 'react-native';
import ProgressBar from '../../Feedback/Progress Bar/ProgressBar';
import Divider from '../Divider/Divider';
import CardBase from './CardBase';
import { formatExpense, formatWon } from '../../../utils/currency';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type BudgetCardProps =
  | { state: 'empty'; emptyMessage?: string }
  | {
      state?: 'default';
      remainingBudget: number;
      expense: number;
      budget: number;
    };

/** 남은 예산과 지출/예산 진행률을 보여주는 카드. 예산 미설정 시 안내 문구만 표시한다. */
function BudgetCard(props: BudgetCardProps) {
  if (props.state === 'empty') {
    return (
      <CardBase>
        <Text style={styles.emptyMessage}>
          {props.emptyMessage ??
            '예산을 설정하고 장부를 체계적으로 관리해보세요!'}
        </Text>
      </CardBase>
    );
  }

  const { remainingBudget, expense, budget } = props;
  const ratio = budget > 0 ? Math.min(expense / budget, 1) : 0;

  return (
    <CardBase>
      <Text style={styles.remainingTitle}>
        남은 예산 {formatWon(remainingBudget)}원
      </Text>
      <View style={styles.dividerWrapper}>
        <Divider />
      </View>
      <View style={styles.statRow}>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>지출</Text>
          <Text style={styles.statValue}>{formatExpense(expense)}</Text>
        </View>
        <View style={styles.statDividerWrapper}>
          <Divider orientation="vertical" />
        </View>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>예산</Text>
          <Text style={styles.statValue}>{formatWon(budget)}원</Text>
        </View>
      </View>
      <ProgressBar progress={ratio} showLabel />
    </CardBase>
  );
}

const styles = StyleSheet.create({
  emptyMessage: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'center',
    paddingVertical: 24,
  },
  remainingTitle: {
    ...TYPOGRAPHY.h3,
  },
  dividerWrapper: {
    marginVertical: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  statColumn: {
    flex: 1,
    gap: 4,
  },
  statDividerWrapper: {
    marginHorizontal: 16,
  },
  statLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  statValue: {
    ...TYPOGRAPHY.subtitle3,
  },
});

export default BudgetCard;
