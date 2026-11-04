import { StyleSheet, View } from 'react-native';
import {
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';

type CarouselIndicatorProps = {
  count: number;
  selectedIndex: number;
};

function CarouselIndicator({ count, selectedIndex }: CarouselIndicatorProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[styles.dot, index === selectedIndex && styles.dotSelected]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  dotSelected: {
    backgroundColor: FOREGROUND_SECONDARY,
  },
});

export default CarouselIndicator;
