import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FILL_NEUTRAL, TEXT_MUTED } from '../../constants/colors';

type SegmentedControlOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** 여러 옵션 중 하나만 고르는 가로 세그먼트 컨트롤. */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.segment, selected && styles.segmentSelected]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: FILL_NEUTRAL,
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentSelected: {
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  labelSelected: {
    fontWeight: 'bold',
    color: '#212529',
  },
});

export default SegmentedControl;
