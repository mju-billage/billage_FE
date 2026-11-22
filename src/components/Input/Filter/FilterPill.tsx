import { Pressable, StyleSheet, Text } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type FilterPillProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function FilterPill({ label, active, onPress }: FilterPillProps) {
  return (
    <Pressable
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
    >
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1.5,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pillActive: {
    borderColor: FOREGROUND_SECONDARY,
  },
  pillLabel: {
    ...TYPOGRAPHY.button,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  pillLabelActive: {
    color: FOREGROUND_SECONDARY,
  },
});

export default FilterPill;
