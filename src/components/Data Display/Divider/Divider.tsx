import { StyleSheet, View } from 'react-native';
import { BORDER_NEUTRAL_NORMAL } from '../../../constants/colors';

type DividerOrientation = 'horizontal' | 'vertical';
type DividerVariant = 'full-width' | 'inset' | 'thick' | 'dashed';

type DividerProps = {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
};

function Divider({
  orientation = 'horizontal',
  variant = 'full-width',
}: DividerProps) {
  const isVertical = orientation === 'vertical';
  const thickness = variant === 'thick' ? 4 : 1;

  if (variant === 'dashed') {
    return <View style={styles.dashed} />;
  }

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
    backgroundColor: BORDER_NEUTRAL_NORMAL,
  },
  vertical: {
    flex: 1,
    backgroundColor: BORDER_NEUTRAL_NORMAL,
  },
  insetHorizontal: {
    marginHorizontal: 24,
    width: undefined,
  },
  insetVertical: {
    marginVertical: 12,
    height: undefined,
  },
  dashed: {
    width: '100%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: BORDER_NEUTRAL_NORMAL,
  },
});

export default Divider;
