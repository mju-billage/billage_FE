import { StyleSheet, Text, View } from 'react-native';
import CardBase from './CardBase';
import Divider from '../Divider/Divider';
import { formatExpense, formatWon } from '../../../utils/currency';
import { FEEDBACK_POSITIVE_BOLD, FOREGROUND_NEUTRAL_SUBTLE } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type AmountCardProps = (
  | { type: 'incomeExpense'; income: number; expense: number }
  | { type: 'balance'; startBalance: number; endBalance: number }
  | { type: 'income'; income: number; incomeCount: number }
  | { type: 'expense'; expense: number; expenseCount: number }
) & {
  showTotal?: boolean;
};

function AmountCard(props: AmountCardProps) {
  const { showTotal = true } = props;
  const rows = getRows(props);
  const total = getTotal(props);

  return (
    <CardBase>
      {rows.map(row => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={[styles.value, row.positive && styles.valuePositive]}>
            {row.value}
          </Text>
        </View>
      ))}
      {showTotal && (
        <>
          {props.type === 'incomeExpense' && (
            <View style={styles.dividerWrapper}>
              <Divider variant="dashed" />
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>{total.label}</Text>
            <Text style={styles.value}>{total.value}</Text>
          </View>
        </>
      )}
    </CardBase>
  );
}

function getRows(props: AmountCardProps) {
  switch (props.type) {
    case 'incomeExpense':
      return [
        { label: '수입', value: `${formatWon(props.income)}원`, positive: true },
        {
          label: '지출',
          value: formatExpense(props.expense),
          positive: false,
        },
      ];
    case 'balance':
      return [
        {
          label: '시작 잔액',
          value: `${formatWon(props.startBalance)}원`,
          positive: false,
        },
      ];
    case 'income':
      return [
        { label: '수입건수', value: `${props.incomeCount}건`, positive: false },
      ];
    case 'expense':
      return [
        {
          label: '지출건수',
          value: `${props.expenseCount}건`,
          positive: false,
        },
      ];
  }
}

function getTotal(props: AmountCardProps) {
  switch (props.type) {
    case 'incomeExpense':
      return { label: '합계', value: `${formatWon(props.income - props.expense)}원` };
    case 'balance':
      return { label: '최종 잔액', value: `${formatWon(props.endBalance)}원` };
    case 'income':
      return { label: '수입', value: `${formatWon(props.income)}원` };
    case 'expense':
      return { label: '지출', value: `${formatWon(props.expense)}원` };
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  value: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
  },
  valuePositive: {
    color: FEEDBACK_POSITIVE_BOLD,
  },
  dividerWrapper: {
    marginVertical: 8,
  },
});

export default AmountCard;
