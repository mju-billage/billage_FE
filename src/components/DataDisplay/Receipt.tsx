import { StyleSheet, Text, View } from 'react-native';
import { FILL_NEUTRAL, LINK_BLUE } from '../../constants/colors';

type ReceiptItem = {
  name: string;
  quantity: number;
  amount: number;
};

type ReceiptProps = {
  items: ReceiptItem[];
  total: number;
};

/** 상품명/수량/금액 목록과 합계를 보여주는 영수증 카드. */
function Receipt({ items, total }: ReceiptProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.nameCell]}>상품명</Text>
        <Text style={[styles.headerCell, styles.quantityCell]}>수량</Text>
        <Text style={[styles.headerCell, styles.amountCell]}>금액</Text>
      </View>
      {items.map((item, index) => (
        <View
          key={`${item.name}-${index}`}
          style={[styles.row, index % 2 === 1 && styles.rowAlt]}
        >
          <Text style={[styles.cell, styles.nameCell]}>{item.name}</Text>
          <Text style={[styles.cell, styles.quantityCell]}>
            {item.quantity}
          </Text>
          <Text style={[styles.cell, styles.amountCell]}>
            {item.amount.toLocaleString()}원
          </Text>
        </View>
      ))}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>합계</Text>
        <Text style={styles.totalValue}>{total.toLocaleString()}원</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerCell: {
    fontSize: 12,
    color: '#868E96',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rowAlt: {
    backgroundColor: FILL_NEUTRAL,
  },
  cell: {
    fontSize: 13,
  },
  nameCell: {
    flex: 2,
  },
  quantityCell: {
    flex: 1,
    textAlign: 'center',
  },
  amountCell: {
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: LINK_BLUE,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: LINK_BLUE,
  },
});

export default Receipt;
