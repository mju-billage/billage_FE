import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_NORMAL,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CLOSE_ICON = require('../../../assets/icons/action/Close.png');

type ChipProps = {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
};

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
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    ...TYPOGRAPHY.chips,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  icon: {
    width: 12,
    height: 12,
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
});

export default Chip;
