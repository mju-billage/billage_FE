import { Image, StyleSheet, Text, View } from 'react-native';
import Divider from '../Divider/Divider';
import FolderTabShape from './FolderTabShape';
import CardBase from './CardBase';
import { formatWon } from '../../../utils/currency';
import {
  FEEDBACK_POSITIVE_BOLD,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

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
    <CardBase onPress={onPress}>
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
        <Text style={styles.income}>+{formatWon(income)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>지출</Text>
        <Text style={styles.expense}>-{formatWon(expense)}</Text>
      </View>
    </CardBase>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...TYPOGRAPHY.subtitle3,
  },
  dateRange: {
    ...TYPOGRAPHY.body3,
    marginTop: 4,
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
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  // 12px+Bold 조합은 정식 스타일에 없어 body3+bold를 예외로 채택.
  income: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FEEDBACK_POSITIVE_BOLD,
  },
  expense: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
  },
});

export default ReportCard;
