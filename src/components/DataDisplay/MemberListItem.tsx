import { Pressable, StyleSheet, Text, View } from 'react-native';
import CheckBox from '../Selection/CheckBox';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
} from '../../constants/colors';

type MemberListItemProps = {
  name: string;
  amount?: number;
  showAmount?: boolean;
  showCheckbox?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

/** 체크박스 + 이름 + 금액으로 구성된 모임원 목록 행. */
function MemberListItem({
  name,
  amount,
  showAmount = true,
  showCheckbox = true,
  selected = false,
  disabled = false,
  onPress,
}: MemberListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && styles.rowPressed,
        disabled && styles.rowDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.leftGroup}>
        {showCheckbox && (
          <CheckBox
            checked={selected}
            onToggle={onPress ?? (() => {})}
            disabled={disabled}
          />
        )}
        <Text style={[styles.name, disabled && styles.nameDisabled]}>
          {name}
        </Text>
      </View>
      {showAmount && amount != null && (
        <Text style={styles.amount}>{amount.toLocaleString()}원</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowPressed: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontSize: 14,
  },
  nameDisabled: {
    color: FOREGROUND_DISABLED,
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MemberListItem;
