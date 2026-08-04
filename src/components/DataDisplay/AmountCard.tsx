import { StyleSheet, Text, View } from 'react-native';
import { BORDER_NEUTRAL, LINK_BLUE } from '../../constants/colors';

type AmountCardProps =
  | { type: 'incomeExpense'; income: number; expense: number }
  | { type: 'balance'; startBalance: number; endBalance: number }
  | { type: 'income'; income: number; incomeCount: number }
  | { type: 'expense'; expense: number; expenseCount: number };

/** 라벨+금액 행이 반복되고 합계가 나오는 금액 요약 카드. */
function AmountCard(props: AmountCardProps) {
  const rows = getRows(props);
  const total = getTotal(props);

  return (
    <View style={styles.card}>
      {rows.map(row => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={[styles.value, row.positive && styles.valuePositive]}>
            {row.value}
          </Text>
        </View>
      ))}
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.totalLabel}>{total.label}</Text>
        <Text style={styles.totalValue}>{total.value}</Text>
      </View>
    </View>
  );
}

function formatWon(amount: number) {
  return `${amount.toLocaleString()}원`;
}

function getRows(props: AmountCardProps) {
  switch (props.type) {
    case 'incomeExpense':
      return [
        { label: '수입', value: `+${formatWon(props.income)}`, positive: true },
        {
          label: '지출',
          value: `-${formatWon(props.expense)}`,
          positive: false,
        },
      ];
    case 'balance':
      return [
        {
          label: '시작잔액',
          value: formatWon(props.startBalance),
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
      return { label: '합계', value: formatWon(props.income - props.expense) };
    case 'balance':
      return { label: '최종잔액', value: formatWon(props.endBalance) };
    case 'income':
      return { label: '수입', value: formatWon(props.income) };
    case 'expense':
      return { label: '지출', value: formatWon(props.expense) };
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    color: '#868E96',
  },
  value: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  valuePositive: {
    color: LINK_BLUE,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_NEUTRAL,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AmountCard;
