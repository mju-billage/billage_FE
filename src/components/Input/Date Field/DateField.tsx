import { Pressable, StyleSheet, Text, View } from 'react-native';
import Divider from '../../Data Display/Divider/Divider';
import {
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type DateFieldProps = {
  startDate?: string;
  endDate?: string;
  onPress: () => void;
  placeholder?: string;
};

/** 시작일~종료일을 두 컬럼으로 보여주는 요약 필드. 탭하면 캘린더가 열리는 것을 전제로 한다. */
function DateField({
  startDate,
  endDate,
  onPress,
  placeholder = 'YY.MM.DD',
}: DateFieldProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.dividerWrapper}>
        <Divider />
      </View>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>시작 날짜</Text>
          <Text style={styles.value}>{startDate || placeholder}</Text>
        </View>
        <View style={[styles.column, styles.columnEnd]}>
          <Text style={styles.label}>종료 날짜</Text>
          <Text style={styles.value}>{endDate || placeholder}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  dividerWrapper: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    alignItems: 'flex-start',
  },
  columnEnd: {
    alignItems: 'flex-end',
  },
  label: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginBottom: 8,
  },
  value: {
    ...TYPOGRAPHY.h2,
    color: FOREGROUND_SECONDARY,
  },
});

export default DateField;
