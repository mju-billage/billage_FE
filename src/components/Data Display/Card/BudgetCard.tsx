import { StyleSheet, Text, View } from 'react-native';
import ProgressBar from '../../Feedback/Progress Bar/ProgressBar';
import Divider from '../Divider/Divider';
import {
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../../constants/colors';

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
      <View style={styles.card}>
        <Text style={styles.emptyMessage}>
          {props.emptyMessage ??
            '예산을 설정하고 장부를 체계적으로 관리해보세요!'}
        </Text>
      </View>
    );
  }

  const { remainingBudget, expense, budget } = props;
  const ratio = budget > 0 ? Math.min(expense / budget, 1) : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.remainingTitle}>
        남은 예산 {remainingBudget.toLocaleString()}원
      </Text>
      <View style={styles.dividerWrapper}>
        <Divider />
      </View>
      <View style={styles.statRow}>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>지출</Text>
          <Text style={styles.statValue}>-{expense.toLocaleString()}원</Text>
        </View>
        <View style={styles.statDividerWrapper}>
          <Divider orientation="vertical" />
        </View>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>예산</Text>
          <Text style={styles.statValue}>{budget.toLocaleString()}원</Text>
        </View>
      </View>
      <ProgressBar progress={ratio} showLabel />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 12,
    padding: 16,
  },
  emptyMessage: {
    fontSize: 13,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'center',
    paddingVertical: 24,
  },
  remainingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    fontSize: 12,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default BudgetCard;
