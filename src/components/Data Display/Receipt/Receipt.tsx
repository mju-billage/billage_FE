import { StyleSheet, Text, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';

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
    <View>
      <View style={styles.headerBox}>
        <Text style={[styles.headerCell, styles.nameCell]}>상품명</Text>
        <Text style={[styles.headerCell, styles.quantityCell]}>수량</Text>
        <Text style={[styles.headerCell, styles.amountCell]}>금액</Text>
      </View>
      <View style={styles.itemsBox}>
        {items.map((item, index) => (
          <View key={`${item.name}-${index}`} style={styles.row}>
            <Text style={[styles.cell, styles.nameCell]}>{item.name}</Text>
            <Text style={[styles.cell, styles.quantityCell]}>
              {item.quantity}
            </Text>
            <Text style={[styles.cell, styles.amountCell]}>
              {item.amount.toLocaleString()}원
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.footerBox}>
        <Text style={styles.totalLabel}>합계</Text>
        <Text style={styles.totalValue}>{total.toLocaleString()}원</Text>
      </View>
    </View>
  );
}

const RADIUS = 16;

const styles = StyleSheet.create({
  headerBox: {
    flexDirection: 'row',
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderRadius: RADIUS,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerCell: {
    fontSize: 13,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  itemsBox: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderRadius: RADIUS,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: BORDER_NEUTRAL_NORMAL,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  cell: {
    fontSize: 16,
    fontWeight: 'bold',
    color: FOREGROUND_PRIMARY,
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
  footerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderRadius: RADIUS,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: BORDER_NEUTRAL_NORMAL,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: FOREGROUND_SECONDARY,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: FOREGROUND_SECONDARY,
  },
});

export default Receipt;
