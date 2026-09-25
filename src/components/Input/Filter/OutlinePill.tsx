import { Pressable, StyleSheet, Text } from 'react-native';
import {
  FILL_DISABLED,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type OutlinePillProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function OutlinePill({ label, active, onPress }: OutlinePillProps) {
  return (
    <Pressable style={[styles.pill, active ? styles.pillActive : styles.pillInactive]} onPress={onPress}>
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillActive: {
    borderWidth: 1,
    borderColor: FOREGROUND_SECONDARY,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
  },
  pillInactive: {
    backgroundColor: FILL_DISABLED,
  },
  label: {
    ...TYPOGRAPHY.body2,
  },
  labelActive: {
    color: FOREGROUND_SECONDARY,
    fontWeight: 'bold',
  },
  labelInactive: {
    color: FOREGROUND_DISABLED,
  },
});

export default OutlinePill;
