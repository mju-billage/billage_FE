import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BORDER_NEUTRAL, LINK_BLUE, TEXT_MUTED } from '../../constants/colors';

const CALENDAR_ICON = require('../../assets/icons/system/Calendar.png');

type DateFieldProps = {
  startDate?: string;
  endDate?: string;
  onPress: () => void;
  placeholder?: string;
  focused?: boolean;
};

/** 시작일~종료일 기간을 선택하는 트리거 필드. 탭하면 캘린더가 열리는 것을 전제로 한다. */
function DateField({
  startDate,
  endDate,
  onPress,
  placeholder = 'YY.MM.DD',
  focused = false,
}: DateFieldProps) {
  const hasValue = Boolean(startDate && endDate);

  return (
    <Pressable
      style={[styles.container, focused && styles.containerFocused]}
      onPress={onPress}
    >
      <View style={styles.textRow}>
        <Text style={[styles.text, !hasValue && styles.placeholder]}>
          {hasValue ? startDate : placeholder}
        </Text>
        <Text style={styles.separator}>~</Text>
        <Text style={[styles.text, !hasValue && styles.placeholder]}>
          {hasValue ? endDate : placeholder}
        </Text>
      </View>
      <Image source={CALENDAR_ICON} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  containerFocused: {
    borderColor: LINK_BLUE,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: LINK_BLUE,
  },
  placeholder: {
    color: TEXT_MUTED,
    fontWeight: 'normal',
  },
  separator: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: '#868E96',
  },
});

export default DateField;
