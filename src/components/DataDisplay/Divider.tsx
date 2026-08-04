import { StyleSheet, View } from 'react-native';
import { BORDER_NEUTRAL } from '../../constants/colors';

type DividerOrientation = 'horizontal' | 'vertical';
type DividerVariant = 'full-width' | 'inset' | 'thick';

type DividerProps = {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
};

/** 콘텐츠를 구분하는 얇은 선. 가로/세로, full-width/inset/thick 스타일을 지원한다. */
function Divider({
  orientation = 'horizontal',
  variant = 'full-width',
}: DividerProps) {
  const isVertical = orientation === 'vertical';
  const thickness = variant === 'thick' ? 4 : 1;

  return (
    <View
      style={[
        isVertical ? styles.vertical : styles.horizontal,
        variant === 'inset' &&
          (isVertical ? styles.insetVertical : styles.insetHorizontal),
        isVertical ? { width: thickness } : { height: thickness },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
    backgroundColor: BORDER_NEUTRAL,
  },
  vertical: {
    height: '100%',
    backgroundColor: BORDER_NEUTRAL,
  },
  insetHorizontal: {
    marginHorizontal: 24,
    width: undefined,
  },
  insetVertical: {
    marginVertical: 12,
    height: undefined,
  },
});

export default Divider;
