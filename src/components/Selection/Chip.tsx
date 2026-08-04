import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { FILL_NEUTRAL } from '../../constants/colors';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');

type ChipProps = {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
};

/** 제거 가능한 알약형 태그 칩. */
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
    gap: 6,
    backgroundColor: FILL_NEUTRAL,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    color: '#495057',
  },
  icon: {
    width: 12,
    height: 12,
    tintColor: '#868E96',
  },
});

export default Chip;
