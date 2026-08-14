import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Divider from '../Divider/Divider';
import FolderTabShape from './FolderTabShape';
import {
  FEEDBACK_POSITIVE_BOLD,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../../constants/colors';

const CHEVRON_RIGHT_ICON = require('../../../assets/icons/nav/Chevron Right.png');

type ReportCardVariant = 'folder' | 'card';

type ReportCardProps = {
  title: string;
  dateRangeLabel?: string;
  income: number;
  expense: number;
  variant?: ReportCardVariant;
  onPress?: () => void;
};

/** 좌상단에 폴더 탭 모양(svg)이 붙는 리포트 카드. 수입/지출 요약을 보여준다. */
function ReportCard({
  title,
  dateRangeLabel,
  income,
  expense,
  variant = 'card',
  onPress,
}: ReportCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {variant === 'folder' && <FolderTabShape fill={FILL_NEUTRAL_SUBTLE} />}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {variant === 'folder' && dateRangeLabel && (
            <Text style={styles.dateRange}>{dateRangeLabel}</Text>
          )}
        </View>
        <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
      </View>
      <View style={styles.dividerWrapper}>
        <Divider />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>수입</Text>
        <Text style={styles.income}>+{income.toLocaleString()}원</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>지출</Text>
        <Text style={styles.expense}>-{expense.toLocaleString()}원</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  dateRange: {
    marginTop: 4,
    fontSize: 12,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  chevron: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_DISABLED,
  },
  dividerWrapper: {
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  income: {
    fontSize: 13,
    fontWeight: 'bold',
    color: FEEDBACK_POSITIVE_BOLD,
  },
  expense: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default ReportCard;
