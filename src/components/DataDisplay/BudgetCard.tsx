import { StyleSheet, Text, View } from 'react-native';
import ProgressBar from '../Feedback/ProgressBar';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';

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
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.rowLabel}>지출 {expense.toLocaleString()}원</Text>
        <Text style={styles.rowLabel}>예산 {budget.toLocaleString()}원</Text>
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
  divider: {
    height: 1,
    backgroundColor: BORDER_NEUTRAL_NORMAL,
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default BudgetCard;
