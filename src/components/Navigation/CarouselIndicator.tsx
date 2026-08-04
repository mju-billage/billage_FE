import { StyleSheet, View } from 'react-native';
import { LINK_BLUE } from '../../constants/colors';

type CarouselIndicatorProps = {
  count: number;
  selectedIndex: number;
};

/** 캐러셀/슬라이드의 현재 페이지 위치를 보여주는 점 인디케이터. */
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CED4DA',
  },
  dotSelected: {
    backgroundColor: LINK_BLUE,
  },
});

export default CarouselIndicator;
