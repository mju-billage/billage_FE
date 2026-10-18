import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CHEVRON_ICON = require('../../../assets/icons/nav/Chevron Right.png');

type DetailFieldRowProps = {
  label: string;
  value: string;
  /** value 가 비었을 때 대신 보여줄 문구(선택). */
  valuePlaceholder?: string;
  onPress?: () => void;
  disabled?: boolean;
};

function DetailFieldRow({
  label,
  value,
  valuePlaceholder,
  onPress,
  disabled,
}: DetailFieldRowProps) {
  const displayValue = value || valuePlaceholder || value;

  if (onPress) {
    return (
      <Pressable style={styles.row} onPress={onPress}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{displayValue}</Text>
          <Image source={CHEVRON_ICON} style={styles.chevron} />
        </View>
      </Pressable>
    );
  }
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{displayValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  label: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  value: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_PRIMARY,
    flexShrink: 1,
    textAlign: 'right',
  },
  chevron: {
    width: 14,
    height: 14,
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
});

export default DetailFieldRow;
