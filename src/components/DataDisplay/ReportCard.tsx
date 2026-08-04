import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FEEDBACK_POSITIVE_BOLD,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';

const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/ChevronRight.png');

type ReportCardVariant = 'folder' | 'card';

type ReportCardProps = {
  title: string;
  dateRangeLabel?: string;
  income: number;
  expense: number;
  variant?: ReportCardVariant;
  onPress?: () => void;
};

/** 좌상단이 접힌 폴더탭 모양의 리포트 카드. 수입/지출 요약을 보여준다. */
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
      {variant === 'folder' && <View style={styles.folderTab} />}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {dateRangeLabel && (
            <Text style={styles.dateRange}>{dateRangeLabel}</Text>
          )}
        </View>
        <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
      </View>
      <View style={styles.divider} />
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
  folderTab: {
    position: 'absolute',
    top: -6,
    left: 16,
    width: 32,
    height: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
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
  divider: {
    height: 1,
    backgroundColor: BORDER_NEUTRAL_NORMAL,
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
