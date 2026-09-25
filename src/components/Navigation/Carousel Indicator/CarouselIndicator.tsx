import { StyleSheet, View } from 'react-native';
import {
  FOREGROUND_DISABLED,
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
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: FOREGROUND_DISABLED,
  },
  dotSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FOREGROUND_SECONDARY,
  },
});

export default CarouselIndicator;
