import { Image, Pressable, StyleSheet, Text } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CALENDAR_ICON = require('../../../assets/icons/system/Calendar.png');

const PLACEHOLDER = 'YY.MM.DD';

type DateRangeFieldProps = {
  startDate?: string;
  endDate?: string;
  onPress: () => void;
  focused?: boolean;
};

function DateRangeField({
  startDate,
  endDate,
  onPress,
  focused = false,
}: DateRangeFieldProps) {
  return (
    <Pressable
      style={[styles.container, focused && styles.containerFocused]}
      onPress={onPress}
    >
      <Text style={[styles.text, startDate ? styles.textFilled : undefined]}>
        {startDate || PLACEHOLDER}
      </Text>
      <Text style={[styles.separator, startDate ? styles.textFilled : undefined]}>
        ~
      </Text>
      <Text style={[styles.text, endDate ? styles.textFilled : undefined]}>
        {endDate || PLACEHOLDER}
      </Text>
      <Image source={CALENDAR_ICON} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: BORDER_NEUTRAL_NORMAL,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
  },
  containerFocused: {
    borderColor: FOREGROUND_SECONDARY,
  },
  text: {
    ...TYPOGRAPHY.body2,
    flex: 1,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  separator: {
    ...TYPOGRAPHY.body2,
    marginHorizontal: 8,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  textFilled: {
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  icon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default DateRangeField;
