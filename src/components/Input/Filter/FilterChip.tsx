import { Image, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const PLUS_ICON = require('../../../assets/icons/action/Plus.png');

type FilterChipProps = {
  label: string;
  onPress: () => void;
  active?: boolean;
  showIcon?: boolean;
  style?: StyleProp<ViewStyle>;
};

function FilterChip({
  label,
  onPress,
  active = false,
  showIcon = true,
  style,
}: FilterChipProps) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive, style]}
      onPress={onPress}
    >
      {showIcon && (
        <Image
          source={PLUS_ICON}
          style={[styles.icon, active && styles.iconActive]}
        />
      )}
      <Text style={[styles.label, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 8,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
  },
  chipActive: {
    borderColor: FOREGROUND_SECONDARY,
  },
  icon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  iconActive: {
    tintColor: FOREGROUND_SECONDARY,
  },
  label: {
    ...TYPOGRAPHY.chips,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  textActive: {
    color: FOREGROUND_SECONDARY,
  },
});

export default FilterChip;
