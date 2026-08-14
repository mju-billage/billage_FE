import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../../constants/colors';

const CLOSE_ICON = require('../../../assets/icons/action/Close.png');

type ChipProps = {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
};

/** 제거 가능한 태그 칩. */
function Chip({ label, removable = true, onRemove }: ChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
      {removable && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Image source={CLOSE_ICON} style={styles.icon} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  icon: {
    width: 12,
    height: 12,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default Chip;
